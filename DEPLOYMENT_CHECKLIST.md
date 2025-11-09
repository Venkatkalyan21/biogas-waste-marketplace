# ✅ Deployment Checklist

Use this checklist to ensure your deployment is complete and working correctly.

## 📋 Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables are documented
- [ ] `.env` files are in `.gitignore`
- [ ] README is updated with setup instructions
- [ ] All dependencies are listed in `package.json`

## 🗄️ Database Setup

- [ ] MongoDB Atlas account created
- [ ] Database cluster created (FREE tier)
- [ ] Database user created (username/password saved)
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string copied and tested
- [ ] Database name: `biogas_waste_marketplace`

## ☁️ Cloudinary Setup

- [ ] Cloudinary account created
- [ ] Cloud name copied
- [ ] API key copied
- [ ] API secret copied
- [ ] Credentials saved securely

## 🔧 Backend Deployment (Render)

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] New Web Service created
- [ ] Build command set: `npm install && cd server && npm install`
- [ ] Start command set: `cd server && npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `MONGODB_URI` (from MongoDB Atlas)
  - [ ] `JWT_SECRET` (random 32+ character string)
  - [ ] `CLIENT_URL` (update after frontend deploy)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `RAZORPAY_KEY_ID` (optional)
  - [ ] `RAZORPAY_KEY_SECRET` (optional)
  - [ ] `EMAIL_HOST=smtp.gmail.com`
  - [ ] `EMAIL_PORT=587`
  - [ ] `EMAIL_USER` (optional)
  - [ ] `EMAIL_PASS` (optional)
- [ ] Service deployed successfully
- [ ] Backend URL copied (e.g., `https://biowaste-api.onrender.com`)
- [ ] Health check works: `https://your-backend-url.onrender.com/api/health`

## 🎨 Frontend Deployment (Netlify)

- [ ] Netlify account created
- [ ] GitHub repository connected
- [ ] New site created
- [ ] Base directory set: `client`
- [ ] Build command set: `npm install && npm run build`
- [ ] Publish directory set: `client/build`
- [ ] Environment variable configured:
  - [ ] `REACT_APP_API_URL` (backend URL + `/api`)
- [ ] Site deployed successfully
- [ ] Frontend URL copied (e.g., `https://biowaste-marketplace.netlify.app`)

## 🔄 Post-Deployment

- [ ] Backend `CLIENT_URL` updated with frontend URL
- [ ] Backend redeployed (automatic or manual)
- [ ] CORS working correctly
- [ ] Frontend can connect to backend
- [ ] All API endpoints accessible

## 🧪 Testing

- [ ] Frontend loads correctly
- [ ] Backend health check returns `{"status":"OK"}`
- [ ] User registration works
- [ ] User login works
- [ ] Waste listings load
- [ ] Create waste listing works
- [ ] Image upload works (Cloudinary)
- [ ] Search and filters work
- [ ] Order creation works
- [ ] Payment integration works (if configured)
- [ ] Admin dashboard works (if applicable)

## 🔐 Security

- [ ] Strong JWT_SECRET set (32+ characters)
- [ ] MongoDB password is strong
- [ ] Environment variables are secure
- [ ] No secrets in code or GitHub
- [ ] HTTPS enabled (automatic with Netlify/Render)
- [ ] CORS configured correctly

## 📝 Documentation

- [ ] README updated with live URLs
- [ ] Deployment guide created
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created

## 🎉 Final Steps

- [ ] Add live demo URL to Hackov8 submission
- [ ] Update GitHub repository description
- [ ] Add deployment badges to README (optional)
- [ ] Share your deployed application!

## 🐛 Troubleshooting

If something doesn't work:

1. **Check Backend Logs** (Render Dashboard → Logs)
2. **Check Frontend Logs** (Netlify Dashboard → Deploy Logs)
3. **Check Environment Variables** (make sure all are set)
4. **Check Database Connection** (MongoDB Atlas → Network Access)
5. **Check CORS Settings** (verify CLIENT_URL matches frontend URL)
6. **Check API URL** (verify REACT_APP_API_URL is correct)

## 📞 Need Help?

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- Check [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for quick steps
- Review error logs in deployment dashboards
- Verify all environment variables are set correctly

---

**Last Updated**: November 2025

