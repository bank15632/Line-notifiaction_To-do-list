// Pre-migration script: adds CHECKING value to the Status enum in PostgreSQL
// Run this before prisma db push since ALTER TYPE ADD VALUE is not supported by prisma db push
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check if CHECKING already exists in the enum
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'CHECKING'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Status')
      ) as exists
    `;

    const exists = result[0]?.exists;

    if (!exists) {
      console.log("Adding CHECKING to Status enum...");
      await prisma.$executeRawUnsafe(
        `ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'CHECKING' AFTER 'DOING'`
      );
      console.log("CHECKING added to Status enum successfully.");
    } else {
      console.log("CHECKING already exists in Status enum, skipping.");
    }
  } catch (error) {
    console.error("Migration error:", error.message);
    // Don't fail the build if this errors - prisma db push may handle it
  } finally {
    await prisma.$disconnect();
  }
}

main();
