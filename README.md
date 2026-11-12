# DropGit — Universal File & Repository Downloader

> **Paste. Process. Download.**  
> A premium, high-performance Progressive Web App (PWA) for downloading entire repositories, specific subfolders, and individual files from GitHub and GitLab without cloning or installing Git.

---

## 🚀 Features

- **Targeted Subfolder Downloading**: Download arbitrary directories (e.g. `facebook/react/tree/main/packages/react`) as clean, properly structured ZIP archives.
- **Full Repository Archives**: One-click download of public repositories across any branch or commit tag.
- **Granular Multi-File Selection**: Check individual files or entire directory trees and package only what you need.
- **Interactive File Explorer**:
  - Hierarchical folder tree with expand/collapse.
  - Live real-time filename and path filtering.
  - In-browser code, text, and image preview with syntax line numbering and clipboard copy.
- **Progressive Web App (PWA)**:
  - Installable directly to desktop or mobile home screens.
  - Service worker caching with offline fallback indicator.
  - Guided installation prompts for Android, Chromium, and iOS Safari.
- **Dual-Theme Glassmorphism**:
  - Sophisticated monochrome aesthetic matching modern engineering tools.
  - Light and Dark modes with automatic system preference detection.
- **Security & SSRF Hardened**:
  - Validates all input URLs.
  - Blocks loopback (`127.0.0.1`), RFC 1918 private IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
- **Privacy First**:
  - Zero third-party tracking, ad pixels, or surveillance cookies.
  - Download history and theme preferences stored strictly in local browser storage.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**:
  - **Framework**: React 19 + TypeScript + Vite
  - **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`, custom dark variants)
  - **Icons**: Lucide React
  - **PWA**: `vite-plugin-pwa` with Workbox precaching
  - **Archive Engine**: Client-side & server-side streaming ZIP compilation with JSZip
- **Backend**:
  - **Server**: Node.js 22 + Express 4 running via `tsx`
  - **Proxy & Streaming**: SSRF-protected streaming proxy for bypassing CORS restrictions

---

## 📦 Getting Started

### Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm or bun

### Installation

```bash
# Clone or download this project
git clone https://github.com/your-username/dropgit.git
cd dropgit

# Install dependencies
npm install
```

### Development

```bash
# Start full-stack development server with Vite middleware on port 3000
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze` | Parses a GitHub/GitLab URL, inspects git trees, and returns file hierarchy metadata. |
| `GET` | `/api/file-preview?url=...` | Safely fetches text or image previews up to 2MB. |
| `POST` | `/api/download-zip` | Takes an array of remote file URLs and streams a generated `.zip` archive. |
| `GET` | `/api/download-proxy?url=...&filename=...` | SSRF-validated proxy to trigger direct browser file downloads with clean filenames. |
| `GET` | `/api/rate-limit` | Checks current GitHub API remaining quota. |
| `GET` | `/robots.txt` | Serves crawler directives. |
| `GET` | `/sitemap.xml` | Serves standard XML sitemap. |

---

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Optional: Expand GitHub API rate limit from 60 to 5,000 requests/hour
GITHUB_TOKEN="your_personal_access_token_here"

# Server Port (defaults to 3000)
PORT=3000
```

---

## 📱 PWA & Mobile Support

DropGit is fully installable as a native-feeling application:
- **Desktop (Chrome/Edge/Brave)**: Click the **Install App** button in the top navigation bar.
- **Android**: Tap the **Install App** banner to add DropGit to your app drawer.
- **iOS Safari**: Tap the **Share** button in Safari and select **Add to Home Screen**.

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
