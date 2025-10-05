import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: 'course' | 'product';
  itemId: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (itemId: string, itemType: 'course' | 'product', quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string, itemType: 'course' | 'product') => Promise<void>;
  updateQuantity: (itemId: string, itemType: 'course' | 'product', quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      setItemCount(0);
      return;
    }

    try {
      const response: any = await apiService.getCart();
      const mappedItems: CartItem[] = (response.items || []).map((item: any) => ({
        id: `${item.type}_${item.itemId}`,
        name: item.name ?? '',
        price: item.price ?? 0,
        image: item.image ?? '',
        quantity: item.quantity ?? 1,
        type: item.type,
        itemId: item.itemId?.toString() ?? '',
      }));

      setItems(mappedItems);
      setTotal(response.total ?? 0);
      setItemCount(response.itemCount ?? mappedItems.length);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      setItems([]);
      setTotal(0);
      setItemCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (itemId: string, itemType: 'course' | 'product', quantity: number = 1) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des articles au panier.');
      return;
    }

    try {
      await apiService.addToCart(itemId, itemType, quantity);
      await fetchCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string, itemType: 'course' | 'product') => {
    if (!user) return;

    try {
      await apiService.removeFromCart(itemId, itemType);
      await fetchCart();
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, itemType: 'course' | 'product', quantity: number) => {
    if (!user) return;

    try {
      await apiService.updateCartItem(itemId, itemType, quantity);
      await fetchCart();
    } catch (error: any) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await apiService.clearCart();
      await fetchCart();
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};