# Kepler Codes — Reply Bot

A simple tool to write and post promotional replies to X (Twitter) tweets, promoting Kepler Codes.

---

## Deploy to Vercel (step by step)

### 1. Install dependencies locally (to test first)
```bash
npm install
npm run dev
```
Open http://localhost:3000 to test locally.

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kepler-reply-bot.git
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Import your `kepler-reply-bot` repo
4. Click **Deploy** (no build settings needed — Vercel auto-detects Next.js)

### 4. Add your secret keys on Vercel
1. Go to your project on Vercel → **Settings** → **Environment Variables**
2. Add these 4 variables:

| Name | Value |
|------|-------|
| `X_API_KEY` | Your X API key |
| `X_API_SECRET` | Your X API secret |
| `X_ACCESS_TOKEN` | Your access token |
| `X_ACCESS_SECRET` | Your access token secret |

3. Click **Save** then go to **Deployments** → **Redeploy**

Your bot is now live at `https://kepler-reply-bot.vercel.app` (or your custom domain)!

---

## How to use the bot

1. Open your Vercel URL
2. Find a tweet from a famous person you want to reply to
3. Copy the tweet URL (e.g. `https://x.com/elonmusk/status/123456789`)
4. Paste it in the **Tweet URL** field
5. Write your reply promoting Kepler Codes
6. Click **Post reply ↗**

### Tips
- Stay under 17 replies/day (X Free API limit)
- Every 2 hours = 12/day — well within the limit
- The reply log is saved in your browser so you can track what you've posted
- Always make replies relevant to the tweet — generic replies get ignored or flagged

---

## Getting your X API keys

1. Go to https://developer.x.com
2. Sign in with your X account
3. Create a new project and app
4. Under **User authentication settings**, enable **OAuth 1.0a** with **Read and Write** permissions
5. Go to **Keys and Tokens** → generate all 4 keys

---

## Tech stack

- **Next.js 14** — frontend + API routes
- **Vercel** — hosting (free tier)
- **oauth-1.0a** — signs X API requests securely on the server
- **X API v2 Free tier** — posts tweets/replies

Cost: ~$0/month
