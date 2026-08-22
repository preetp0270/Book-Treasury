# 📚 Book Treasury

A private, beautiful digital library for writers.  
Write books with a calm, distraction-free interface that feels like a real treasury of your words.

**Login with a simple MPIN • Full-screen immersive editor • Dark / Light mode • MongoDB Atlas**

---

## Features

- **MPIN Authentication** – 4–6 digit personal PIN (hashed with bcrypt)
- **Personal Library Dashboard** – beautiful bookshelf of your books
- **Immersive Editor**
  - Chapters
  - Content blocks: Title, Subtitle, Heading, Paragraph, Quote, Divider, Image, Reference link
  - 10 carefully chosen book fonts (Google Fonts)
  - Auto-save + manual save
  - Full-screen focus mode (minimal chrome)
- **Dark / Light / System theme**
- **Image support** via public URL (easy to extend to uploads)
- **Reference / citation links**
- **Word count tracking**
- **Markdown & PDF export** – download the whole book as `.md` or `.pdf`
- **Cloudinary image uploads** – upload images directly into your book (or paste a URL)
- **Custom Google Fonts** – paste any Google Fonts CSS link and use it while writing
- Separate **Frontend** (React + Vite + Tailwind) and **Backend** (Node + Express + MongoDB)

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, Lucide icons |
| Backend   | Node.js, Express, Mongoose          |
| Database  | MongoDB Atlas                      |
| Auth      | JWT + bcrypt (MPIN)                 |

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env → put your MongoDB Atlas connection string and a strong JWT_SECRET
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

The Vite proxy already forwards `/api` → backend.

### 3. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Copy the connection string into `backend/.env` as `MONGODB_URI`

---



## Markdown Export

In the book editor, click the **Download** icon in the top bar.

- Instant client-side conversion (no round-trip)
- Also available via API: `GET /api/books/:id/export/markdown`
- Produces clean Markdown with:
  - Book title + subtitle
  - Chapters as `##` headings
  - Paragraphs, quotes (`>`), dividers (`---`)
  - Images as `![caption](url)`
  - Reference links as `[title](url)`


## Image Uploads (Cloudinary)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From the dashboard copy **Cloud name**, **API Key**, **API Secret**
3. Put them in `backend/.env`
4. In the editor, add an **Image** block → click **Upload image**

You can still paste any public image URL if you prefer.

## PDF & Markdown Export

In the editor click the **Download** icon:
- **Markdown (.md)** – clean text export
- **PDF (.pdf)** – printable A4 layout with chapters

## Custom Google Fonts

1. Click the **Settings** (gear) icon in the editor
2. Go to [fonts.google.com](https://fonts.google.com), choose a font → **Get font**
3. Copy the CSS `<link>` URL
4. Paste: Display name, CSS `font-family` value, and the URL
5. Save – the font appears in the font dropdown (marked with ★)

## Project Structure

```
book-treasury/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
└── README.md
```

---

## Environment Variables (Backend)

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/book-treasury
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

# Cloudinary (free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Recommended Next Steps (optional)

- Export as EPUB
- Collaborative / read-only share links
- Offline support
- Collaborative reading (share a read-only link)
- Offline support with local storage fallback

---

Made with care for people who love writing books.
