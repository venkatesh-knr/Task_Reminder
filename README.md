# Task Reminder

A simple, beautiful **local-first** task manager. All data is stored in the browser's `localStorage` — no server, no database, no accounts.

## Categories

- 🌅 Morning Task  
- 🌙 Night Task  
- 📋 To Do  
- 🛒 To Buy  
- ✨ Good to Have  
- ⏰ Reminder  

Each task also has a **priority** (High / Medium / Low) and an optional due date & time.

## Features

- Add, complete, and delete tasks  
- Filter by category and status (Active / Completed)  
- Automatic sorting (incomplete first → priority → due date)  
- Overdue highlighting  
- Export / Import as JSON (backup & transfer between devices)  
- Fully responsive, dark modern UI  
- Works offline once loaded  

## Quick Start (local)

Just open `index.html` in any modern browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 5500
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `Task_Reminder`).
2. Push this folder to the `main` branch.
3. The included GitHub Actions workflow will automatically deploy the site to **GitHub Pages**.
4. Enable Pages in repo Settings → Pages → Source: **GitHub Actions**.

After the first successful run, your app will be live at:

```
https://<your-username>.github.io/Task_Reminder/
```

## GitHub Actions

The workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and publishes the static site to GitHub Pages.

## Tech

- Vanilla HTML / CSS / JavaScript  
- `localStorage` for persistence  
- No build step, no frameworks  

---

Made for personal productivity. Data never leaves your device unless you export it.
