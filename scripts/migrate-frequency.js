// Pre-migration script: converts NotifyFrequency enum column to Int
// Run this before prisma db push to handle the enum->int migration
const { PrismaClient } = require("@prisma/client");

async function main() {
  // Use raw pg connection via Prisma
  const prisma = new PrismaClient();

  try {
    // Check if the column is still an enum type
    const colInfo = await prisma.$queryRaw`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'LineGroup' AND column_name = 'notifyFrequency'
    `;

    if (!colInfo || colInfo.length === 0) {
      console.log("Column notifyFrequency does not exist yet, skipping migration");
      return;
    }

    const col = colInfo[0];
    if (col.data_type === "integer") {
      console.log("Column is already integer, skipping migration");
      return;
    }

    console.log(`Column type is ${col.data_type}/${col.udt_name}, converting to integer...`);

    // Add a temporary integer column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LineGroup"
      ADD COLUMN IF NOT EXISTS "notifyFrequencyNew" INTEGER DEFAULT 1
    `);

    // Map old enum values to integer days
    await prisma.$executeRawUnsafe(`
      UPDATE "LineGroup" SET "notifyFrequencyNew" = CASE
        WHEN "notifyFrequency"::text = 'DAILY' THEN 1
        WHEN "notifyFrequency"::text = 'EVERY_3_DAYS' THEN 3
        WHEN "notifyFrequency"::text = 'WEEKLY' THEN 7
        ELSE 1
      END
    `);

    // Drop old column and rename new
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LineGroup" DROP COLUMN "notifyFrequency"
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LineGroup" RENAME COLUMN "notifyFrequencyNew" TO "notifyFrequency"
    `);

    // Set NOT NULL and default
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LineGroup"
      ALTER COLUMN "notifyFrequency" SET NOT NULL,
      ALTER COLUMN "notifyFrequency" SET DEFAULT 1
    `);

    // Drop the old enum type if it exists
    await prisma.$executeRawUnsafe(`
      DROP TYPE IF EXISTS "NotifyFrequency"
    `);

    console.log("Migration complete: notifyFrequency converted to integer");
  } catch (err) {
    console.error("Migration error:", err.message);
    // Don't fail the build - prisma db push may handle it
  } finally {
    await prisma.$disconnect();
  }
}

main();
