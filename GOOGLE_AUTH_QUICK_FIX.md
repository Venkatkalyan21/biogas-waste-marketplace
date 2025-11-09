# Google Authentication Failed - Quick Fix

## Step 1: Check Your Configuration

### Frontend (`client/.env`)
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Backend (`server/.env`)
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

**⚠️ Make sure both Client IDs match exactly!**

## Step 2: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Verify these are set:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/google/callback
```

## Step 3: Check OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure **Test users** includes your email address
3. If not, add it!

## Step 4: Check MongoDB Connection

The error might be because MongoDB is not connected. Check your backend server console:

**If you see:** `Connected to MongoDB` ✅
**If you see:** `Mock Mode - No MongoDB` ❌

**Fix:** Add MongoDB connection string to `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/biogas_waste_marketplace
```
Or use MongoDB Atlas (see MONGODB_SETUP.md)

## Step 5: Check Server Logs

When you try to sign in, check your **backend server console** for error messages. You should see detailed errors now.

Common errors:
- `GOOGLE_CLIENT_ID is not set` → Add to server/.env
- `Invalid token` → Client ID mismatch
- `MongoDB connection error` → Fix MongoDB connection

## Step 6: Restart Everything

After making any changes:

1. **Stop both servers** (Ctrl+C)
2. **Restart:**
   ```bash
   npm run dev
   ```
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Try again**

## Quick Test

1. Open browser console (F12)
2. Try Google Sign-In
3. Check console for errors
4. Check backend server console for errors
5. Share the exact error messages you see

## Most Common Issues

### Issue 1: Client ID Mismatch
**Symptom:** "Invalid token" or "Token verification failed"
**Fix:** Make sure `REACT_APP_GOOGLE_CLIENT_ID` in `client/.env` matches `GOOGLE_CLIENT_ID` in `server/.env`

### Issue 2: MongoDB Not Connected
**Symptom:** "Server error" or database errors
**Fix:** Add `MONGODB_URI` to `server/.env` or use MongoDB Atlas

### Issue 3: Test User Not Added
**Symptom:** "Access blocked" error
**Fix:** Add your email to Test users in OAuth consent screen

### Issue 4: JavaScript Origin Not Set
**Symptom:** "origin_mismatch" error
**Fix:** Add `http://localhost:3000` to Authorized JavaScript origins

---

**After checking all these, try again and share the exact error message from the console!**

