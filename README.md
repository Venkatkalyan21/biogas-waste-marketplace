# BioWaste Market - Fruits & Vegetables Waste Marketplace for Biogas

A comprehensive B2B and B2C marketplace platform built with the MERN stack for connecting fruit and vegetable waste producers with biogas facilities and other users.

## 🌟 Features

### 🏢 B2B Marketplace
- **Enterprise-grade workflows** for businesses
- **Business verification** and certification system
- **Bulk waste listings** and management
- **Advanced analytics** and reporting
- **Custom pricing** and negotiation tools
- **Supply chain management** integration

### 🛍️ B2C Marketplace
- **User-friendly interface** for individual users
- **Easy waste listing** creation
- **Real-time notifications**
- **Mobile-responsive design**
- **Secure payment processing**
- **Rating and review system**

### 🚀 Core Features
- **User Authentication** (Individual/Business/Admin)
- **Waste Listing Management** with images and detailed specifications
- **Order Processing** and tracking
- **Payment Integration** (Stripe, Bank Transfer, COD)
- **Real-time Chat** and messaging
- **Advanced Search** and filtering
- **Location-based** listings
- **Quality verification** system
- **Admin Dashboard** for platform management

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **Stripe** for payment processing
- **Nodemailer** for email services

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Additional Tools
- **Concurrently** for running dev servers
- **Nodemon** for auto-restarting server
- **Helmet.js** for security
- **Rate Limiting** for API protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd biogas-waste-marketplace
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install separately
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
# Copy the example environment file
cp server-env-example server/.env

# Edit the environment variables
# Update MONGODB_URI, JWT_SECRET, Cloudinary keys, Stripe keys, etc.
```

#### Required Environment Variables

**Server (.env in `server/` folder):**
```env
# Database (Required)
MONGODB_URI=mongodb://localhost:27017/biogas_waste_marketplace

# JWT (Required)
JWT_SECRET=your_super_secret_jwt_key_here

# Razorpay Payment (Required)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Cloudinary (for image uploads - Recommended)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Payment (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration (Recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Mapbox (for geocoding - Recommended)
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**Client (.env in `client/` folder):**
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_API_URL=http://localhost:5000/api
```

**📖 For detailed setup instructions, see `SETUP_GUIDE.md`**

### 4. Database Setup
```bash
# Start MongoDB service
# On macOS: brew services start mongodb-community
# On Ubuntu: sudo systemctl start mongod
# On Windows: Start MongoDB service from Services
```

### 5. Start the Application
```bash
# Start both server and client in development mode
npm run dev

# Or start separately
# Server (runs on http://localhost:5000)
npm run server

# Client (runs on http://localhost:3000)
npm run client
```

## 📁 Project Structure

```
biogas-waste-marketplace/
├── server/
│   ├── models/          # MongoDB models (User, Waste, Order)
│   ├── routes/          # API routes (auth, waste, orders, payments, admin)
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── index.js         # Server entry point
│   └── package.json     # Server dependencies
├── client/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   ├── services/    # API services
│   │   ├── App.js       # Main App component
│   │   └── index.js     # Client entry point
│   ├── public/          # Static files
│   └── package.json     # Client dependencies
├── package.json         # Root package.json
└── README.md           # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Waste Management
- `GET /api/waste` - Get all waste listings
- `GET /api/waste/:id` - Get single waste item
- `POST /api/waste` - Create new listing
- `PUT /api/waste/:id` - Update listing
- `DELETE /api/waste/:id` - Delete listing
- `GET /api/waste/my/listings` - Get user's listings
- `POST /api/waste/:id/interest` - Express interest

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my/buyer` - Get buyer orders
- `GET /api/orders/my/seller` - Get seller orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/review` - Add review
- `POST /api/orders/:id/negotiate` - Negotiate price

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/methods` - Get payment methods

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/waste` - Get all waste listings
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/analytics` - Get platform analytics

## 🎯 Usage Guide

### For Individual Users
1. **Register** an account with email and password
2. **Browse** waste listings using search and filters
3. **Express interest** in listings or place orders directly
4. **Communicate** with sellers through the platform
5. **Track orders** and leave reviews

### For Business Users
1. **Register** as a business with company details
2. **List waste** products with detailed specifications
3. **Set pricing** and availability
4. **Manage orders** and negotiate with buyers
5. **Access analytics** and business insights

### For Admin Users
1. **Access admin dashboard** for platform overview
2. **Manage users** and business verifications
3. **Monitor listings** and order activities
4. **Handle disputes** and support requests
5. **View analytics** and generate reports

## 🔧 Configuration

### MongoDB Setup
```javascript
// Connection string format
mongodb://localhost:27017/biogas_waste_marketplace

// For production with authentication
mongodb://username:password@host:port/database
```

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### Stripe Setup
1. Create a Stripe account
2. Get your publishable and secret keys
3. Add webhook endpoints for payment confirmation

## 🚀 Deployment

### Quick Deployment

For a quick deployment guide, see [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Deployment Platforms

**Backend (Recommended: Render)**
- Free tier available
- Automatic deployments from GitHub
- Environment variable management
- [Deploy to Render](https://render.com)

**Frontend (Recommended: Netlify or Vercel)**
- Free tier available
- Automatic deployments from GitHub
- CDN and SSL included
- [Deploy to Netlify](https://netlify.com) | [Deploy to Vercel](https://vercel.com)

**Database (Recommended: MongoDB Atlas)**
- Free tier available (512MB)
- Automatic backups
- Global clusters
- [Get MongoDB Atlas](https://mongodb.com/atlas)

### Production Build
```bash
# Build the React client
npm run build

# Start server in production mode
NODE_ENV=production npm start
```

### Environment Variables for Production

**Backend (.env in server/)**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/biogas_waste_marketplace
JWT_SECRET=super-secure-production-secret-minimum-32-characters
CLIENT_URL=https://your-frontend-url.netlify.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=sk_live_production_key (optional)
MAPBOX_ACCESS_TOKEN=your_mapbox_token (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Frontend (.env in client/)**
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id (optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key (optional)
```

### Deployment Checklist

- [ ] Set up MongoDB Atlas database
- [ ] Configure Cloudinary for image storage
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Netlify/Vercel
- [ ] Update CORS settings in backend
- [ ] Configure environment variables
- [ ] Test all features
- [ ] Update Google OAuth redirect URIs (if using)
- [ ] Set up domain (optional)
- [ ] Enable monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact:
- Email: info@biowastemarket.com
- Phone: +1 (555) 123-4567
- Live Chat: Available on the platform

## 🌍 Environmental Impact

By using BioWaste Market, you're contributing to:
- ✅ Reduced landfill waste
- ✅ Lower greenhouse gas emissions
- ✅ Increased renewable energy production
- ✅ Circular economy development
- ✅ Sustainable business practices

## 📈 Future Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] IoT integration for waste tracking
- [ ] AI-powered waste analysis
- [ ] Blockchain for supply chain transparency
- [ ] International marketplace expansion
- [ ] Carbon credit integration
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

---

**Built with ❤️ for a sustainable future**
