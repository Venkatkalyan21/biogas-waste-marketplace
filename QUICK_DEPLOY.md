# ⚡ Quick Deployment Guide

This is a simplified guide to get your app deployed quickly.

## 🚀 Quick Steps

### 1. MongoDB Atlas Setup (5 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up
2. Create a FREE cluster
3. Create database user (save username/password)
4. Add IP: `0.0.0.0/0` (allow all)
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/biogas_waste_marketplace?retryWrites=true&w=majority`

### 2. Cloudinary Setup (2 minutes)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

### 3. Deploy Backend to Render (10 minutes)

1. Go to [render.com](https://render.com) → Sign up
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `biogas-waste-marketplace`
4. Settings:
   - **Name**: `biowaste-api`
   - **Build Command**: `npm install && cd server && npm install`
   - **Start Command**: `cd server && npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/biogas_waste_marketplace
   JWT_SECRET=generate_random_string_32_characters_minimum
   CLIENT_URL=https://your-frontend-url.netlify.app (update after frontend deploy)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
6. Click **Create Web Service**
7. Wait for deployment → Copy URL (e.g., `https://biowaste-api.onrender.com`)

### 4. Deploy Frontend to Netlify (5 minutes)

1. Go to [netlify.com](https://netlify.com) → Sign up
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub → Select repository
4. Settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/build`
5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```
6. Click **Deploy site**
7. Wait for deployment → Copy URL (e.g., `https://biowaste-marketplace.netlify.app`)

### 5. Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Update environment variable:
   ```
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```
3. Click **Save Changes** → Service will redeploy automatically

### 6. Test Deployment

1. Visit frontend URL
2. Visit backend health check: `https://your-backend-url.onrender.com/api/health`
3. Should see: `{"status":"OK","timestamp":"..."}`

## ✅ Done!

Your app is now live! 🎉

## 🔗 Add to Hackov8 Submission

- **Live Demo**: `https://your-frontend-url.netlify.app`
- **GitHub**: `https://github.com/Venkatkalyan21/biogas-waste-marketplace`

---

## 🆘 Quick Troubleshooting

**Backend not working?**
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs

**Frontend can't connect to backend?**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Verify backend URL is accessible

**Database connection failed?**
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Verify username/password in connection string
- Check network access in MongoDB Atlas

---

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

