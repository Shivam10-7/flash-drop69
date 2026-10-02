# FlashDrop ⚡

**Ephemeral file and code snippet sharing across devices — zero friction, zero accounts, 24-hour self-destruction.**

🔗 **Live Demo:** https://flash-drop69.lovable.app

---

## The Annoyance

### What is it?

Moving snippets, commands, or files between nearby devices — such as a phone to a laptop or between lab partners — is unnecessarily clunky.

### Who does it annoy?

- Students
- Lab partners
- Developers working across multiple machines

### How do people solve it today?

People often resort to:

- Emailing files to themselves
- Sending messages to private Slack/Discord DMs
- Messaging themselves on WhatsApp

All just to transfer a terminal command, code snippet, or PDF.

---

## Your Constraint

### PRN Ending in 7 — **Forgetful**

The core constraint was simple:

> **Everything must be deleted after 24 hours.**

This shaped the entire architecture and user experience:

- Strict **24-hour TTL** on every drop
- No user accounts
- No permanent storage
- Live countdown timer showing exactly when a drop expires
- Expired items are automatically purged when the system encounters them

The goal is intentional ephemerality: **share it, use it, forget it.**

---

## The Great Part 🚀

### 4-Digit PIN + Dynamic QR Code Flow

FlashDrop provides two fast ways to access a shared drop.

#### 📱 Mobile — Scan & Go

Point your phone's camera at the dynamically generated QR code and open the drop instantly.

#### 💻 Desktop — 4-Digit PIN

On a lab PC or another device:

1. Enter the 4-digit PIN.
2. The interface automatically detects the fourth digit.
3. The drop opens immediately — no submit button required.

This keeps the transfer flow fast when moving data between nearby devices.

---

## The Two Testers

Real testing exposed two usability problems.

### Tester 1 — Lab Partner on Desktop

**Problem:**  
The tester entered the PIN but waited for a **Submit** button.

**Fix:**

- Added automatic input focus
- Triggered submission automatically after the 4th digit
- Added clearer input feedback

**Result:** The PIN flow became effectively one-step.

---

### Tester 2 — Mobile User

**Problem:**  
The tester tried to download raw code snippets to mobile storage instead of simply copying them.

**Fix:**

Separated the actions into two clearly defined operations:

- **Copy Snippet** — copies code directly to the clipboard and displays a confirmation toast
- **Download File** — downloads binary/file uploads

This makes the intended action clearer depending on the type of content being shared.

---

## AI Usage 🤖

AI was used during development to assist with:

- Responsive UI layout generation
- Countdown timer logic
- File upload state management
- Component implementation

### One Thing AI Got Wrong

The initial QR-code integration caused the application to render a blank screen.

The issue required manually fixing the QR component integration and adding fallback rendering to prevent the application from failing completely.

---

## Not Done Yet

### Syntax Highlighting

Code currently appears in a dark monospace block with a language label.

Multi-color syntax highlighting has not yet been implemented.

### PIN Brute-Force Protection

A 4-digit PIN provides **10,000 possible combinations**.

Without rate limiting, this is suitable for convenient, non-sensitive transfers but should **not** be treated as a high-security authentication mechanism.

### Scheduled Server-Side Cron

Drops currently expire passively when they are queried or created rather than through an independent scheduled cleanup daemon.

---

## Run It Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd flashdrop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available through the local development URL provided by Vite.

---

## 🌐 Live Demo

Try FlashDrop here:

**https://flash-drop69.lovable.app**

---

## Core Idea

FlashDrop is built around one principle:

> **Transfer it. Use it. Forget it.**

No accounts.  
No unnecessary messaging.  
No permanent drops.

Just a fast way to move files and snippets between devices before they disappear.
