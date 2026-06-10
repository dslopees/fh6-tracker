# FH6 Car Collection Tracker

Track your Forza Horizon 6 car collection — 600+ cars with class, PI, source, price and Wikipedia images.

## Deploy to GitHub Pages (step by step)

### 1. Prerequisites
- [Git](https://git-scm.com/) installed
- [Node.js 18+](https://nodejs.org/) installed
- A [GitHub](https://github.com) account

### 2. Create a GitHub repository
1. Go to github.com → New repository
2. Name it **`fh6-tracker`** (must match `base` in `vite.config.js`)
3. Leave it public, don't add README

### 3. Push the code
Open a terminal in this folder and run:

```bash
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fh6-tracker.git
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under *Source*, select **GitHub Actions**
3. Save

The workflow will run automatically and your site will be live at:
**`https://YOUR_USERNAME.github.io/fh6-tracker/`**

### 5. Future updates
Every time you push to `main`, GitHub Actions will rebuild and redeploy automatically.

## Local development

```bash
npm install
npm run dev
```
