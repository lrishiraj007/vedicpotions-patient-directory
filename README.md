# 🍃 VedicPotions Portal
> *The ultimate, real-time Patient Directory & Clinical Journal for your Ayurvedic practice.*

```
      /\_/\
    ( o.o )  - "Welcome to VedicPotions!"
     > ^ <
    /     \  
   |       | 
```

A mobile-first, dark-themed patient log and consultation directory crafted specifically for **two elite clinicians**. Built with **Next.js 15 (App Router)**, **Better Auth**, **Prisma ORM (v7)**, **Neon Serverless Postgres**, and **Pusher Channels** for telepathic real-time syncing.

---

## 🎮 Character Classes (Roles)
Your portal features role-based access control. Here are the playstyles:

| Class | Special Ability | Restricted Actions | Seed Account |
| :--- | :--- | :--- | :--- |
| **🧙‍♂️ Admin Mage** | Can manage clinician accounts, delete records, and cast direct db seeding spells. | *None* | `rishi@practice.com` (pw: `admin123`) |
| **🩺 Doctor Cleric** | Can record patient details, log visits, prescribe treatments, and update logs. | Cannot delete entries or manage user lists. | `doctor@practice.com` (pw: `doctor123`) |

---

## 🧪 Spells & Enchantments (Tech Stack)
*   **Next.js 15 (App Router):** Fast, React Server Components-powered wizardry.
*   **Better Auth:** Credentials auth with scrypt-hashed password shields.
*   **Prisma ORM (v7) + Neon Postgres:** Blazing-fast database queries.
*   **Pusher Channels:** Telepathic sync—when one healer edits a record on a phone, the other's laptop updates in real-time automatically!

---

## 🗺️ Visual Map of the Realm (Project Structure)
```
vedicpotions-patient-directory/
 ├── 📁 prisma/                 # Database blueprints
 │    ├── 📄 schema.prisma       # Schema definitions (no multi-tenant bloat!)
 │    └── 📄 seed.ts             # Direct credentials seeding logic
 ├── 📁 src/
 │    ├── 📁 app/
 │    │    ├── 📁 (protected)/   # Gated clinician views (Dashboard, Patients, Visits)
 │    │    │    └── 📄 loading.tsx # Elegant green-pulse glassmorphic screen
 │    │    ├── 📁 actions/       # Typed server functions (Zod checks inside)
 │    │    └── 📄 page.tsx       # Redesigned entry page (Rishi's Portal)
 │    ├── 📁 components/        # Layout elements (Nav, PusherSync)
 │    └── 📁 lib/               # Singletons (db connection, auth helpers)
```

---

## 🚀 Setup Quest: Run it Locally!

Follow these 4 simple steps to summon the portal locally:

### 🎒 Step 1: Gather your scrolls (Env Variables)
Create a `.env.development` file in the root of the project and populate it with:
```bash
# Neon Postgres urls
DATABASE_URL="your-neon-pooled-url"
DATABASE_URL_UNPOOLED="your-neon-direct-url"

# Better Auth url (local host)
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-better-auth-secret-key"

# Pusher telepathic synchronization keys
PUSHER_APP_ID="your-pusher-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"
```

### 📦 Step 2: Extract Mana (Install dependencies)
Open your terminal in the project directory and run:
```bash
npm install
```

### ⚡ Step 3: Align the Leylines (Generate Client & Seed DB)
Generate type-safe database schemas and seed the initial users (`rishi@practice.com` and `doctor@practice.com`):
```bash
# Push schema structure to Neon Postgres
npx prisma db push --force-reset

# Seed credentials accounts and diagnostic entries
npx prisma db seed
```

### 🌟 Step 4: Ignition! (Start Dev Server)
Ignite the server core to run locally:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser, log in with `rishi@practice.com` / `admin123`, and enter the portal!

---

## ⚡ Telepathic Syncing Details
1. When you create/edit/delete a patient or visit record, the server broadcasts a lightweight event on the `private-practice-updates` channel.
2. The active listener on the client side intercepts this and immediately triggers a **Next.js `router.refresh()`**.
3. All Server Components refresh in the background seamlessly—no page reloads, zero scroll-position loss!
