import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import InvoicePage from './pages/InvoicePage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MessagingSystem from './components/messaging/MessagingSystem';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CoursesProvider } from './contexts/CoursesContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ToastProvider } from './contexts/ToastContext';

function AppContent() {
  const { user } = useAuth();
  const [showMessaging, setShowMessaging] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleMessaging={() => setShowMessaging(!showMessaging)} />
      
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route 
            path="/dashboard" 
            element={user ? <UserDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/*" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>

      {user && (
        <MessagingSystem 
          isOpen={showMessaging} 
          onClose={() => setShowMessaging(false)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <CoursesProvider>
              <ProductsProvider>
                <MessagingProvider>
                  <AppContent />
                </MessagingProvider>
              </ProductsProvider>
            </CoursesProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;