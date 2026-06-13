# Python Web Runner - Deployment Guide

## Deployment Options

This application is optimized for **free tier** deployment on Render and Railway.

---

## 🚀 Deploy to Render (Free Tier)

### Option 1: Using Git (Recommended)

1. **Push your code to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select the `python` repository
   - Choose branch: `main`

3. **Configure:**
   - **Name:** `python-web-runner`
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command:**
     ```bash
     node backend/server.js
     ```
   - **Plan:** Free
   - **Environment Variables:** (Optional - uses defaults)
     ```
     NODE_ENV=production
     PORT=10000
     ```

4. **Deploy** - Click "Create Web Service"
   - Build will take ~3-5 minutes
   - App will be live at: `https://python-web-runner.onrender.com`

### Option 2: Using render.yaml

The `render.yaml` file is already configured. Simply:

1. Push to GitHub
2. Connect repo in Render dashboard
3. Render automatically reads `render.yaml`

---

## 🚂 Deploy to Railway (Free Tier)

### Prerequisites

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

### Deployment Steps

1. **Initialize Railway:**
   ```bash
   railway init
   ```
   - Select "Create a new project"
   - Name it: `python-web-runner`

2. **Deploy:**
   ```bash
   railway up
   ```
   - First deployment takes ~2-3 minutes
   - Railway auto-detects Node.js environment

3. **Get Your URL:**
   ```bash
   railway open
   ```
   - Your app will open in browser
   - URL format: `https://python-web-runner-production.up.railway.app`

### Using railway.json (Already Configured)

The `railway.json` and `railway.toml` files are pre-configured:

```bash
railway up
```

---

## Free Tier Limitations & Optimizations

### Render Free Tier
- ✅ **0.5 GB RAM** (optimized to use ~200MB)
- ✅ **Shared CPU** (auto-scaling available)
- ✅ **Automatic sleep after 15 min inactivity** (wakes on request)
- ✅ **1 web service free**
- ⚠️ Builds limited to 30 minutes
- ⚠️ Max execution time: 25 seconds

### Railway Free Tier
- ✅ **8GB GB/month** usage (shared across all services)
- ✅ **Generous free tier**
- ✅ **Auto-scaling on usage**
- ⚠️ Stops after hitting usage limit
- ⚠️ Premium paid tier available

### Optimizations Applied

1. **Memory Optimization:**
   - Reduced MAX_MEMORY from 512MB → 256MB
   - Reduced MAX_OUTPUT_SIZE from 10MB → 5MB
   - Log retention: 3 days (auto-cleanup)

2. **Timeout Optimization:**
   - Reduced from 30s → 25s (Render timeout is 30s)
   - Prevents hanging processes

3. **Rate Limiting:**
   - 50 requests per 15 minutes per IP
   - Protects free tier resources

4. **Upload Directory:**
   - Uses `/tmp/uploads` (ephemeral storage)
   - Auto-cleaned on restart

5. **Logging:**
   - Production log level: `warn`
   - Reduces I/O operations

6. **Frontend Build:**
   - Minified with terser
   - Console logs removed
   - Source maps disabled

---

## Environment Variables

### Essential (Auto-set)
```bash
NODE_ENV=production
PORT=10000
```

### Optional (Override Defaults)
```bash
EXECUTION_TIMEOUT=25000          # 25 seconds
MAX_OUTPUT_SIZE=5242880          # 5MB
MAX_MEMORY=256                   # 256MB
LOG_LEVEL=warn
GITHUB_TOKEN=your_token_here     # For GitHub imports
```

---

## Monitoring & Troubleshooting

### View Logs

**Render:**
```bash
railway logs
```

**Railway:**
```bash
railway logs
```

### Health Check

Both services provide a `/health` endpoint:
```bash
curl https://your-app-url/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T12:00:00Z",
  "uptime": 1234.56
}
```

### Common Issues

**Issue: Build fails**
- Check Node.js version (requires 16+)
- Ensure all dependencies are in package.json
- Check for syntax errors

**Issue: App goes to sleep (Render)**
- Expected on free tier after 15 min inactivity
- First request after sleep takes ~30s to wake
- Upgrade to paid plan to prevent sleeping

**Issue: Out of memory**
- Reduce MAX_MEMORY in environment
- Limit code execution time
- Restart dyno/service

**Issue: Python not found**
- Add to `runtime.txt`: `python-3.11.0`
- Render auto-detects Python; Railway may need explicit config

---

## Scaling Beyond Free Tier

### Render Paid Plans
- **Starter:** $7/month (1 GB RAM, always running)
- **Standard:** $12/month (2 GB RAM, auto-scaling)
- Recommended for production

### Railway Paid Plans
- Pay-as-you-go pricing
- Usually $5-20/month for small apps
- Better for variable workloads

---

## Auto-Deployment (CI/CD)

Both Render and Railway auto-deploy on git push to main branch.

### Setup GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: curl -X POST https://api.render.com/deploy/srv-xxxxx
```

---

## Performance Tips

1. **Cold Start Optimization:**
   - First request takes longer
   - Use health check warmup scripts

2. **Minimize Code Size:**
   - Tree-shake unused dependencies
   - Use lightweight alternatives

3. **Cache Static Files:**
   - Frontend built as static files
   - Served from CDN on paid plans

4. **Optimize Execution:**
   - Keep scripts simple
   - Use efficient algorithms
   - Avoid infinite loops

5. **Monitor Usage:**
   - Check logs regularly
   - Set up alerts for errors
   - Track execution times

---

## Summary

| Feature | Render | Railway |
|---------|--------|----------|
| **Free Tier** | Yes (0.5GB RAM) | Yes (8GB/month) |
| **Auto Deploy** | ✅ | ✅ |
| **Build Time** | ~5 min | ~3 min |
| **Sleep After Inactivity** | 15 min | Never |
| **Always-On Option** | Paid only | Paid option |
| **Setup Difficulty** | Easy | Easy |

**Recommendation:** Start with **Render** for simplicity, switch to **Railway** if you need better free tier resources.

---

## Support

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [GitHub Issues](https://github.com/njonjobeatrice3-ui/python/issues)
