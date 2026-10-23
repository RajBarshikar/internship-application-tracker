# 📱 InternTrack — Mobile Internship Application Tracker & AI Assistant
### Specially crafted for **Shravani Chetan Tilwankar**

A fast, lightweight, and modern application tracker tailored specifically for mobile and desktop use. Designed for pharmacy, digital health, and research students to effortlessly keep track of applications, prioritize leads, generate customized cold-outreach emails, and showcase a full portfolio.

---

## 🌟 Key Features

### 1. 🌓 Simple Light & Dark Theme
- Toggle with one tap via the Sun/Moon icon in the top header.
- Automatically persists your theme preference (`localStorage`).
- Carefully tuned contrast with soft slate tones for comfortable viewing at night and crisp readability in sunlight.

### 2. 🧭 Mobile-First Ergonomic Navigation
- **Fixed Bottom Navigation Bar**: Adapted for one-handed mobile thumb access with safe-area support for modern iOS & Android devices.
- **Center Floating "+" Button**: Instant access to add a new company application.
- **Left Tab — Applications (Saved Lists Section)**: View and organize all your applied positions with 1 tap.
- **Right Tab — AI-Powered Email**: Role-based tailored email generator with instant synthesis.
- **Top-Right Profile Icon**: Tap the avatar in the top right to view Shravani's full CV portfolio website.

### 3. 📝 Quick Add Application Form (Center "+" Button)
- **Company Name**: Smart autocomplete chips for prominent health, pharma, and global health organizations (CHRI, PATH, GSK, WHO, IQVIA, Abbott, Sun Pharma, Cipla, etc.).
- **Job Role**: Auto-suggestions tailored to Shravani's domain (Digital Health Intern, AMR Research Intern, Product Development Intern, etc.).
- **Date & Time of Application**: Automatically defaults to current date/time with a native picker.
- **Possibility? (High, Medium, Low)**:
  - 🟢 **High** — Denoted in vivid Green (`#10b981`)
  - 🟡 **Medium** — Denoted in warm Yellow (`#f59e0b`)
  - 🔴 **Low** — Denoted in soft Red (`#ef4444`)
- Optional fields: Application URL, recruiter contact details, and follow-up notes.

### 4. ⏱️ Saved Applications List & Sorting
- **Sort by Time Since Application**:
  - Displays precise relative time down to hours and minutes (e.g., `Applied 3h 15m ago`, `Applied 1d 4h ago`, `Applied 12d ago`).
  - Also displays the exact application timestamp.
  - Sort options:
    - *Days since: Newest first* (least time elapsed)
    - *Days since: Oldest first* (most time elapsed)
    - *Possibility: High → Low* (Green first)
    - *Possibility: Low → High* (Red first)
    - *Company Name: A to Z*
- **Search & Quick Filters**:
  - Instant search across company names, roles, and notes.
  - Filter by possibility status (All, High, Medium, Low).
- **Direct Card Actions**:
  - ✉️ **AI Email**: Jump straight to the AI generator with this company and role pre-filled!
  - ✏️ **Edit**: Update date, possibility, status, or notes.
  - 🗑️ **Delete**: Remove an entry with confirmation.

### 5. 🤖 AI-Powered Email Generation Section
- **Context-Aware Synthesis**: Deeply integrates Shravani's CV background:
  - Final-year Bachelor of Pharmacy (MVP Samaj's College of Pharmacy)
  - Co-developer of **AMR-Guard** (Awarded **2nd Place Nationwide** at the AMR Innovation Challenge by **CHRI, PATH, and GSK**)
  - Certified in **WHO Good Reliance Practices (GRPa)**
  - Certified in **Google Prompt Engineering**
  - 1-Year Leadership tenure with **IPA-SF Maharashtra**
- **How to use**:
  1. Enter the role name (e.g. `Digital Health Intern` or pick from quick chips).
  2. Optionally add company name and contact name.
  3. Select your angle/tone:
     - 🚀 *High-Impact Cold Outreach* (Highlights AMR-Guard & National Award)
     - 🔬 *Research & AMR Focus* (Literature reviews & stewardship)
     - 📱 *Digital Health & Product* (AI prompts & workflows)
     - ⚡ *Short & Punchy LinkedIn InMail* (Quick 150-word note)
     - 📅 *Polite Follow-Up* (Status inquiry on submitted applications)
  4. Generates multiple catchy subject lines + complete editable email body.
  5. 📋 **One-click Copy** or ✉️ **Open directly in Gmail / Mail client** (`mailto:`).

### 6. 👤 Top-Right Profile Icon — Full CV Portfolio Website
Click the **ST** avatar in the top-right corner to open a full portfolio sheet:
- **Hero & Contact**: Direct links to call `+91 9265230327`, email `shravanitilwankar2005@gmail.com`, and LinkedIn profile.
- **Executive Summary**: Her complete professional bio & career objective.
- **Featured Award**: 🏆 2nd Place Nationwide AMR Innovation Challenge.
- **Experience**: AMR-Guard at Nexus T-Gen Intelligence Lab.
- **Leadership**: IPA-SF Maharashtra Chapter.
- **Certifications**: WHO GRPa, Google Prompt Engineering, IPA-SF Active Member.
- **Skills Matrix**: Categorized pills for Domain Knowledge, Research & Product, Technical Tools, Leadership, and Languages (English, Marathi, Hindi, Telugu).
- **Education**: MVP Samaj's College of Pharmacy (B.Pharm 2027).
- **Print / PDF**: Ready to print or save to PDF with one click.

### 7. 💾 100% Device Persistence
- All applications, notes, edits, and theme settings are saved locally to `localStorage`.
- Works completely offline.
- Data remains intact across app launches and device reboots.

---

## 🚀 How to Run & Use on Mobile

### Option A: 1-Click Launch on Computer & Mobile (Recommended)
1. Double click **`start-app.bat`** (or run `node server.js` in terminal).
2. The server will output:
   ```
   Local Computer:   http://localhost:3000
   Open on your Girlfriend's Mobile Phone (same Wi-Fi):
   👉  http://192.168.x.x:3000
   ```
3. Open `http://localhost:3000` on your laptop, or open `http://192.168.x.x:3000` on her mobile browser (connected to the same Wi-Fi).

### Option B: Add to Home Screen (Install as Mobile App)
- **On iPhone (Safari)**: Open the URL, tap the **Share** button (box with upward arrow), and select **"Add to Home Screen"**. It will appear like a native app with the custom icon!
- **On Android (Chrome)**: Tap the **three dots menu** and tap **"Install App"** or **"Add to Home Screen"**.

### Option C: Direct File Access
You can also directly double click **`index.html`** in any web browser without running a server.

---

## 🛠️ Tech Stack
- **HTML5 & Vanilla Modern JavaScript (ES6+)**: Zero bulky dependencies, lightning fast load time (<50ms).
- **CSS3 Variables & Design System**: Fluid responsive layout with mobile-first breakpoints, bottom sheets, and native app aesthetics.
- **Progressive Web App (PWA)**: Includes `manifest.json` and `sw.js` for full offline caching.
- **Storage**: Browser `localStorage` API for resilient zero-config persistence.
