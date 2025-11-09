import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import WasteListings from './pages/Waste/WasteListings';
import WasteDetail from './pages/Waste/WasteDetail';
import CreateWasteListing from './pages/Waste/CreateWasteListing';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import Profile from './pages/Profile/Profile';
import BusinessDirectory from './pages/Business/BusinessDirectory';
import AdminDashboard from './pages/Admin/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

// Context
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/waste" element={<WasteListings />} />
                <Route path="/waste/:id" element={<WasteDetail />} />
                <Route path="/businesses" element={<BusinessDirectory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/create-waste-listing" element={
                  <ProtectedRoute>
                    <CreateWasteListing />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Only wrap with GoogleOAuthProvider if we have a client ID
  if (googleClientId && googleClientId.trim() !== '') {
    try {
      return (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppContent />
        </GoogleOAuthProvider>
      );
    } catch (error) {
      console.error('GoogleOAuthProvider error:', error);
      return <AppContent />;
    }
  }

  // Return without GoogleOAuthProvider if no client ID
  return <AppContent />;
}

export default App;
