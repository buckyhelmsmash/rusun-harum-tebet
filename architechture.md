# 🏢 Project Blueprint: Rusun Harum Tebet Management System

## 1. Project Overview
A specialized Property Management & Billing System for **Rusun Harum Tebet**. The system uses a "No-Account" architecture where residents access their data via **Magic Links** (Access Tokens) and verify their identity using their **KTP Number** as a PIN.

## 2. Technical Stack
* **Framework:** Next.js (App Router) - *Single repo handling both FE and API routes.*
* **UI/Styling:** Tailwind CSS + shadcn/ui
* **State/Forms:** @tanstack/react-query, @tanstack/react-form
* **Linting/Formatting:** Biome (Replacing ESLint/Prettier)
* **Database & Auth:** Appwrite - *Already Connected*
* **Messaging:** Watzap (Meta-verified WhatsApp Gateway)
* **Payment Automation:** Moota.co (BCA Mutation Bot via Webhooks)

---

## 3. Appwrite Database Schema (Completed)

### 🏗️ Units (The Core)
* `block` (Req String), `floor` (Req Int), `unitNumber` (Req Int), `displayId` (Req String, e.g., "A-408")
* **Relationships:** `owner` (Many-to-One), `tenant` (Many-to-One), `vehicles` (One-to-Many).
* **Logic:** `occupancyStatus` (Enum: owner_occupied, rented, vacant), `billRecipient` (Enum: owner, tenant).

### 👤 Owners
* `fullName`, `phoneNumber`, `ktpNumber` (16 digits), `email` (Opt), `dateOfBirth`.
* **Relationship:** `units` (One-to-Many -> Units). *(An owner can own multiple units).*

### 👥 Tenants
* `fullName`, `phoneNumber`, `ktpNumber` (16 digits), `email` (Opt), `dateOfBirth`.
* **Relationship:** `units` (One-to-Many -> Units). *(A tenant can rent multiple units).*

### 🚗 Vehicles
* `licensePlate` (Indexed), `type`, `brand`.
* **Relationship:** `unit` (Many-to-One -> Units).

### 🧾 Invoices (Monthly Billing)
* `period`, `status` (paid, unpaid), `dueDate`, `payDate` (Opt).
* **Money:** `iplFee`, `waterFee`, `vehicleFee`, `arrears`, `uniqueCode` (3-digit), `totalDue`.
* **Access:** `accessToken` (Magic Link string).
* **Relationship:** `unit` (Many-to-One -> Units).

### 📰 News (Announcements & Portal)
* `title` (Req String, Max 255), `content` (Req String, Size 65000).
* `summary` (Req String, Size 500).
* `coverImageId` (Opt String, Size 255) - *Stores Appwrite Storage file ID.*
* `publishedDate` (Opt Datetime), `isPublished` (Req Boolean, default false).

---

## 4. Architecture & Logic Guidelines

* **Single Project Structure:** We are utilizing Next.js API Routes (`/app/api`) to act as a secure proxy to interact with Appwrite Server SDK, Watzap, and to receive webhooks. Do not create a separate backend project.
* **Moota Webhook (`/api/webhook/moota`):** Matches incoming BCA credit mutations against `Invoices.totalDue` (which includes the unique code) where `status == unpaid`.
* **Resident Portal (`/invoice/[accessToken]`):** Fetches invoice data. Requires KTP validation against the associated unit to view sensitive history.

---

## 5. Current Status & Next Steps for Antigravity Agent
**Status:** The Next.js repository is initialized with Biome, and Appwrite is connected. 

**Immediate Tasks for Agent:**
1.  Initialize `shadcn/ui` in the project and install standard components (Button, Input, Form, Card, Table).
2.  Install `@tanstack/react-query` and `@tanstack/react-form` and set up the global QueryClient provider.
3.  Scaffold the `/app/api/webhook/moota/route.ts` API endpoint.
4.  Scaffold the frontend UI for the `/invoice/[accessToken]/page.tsx` dynamic page using shadcn components.
5.  Create a `src/lib/appwrite.ts` file to properly export both the Client (browser) and Server (Node.js) Appwrite instances.