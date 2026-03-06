# คู่มือการใช้งาน To-Do List + LINE Bot

## สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การใช้งาน Web App](#การใช้งาน-web-app)
   - [จัดการโปรเจค](#1-จัดการโปรเจค)
   - [จัดการ Task](#2-จัดการ-task)
   - [จัดการ Sub-task](#3-จัดการ-sub-task)
   - [การตั้งค่าการพึ่งพา (Dependency)](#4-การตั้งค่าการพึ่งพา-dependency)
   - [Progress ของ Task](#5-progress-ของ-task)
3. [การตั้งค่า LINE Bot](#การตั้งค่า-line-bot)
4. [การแจ้งเตือนผ่าน LINE](#การแจ้งเตือนผ่าน-line)
5. [คำอธิบายสถานะ](#คำอธิบายสถานะ)
6. [ค่าใช้จ่าย](#ค่าใช้จ่าย)

---

## ภาพรวมระบบ

ระบบนี้เป็น **Web App สำหรับจัดการงาน (To-Do List)** ที่มี **LINE Bot แจ้งเตือน** อัตโนมัติ

โครงสร้างข้อมูล:
```
Project (โปรเจค)
  └── Task (งาน)
        └── Sub-task (งานย่อย)
```

แต่ละ Task/Sub-task จะมี:
- **สถานะ**: Todo / Doing / Done
- **Deadline**: วันกำหนดส่ง + แสดงจำนวนวันที่เหลือ (ติดลบหากเลยกำหนด)
- **Dependency**: ตั้งให้ "Depends on Task/Sub-task อื่น" ได้ (ทั้ง Task และ Sub-task)

---

## การใช้งาน Web App

### 1. จัดการโปรเจค

#### สร้างโปรเจคใหม่
1. คลิก **"+ New Project"** ที่หน้าแรก หรือหน้า All Projects
2. กรอก **Project Name** (จำเป็น) และ **Description** (ไม่จำเป็น)
3. กด **"Create Project"**

#### ดูภาพรวมโปรเจค
- หน้า **"All Projects"** จะแสดง:
  - ชื่อและรายละเอียดโปรเจค
  - **Completion %** (แถบ progress bar)
  - จำนวน: **Todo** / **Doing** / **Done**

#### แก้ไข/ลบโปรเจค
- เข้าหน้าโปรเจค → กด **"Edit"** เพื่อเปลี่ยนชื่อ/รายละเอียด
- กด **"Delete Project"** เพื่อลบ (จะลบ Task และ Sub-task ทั้งหมดด้วย)

---

### 2. จัดการ Task

#### เพิ่ม Task ใหม่
1. เข้าหน้าโปรเจค → กด **"+ Add Task"**
2. กรอกข้อมูล:
   - **Task Name** (จำเป็น)
   - **Description**
   - **Deadline**
   - **Status** (Todo / Doing / Done)
   - **Depends on Task** (เลือก Task ที่ต้องรอ)
   - **Depends on Sub-task** (เลือก Sub-task ที่ต้องรอ)
3. ติ๊ก **"Has Sub-tasks"** ถ้าต้องการเพิ่มงานย่อย
4. กด **"Create Task"**

#### เปลี่ยนสถานะ Task
- ในหน้าโปรเจค → ใช้ **dropdown สถานะ** ข้าง Task → เลือก Todo/Doing/Done

#### แก้ไข Task
- กด Task → กด **"Edit this Task"**
- สามารถแก้ไข: ชื่อ, รายละเอียด, Deadline, สถานะ, **Depends on Task**, **Depends on Sub-task**

#### ลบ Task
- กด **"Delete"** ข้าง Task (จะลบ Sub-task ทั้งหมดของ Task นี้ด้วย)

---

### 3. จัดการ Sub-task

#### เพิ่ม Sub-task
**วิธีที่ 1**: ตอนสร้าง Task ใหม่ → ติ๊ก "Has Sub-tasks" → เพิ่มได้ทันที

**วิธีที่ 2**: ในหน้าโปรเจค → กด **"+ Add Sub-task"** ใต้ Task ที่ต้องการ
- กรอก: Sub-task name, Description, Deadline
- **เลือก Dependency**: Depends on Task หรือ Depends on Sub-task (ถ้ามี)
- กด **"Add"**

#### เปลี่ยนสถานะ/ลบ Sub-task
- ใช้ dropdown สถานะ หรือปุ่ม Delete

---

### 4. การตั้งค่าการพึ่งพา (Dependency)

ทั้ง **Task** และ **Sub-task** สามารถตั้ง Dependency ได้:

#### สำหรับ Task:
- ตอนสร้างหรือแก้ไข Task → เลือก:
  - **"Depends on Task"** → เลือก Task ที่ต้องรอ
  - **"Depends on Sub-task"** → เลือก Sub-task ที่ต้องรอ

#### สำหรับ Sub-task:
- ตอนเพิ่ม Sub-task → เลือก:
  - **"Depends on Task"** → เลือก Task ที่ต้องรอ
  - **"Depends on Sub-task"** → เลือก Sub-task ที่ต้องรอ

ข้อความ Dependency จะแสดงในหน้าโปรเจค เช่น:
- `Depends on Task: Design Mockup`
- `Depends on Sub-task: Data Analysis`

---

### 5. Progress ของ Task

แต่ละ Task ที่มี Sub-task จะแสดง **progress bar** เฉพาะของ Task นั้น:
- แสดง: `Sub-tasks: 2/5 done (40%)`
- มี progress bar เล็กๆ แสดงสัดส่วน Done
- คำนวณจาก: จำนวน Sub-task ที่ Done / จำนวน Sub-task ทั้งหมด

---

## การตั้งค่า LINE Bot

### 1. เพิ่ม Bot เข้ากลุ่ม LINE

1. สแกน QR Code ของ Bot (จากหน้า LINE Developers) เพื่อเพิ่มเป็นเพื่อน
2. สร้าง **กลุ่ม LINE** แล้ว **เชิญ Bot เข้ากลุ่ม** → ระบบลงทะเบียนอัตโนมัติ

**หรือเพิ่มด้วยตนเอง:**
1. ไปที่เมนู **"LINE Settings"** บน Web App
2. กรอก LINE Group ID และ Group Name → กด "Add"

### 2. ตั้งค่าแจ้งเตือน

ในหน้า **"LINE Settings"** → แต่ละกลุ่มเลือกได้:
- **Daily** - แจ้งเตือนทุกวัน
- **Every 3 Days** - แจ้งเตือนทุก 3 วัน
- **Weekly** - แจ้งเตือนสัปดาห์ละครั้ง

### 3. เลือกโปรเจคที่แจ้งเตือน

- กดที่ชื่อโปรเจค → **สีม่วง** = เปิดแจ้งเตือน, **สีเทา** = ปิด
- เลือกได้หลายโปรเจคต่อกลุ่ม

---

## การแจ้งเตือนผ่าน LINE

Bot จะส่งข้อความสรุปงานเข้ากลุ่ม LINE ตามความถี่ที่ตั้ง:

```
== To-Do List Summary ==

--- Website Redesign (33%) ---
Todo: 2 | Doing: 1 | Done: 1

[Todo] Design Mockup
   Deadline: Mar 15, 2026 (9 days left)

[Doing] Develop Frontend
   Deadline: Mar 20, 2026 (14 days left)
   Depends on Task: Design Mockup
   [Todo] Header Component (12 days left)
   [Done] Footer Component

[Done] Setup Repository
```

ข้อมูลที่แสดง:
- **ชื่อโปรเจค** พร้อม **Completion %**
- จำนวน Todo / Doing / Done
- แต่ละ Task พร้อม **สถานะ**, **Deadline**, **จำนวนวันที่เหลือ**
- หากเลยกำหนด เช่น `3 days overdue`
- Sub-task แสดงเยื้องใต้ Task
- แสดง **"Depends on..."** หาก Task/Sub-task มี dependency

---

## คำอธิบายสถานะ

| สถานะ | ความหมาย | สี | ในข้อความ LINE |
|--------|---------|-----|---------------|
| **Todo** | ยังไม่ได้เริ่ม | สีเทา | [Todo] |
| **Doing** | กำลังทำอยู่ | สีฟ้า | [Doing] |
| **Done** | เสร็จเรียบร้อย | สีเขียว | [Done] |

### การคำนวณ Completion %
- นับ Task และ Sub-task **ทั้งหมด** ในโปรเจค
- `% = (จำนวน Done / จำนวนทั้งหมด) x 100`

### การนับวันที่เหลือ
- **5 days left** = ยังไม่ถึง deadline
- **Due today** = deadline คือวันนี้
- **3 days overdue** = เลย deadline ไป 3 วัน

---

## ค่าใช้จ่าย

| บริการ | ค่าใช้จ่าย | Free Tier |
|--------|-----------|-----------|
| **Vercel** (hosting) | **0 บาท** | 100 GB bandwidth, 2 cron jobs |
| **Neon PostgreSQL** (database) | **0 บาท** | 0.5 GB storage |
| **LINE Messaging API** | **0 บาท** | 500 messages/เดือน |
| **รวม** | **0 บาท/เดือน** | |

> LINE free tier มี 500 ข้อความ/เดือน เพียงพอสำหรับใช้ส่วนตัว
> (แจ้งเตือนทุกวัน 1 กลุ่ม = ประมาณ 30 ข้อความ/เดือน)
