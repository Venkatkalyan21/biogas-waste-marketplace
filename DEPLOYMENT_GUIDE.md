# 🚀 Deployment Guide - BioWaste Market

This guide will help you deploy the BioWaste Market application to production.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **MongoDB Atlas Account** - Free tier available at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **Cloudinary Account** - Free tier available at [cloudinary.com](https://cloudinary.com)
4. **Render Account** - Free tier available at [render.com](https://render.com) (for backend)
5. **Netlify or Vercel Account** - Free tier available (for frontend)
   - Netlify: [netlify.com](https://netlify.com)
   - Vercel: [vercel.com](https://vercel.com)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for free
   - Create a new cluster (choose FREE tier)

2. **Configure Database Access**
   - Go to **Database Access** → **Add New Database User**
   - Create a username and password (save these!)
   - Set privileges to **Read and write to any database**

3. **Configure Network Access**
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0) for development
   - For production, add specific IPs

4. **Get Connection String**
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/biogas_waste_marketplace?retryWrites=true&w=majority`

---

## ☁️ Step 2: Set Up Cloudinary

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free

2. **Get Credentials**
   - Go to **Dashboard**
   - Copy:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

---

## 🔧 Step 3: Deploy Backend (Render)

### Option A: Using Render Dashboard

1. **Create New Web Service**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the repository: `biogas-waste-marketplace`

2. **Configure Service**
   - **Name**: `biowaste-marketplace-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

3. **Set Environment Variables**
   Click **Environment** and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/biogas_waste_marketplace?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
   CLIENT_URL=https://your-frontend-url.netlify.app
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   STRIPE_SECRET_KEY=sk_test_your_stripe_key (optional)
   MAPBOX_ACCESS_TOKEN=your_mapbox_token (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment to complete
   - Copy your service URL (e.g., `https://biowaste-marketplace-api.onrender.com`)

### Option B: Using Render Blueprint

1. **Push render.yaml to Repository**
   - The `render.yaml` file is already in the repository
   - Update environment variables in Render dashboard after deployment

2. **Deploy from Blueprint**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **New +** → **Blueprint**
   - Connect your repository
   - Render will automatically detect `render.yaml`
   - Click **Apply**

---

## 🎨 Step 4: Deploy Frontend (Netlify)

### Option A: Using Netlify Dashboard

1. **Create New Site**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **Add new site** → **Import an existing project**
   - Connect to GitHub
   - Select your repository

2. **Configure Build Settings**
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/build`

3. **Set Environment Variables**
   Go to **Site settings** → **Environment variables** and add:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id (if using Google OAuth)
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key (if using Google Maps)
   ```

4. **Deploy**
   - Click **Deploy site**
   - Wait for deployment
   - Copy your site URL (e.g., `https://biowaste-marketplace.netlify.app`)

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd client
netlify deploy --prod
```

---

## 🚀 Step 5: Deploy Frontend (Vercel) - Alternative

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait for deployment
   - Copy your site URL

---

## 🔄 Step 6: Update Backend CORS and Client URL

1. **Update Backend Environment Variables**
   - Go to Render dashboard → Your backend service → **Environment**
   - Update `CLIENT_URL` to your frontend URL:
     ```
     CLIENT_URL=https://your-frontend-url.netlify.app
     ```
   - Or for Vercel:
     ```
     CLIENT_URL=https://your-frontend-url.vercel.app
     ```

2. **Redeploy Backend**
   - Click **Manual Deploy** → **Deploy latest commit**

---

## 🔐 Step 7: Update Google OAuth (If Using)

1. **Update Authorized Origins**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to **APIs & Services** → **Credentials**
   - Click your OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `https://your-frontend-url.netlify.app`
     - `https://your-frontend-url.vercel.app`
   - Add authorized redirect URIs:
     - `https://your-frontend-url.netlify.app/auth/google/callback`
     - `https://your-frontend-url.vercel.app/auth/google/callback`

2. **Update Environment Variables**
   - Update `GOOGLE_REDIRECT_URI` in backend:
     ```
     GOOGLE_REDIRECT_URI=https://your-frontend-url.netlify.app/auth/google/callback
     ```

---

## ✅ Step 8: Verify Deployment

1. **Test Backend**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try to register/login
   - Create a waste listing
   - Test all features

---

## 📝 Step 9: Update README with Live URLs

Update your README.md with:
```markdown
## 🌐 Live Demo

- **Frontend**: https://your-frontend-url.netlify.app
- **Backend API**: https://your-backend-url.onrender.com/api
- **Health Check**: https://your-backend-url.onrender.com/api/health
```

---

## 🐛 Troubleshooting

### Backend Issues

1. **Database Connection Failed**
   - Check MongoDB Atlas network access (allow all IPs)
   - Verify connection string in environment variables
   - Check database user credentials

2. **CORS Errors**
   - Verify `CLIENT_URL` in backend environment variables
   - Make sure frontend URL matches exactly
   - Check for trailing slashes

3. **Environment Variables Not Working**
   - Restart the service after adding variables
   - Check for typos in variable names
   - Verify values don't have extra spaces

### Frontend Issues

1. **API Connection Failed**
   - Check `REACT_APP_API_URL` environment variable
   - Verify backend is running and accessible
   - Check browser console for errors

2. **Build Failed**
   - Check build logs in Netlify/Vercel
   - Verify all dependencies are in package.json
   - Check for syntax errors

3. **404 on Refresh**
   - Netlify: Check `netlify.toml` redirects
   - Vercel: Check `vercel.json` routes

---

## 🔒 Security Checklist

- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Use MongoDB Atlas with strong password
- [ ] Enable MongoDB IP whitelist for production
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic with Netlify/Vercel/Render)
- [ ] Regularly update dependencies
- [ ] Monitor error logs

---

## 📊 Monitoring

1. **Render Dashboard**
   - Monitor backend logs
   - Check service health
   - View metrics

2. **Netlify/Vercel Dashboard**
   - Monitor frontend builds
   - Check deployment logs
   - View analytics

3. **MongoDB Atlas**
   - Monitor database performance
   - Check connection metrics
   - Set up alerts

---

## 🎉 Congratulations!

Your BioWaste Market application is now live! Share your deployment URLs in your Hackov8 submission.

---

## 📞 Need Help?

- Check the [README.md](./README.md) for setup instructions
- Review error logs in deployment dashboards
- Check environment variables are set correctly
- Verify all services are running

---

**Last Updated**: November 2025

