# FlashDrop ⚡

Ephemeral file and code snippet sharing across devices with zero friction, zero accounts, and 24-hour self-destruction.

---

### The Annoyance
* **What it is:** Moving snippets, commands, or files between nearby devices (phone to laptop, lab partner to lab partner) is clunky.
* **Who it annoys:** Students, lab partners, and developers working across multiple machines.
* **How we know:** Everyone defaults to self-emailing, spamming private Slack/Discord DMs, or texting themselves on WhatsApp just to transfer a terminal command or a PDF.

### Your Constraint
* **Constraint (PRN ending in 7):** *Forgetful — Everything is deleted after 24 hours.*
* **How it shaped the build:** Enforced strict 24-hour Time-To-Live (TTL) on all drops. No persistent storage, no user accounts, and an active live countdown timer on every drop so users know exactly when data self-destructs. Expired items are purged automatically.

### The Great Part
* **4-Digit PIN & Dynamic QR Code Flow:** Instant pairing without typing URLs. On mobile, just point the camera at the QR code; on a lab PC, punch 4 digits and the drop opens automatically on the 4th keystroke.

### The Two Testers
* **Tester 1 (Lab partner on desktop):** Got stuck waiting for a "Submit" button after typing the PIN.
  * *Fix:* Added auto-focus, automatic trigger on the 4th digit, and clearer input feedback.
* **Tester 2 (Mobile user):** Got confused trying to download raw code snippets onto mobile storage instead of copying them.
  * *Fix:* Split actions into distinct "Copy Snippet" with a visual confirmation toast and "Download File" for binary uploads.

### AI
* **What AI was used for:** Generating the responsive UI layout, countdown timer logic, and file upload state handling.
* **One thing it got wrong:** The initial QR code bundle crashed rendering with a blank screen; had to fix the QR component integration and add fallback rendering.

### Not Done
* **Syntax highlighting:** Code displays in a dark monospace block with a language label, but lacks multi-color syntax highlighting.
* **PIN brute-force protection:** 4-digit PINs offer 10,000 combinations without rate-limiting, suitable for non-sensitive transfers but not high-security data.
* **Scheduled server-side cron:** Drops expire passively when queried or created rather than via an active independent daemon.

### Run It Locally
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd flashdrop
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Start the development server:
   ```bash
   npm run dev
   ```
