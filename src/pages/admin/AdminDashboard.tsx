/*import React, { useState } from 'react';*/
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  Users, 
  MessageCircle, 
  Settings,
  Plus,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminCoursesManager from './AdminCoursesManager';
import AdminProductsManager from './AdminProductsManager';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  /*const [activeTab, setActiveTab] = useState('overview');*/

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/admin' },
    { id: 'courses', label: 'Formations', icon: BookOpen, path: '/admin/courses' },
    { id: 'products', label: 'Produits', icon: ShoppingBag, path: '/admin/products' },
    { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/admin/messages' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Administration</h2>
            <p className="text-sm text-gray-600">Bienvenue, {user?.name}</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {sidebarItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/courses" element={<AdminCoursesManager />} />
            <Route path="/products" element={<AdminProductsManager />} />
            <Route path="/users" element={<AdminUsersManager />} />
            <Route path="/messages" element={<AdminMessagesManager />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin/courses"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle formation
          </Link>
          <Link
            to="/admin/products"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pôles de Formation</p>
              <p className="text-2xl font-bold text-gray-900">10</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Équipements</p>
              <p className="text-2xl font-bold text-gray-900">150+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Apprenants</p>
              <p className="text-2xl font-bold text-gray-900">200+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Services</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activité récente</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle inscription à "Solaire Photovoltaïque"</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Messages récents</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(item => (
              <div key={item} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Utilisateur {item}</p>
                  <p className="text-xs text-gray-600">Question sur la formation Domotique...</p>
                  <p className="text-xs text-gray-500">Il y a 1 heure</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUsersManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Interface de gestion des utilisateurs à implémenter</p>
      </div>
    </div>
  );
};

const AdminMessagesManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des messages</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Interface de gestion des messages à implémenter</p>
      </div>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Interface des paramètres à implémenter</p>
      </div>
    </div>
  );
};

export default AdminDashboard;