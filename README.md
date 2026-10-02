# ⚡ FlashDrop — Ephemeral File & Snippet Drop

> **Share a file, code snippet, or text instantly — no login, no clutter, and no permanent storage.**

🔗 **Live Demo:** https://flash-drop69.lovable.app

FlashDrop is a lightweight, ephemeral file and snippet-sharing application designed for students, developers, and lab partners who frequently need to move small pieces of information between devices.

Instead of emailing yourself, sending files through private chats, or creating temporary cloud-storage links, FlashDrop lets you create a temporary **drop**, protected by a **4-digit PIN** and accessible through a **dynamic QR code**.

Everything automatically expires after **24 hours**.

---

## 🎯 The Problem

Moving a single file, terminal command, code snippet, or PDF between devices can be surprisingly inconvenient.

Common workarounds include:

- Emailing files to yourself
- Sending messages to private WhatsApp/Telegram chats
- Uploading files to cloud storage
- Creating accounts just to share something temporarily
- Leaving unnecessary files and messages behind

This becomes especially annoying during college lab sessions, practicals, hackathons, and project collaboration.

**FlashDrop is designed around one simple idea:**

> If the data is only needed temporarily, why should it remain permanently?

---

## ✨ Features

### 🔢 4-Digit PIN Access

Each drop receives a short numeric PIN instead of a long, difficult-to-type URL or token.

### 📱 Dynamic QR Code

Generate a QR code for your drop and scan it directly from another device.

### 📄 Text & Code Snippet Sharing

Quickly transfer:

- Code snippets
- Terminal commands
- Notes
- URLs
- Small pieces of text

### 📁 File Sharing

Upload a file and access it from another device using the drop PIN.

### ⏳ 24-Hour Auto-Expiration

Every drop has a fixed **24-hour TTL**.

Once the TTL expires, the associated data is automatically removed.

### 🚫 No Login Required

There are no:

- User accounts
- Passwords
- Profiles
- Permanent dashboards
- Storage-management pages

The application is intentionally designed for **temporary sharing**, not permanent file storage.

### ⏱️ Live Expiration Countdown

Users can see how much time remains before the drop is deleted.

Example:

```text
23h 59m remaining
```

---

## 🔄 How It Works

```text
             CREATE DROP
                  │
                  ▼
       ┌─────────────────────┐
       │ Upload file / text  │
       └──────────┬──────────┘
                  │
                  ▼
          Generate 4-Digit PIN
                  │
                  ▼
          Generate Dynamic QR
                  │
          ┌───────┴───────┐
          ▼               ▼
       Enter PIN       Scan QR
          │               │
          └───────┬───────┘
                  ▼
            Access Drop
                  │
                  ▼
           24-Hour TTL
                  │
                  ▼
          Automatic Deletion
```

---

## 🔐 The 24-Hour Constraint

FlashDrop was built around **PRN 7 — Forgetful (24-Hour Self-Destruct)**.

This constraint significantly influenced the architecture.

Instead of building:

- Permanent user profiles
- File history
- Storage dashboards
- Long-term file management
- User-specific repositories

the application focuses on an automated **Time-To-Live (TTL)** lifecycle.

The intended lifecycle is:

```text
Create
  ↓
Store temporarily
  ↓
Access / Download
  ↓
24 hours
  ↓
Delete
```

This keeps the application focused on temporary data transfer rather than becoming another permanent storage platform.

---

## 🧪 User Testing

Two usability tests were conducted during development.

### Tester 1

**Problem:**

After creating a drop, the tester wasn't sure whether the content had been copied successfully or where to find the PIN.

**Changes made:**

- Added a prominent **"Copied!"** toast notification.
- Increased the size and visibility of the **4-digit PIN badge**.
- Made the access information more visually prominent.

---

### Tester 2

**Problem:**

The tester attempted to enter letters into the PIN field and wasn't sure how long the drop would remain available.

**Changes made:**

- Restricted PIN inputs to **numeric characters**.
- Added automatic focus to the PIN input.
- Added a visible **live countdown timer** showing the remaining lifetime.

These changes reduced ambiguity around both **access** and **expiration**.

---

## 🤖 AI-Assisted Development

AI tools were used during development for:

- Initial UI layout generation
- Tailwind CSS utility-class suggestions
- MongoDB TTL schema drafts
- General implementation assistance

### An Important Correction

The initial AI-generated approach suggested using browser `localStorage` to handle the 24-hour expiration.

That approach was not appropriate for the project because expiration needed to be enforced **server-side**, rather than relying on the user's browser.

The implementation was therefore changed to use backend-controlled expiration mechanisms involving **MongoDB TTL / server-side cleanup logic**.

This ensures that expiration is tied to the stored data rather than a particular browser or device.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Backend | Node.js / Express |
| Database | MongoDB |
| Expiration | MongoDB TTL / backend cleanup |
| QR Access | Dynamic QR generation |
| Deployment | Lovable |

> Update this table if your deployed implementation uses a different backend, storage provider, or framework.

---

## 🚧 Current Limitations

FlashDrop is intentionally simple, but there are currently some limitations.

### Single-Item Drops

A drop currently supports either:

- One file
- One text/code snippet

Multi-file uploads are not currently supported.

### No End-to-End Encryption

Files and text are stored in hosted/server-side storage while the drop is active.

They are **not currently encrypted client-side using end-to-end encryption**.

### 4-Digit PIN

A short PIN makes access extremely convenient, but it also provides a relatively small keyspace.

For production use, additional protections such as:

- Rate limiting
- Attempt limits
- Temporary lockouts
- Stronger access tokens

could be considered.

---

## 🔮 Future Improvements

Potential improvements include:

- [ ] Multi-file uploads
- [ ] Drag-and-drop file uploads
- [ ] End-to-end encryption
- [ ] PIN attempt rate limiting
- [ ] Stronger optional access tokens
- [ ] File preview
- [ ] Automatic clipboard copy
- [ ] Shareable temporary URLs
- [ ] Configurable expiration periods
- [ ] Download progress indicators
- [ ] Better mobile UX
- [ ] Self-hosting documentation

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js installed
- npm installed
- MongoDB instance
- Git installed

### Clone the Repository

```bash
git clone <your-repository-url>
cd flash-drop
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Add any additional environment variables required by your implementation.

### Start the Development Server

```bash
npm run dev
```

The application should then be available locally at:

```text
http://localhost:5000
```

> Adjust the command and port if your repository uses a different development setup.

---

## 🌐 Live Demo

Try FlashDrop here:

**https://flash-drop69.lovable.app**

---

## 📌 Project Philosophy

FlashDrop is intentionally **not** designed to compete with permanent cloud-storage platforms.

Its purpose is much narrower:

> **Move something from A to B, then forget about it.**

No account creation.  
No permanent file history.  
No unnecessary storage management.

Just create a drop, share it, use it, and let it disappear.

---

## 👨‍💻 Project

**FlashDrop**  
Ephemeral File & Snippet Sharing

Built as a project exploring temporary data storage, TTL-based cleanup, QR-based access, and usability-focused design.

---
