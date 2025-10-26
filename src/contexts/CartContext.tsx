import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const fetchCart = useCallback(async () => {
    // Support both authenticated cart (server) and guest cart (localStorage)
    if (!user) {
      try {
        const guestRaw = localStorage.getItem('guest_cart');
        const guestItems: Array<{ itemId: string; itemType: string; quantity?: number; name?: string; price?: number; image?: string }> = guestRaw ? JSON.parse(guestRaw) : [];
        const mappedItems: CartItem[] = (guestItems || []).map((item) => ({
          id: `${item.itemType}_${item.itemId}`,
          name: item.name ?? '',
          price: item.price ?? 0,
          image: item.image ?? '',
          quantity: item.quantity ?? 1,
          type: item.itemType as 'course' | 'product',
          itemId: item.itemId?.toString() ?? '',
        }));

        const totalCalc = mappedItems.reduce((s, it) => s + (it.price * it.quantity), 0);

        setItems(mappedItems);
        setTotal(totalCalc);
        setItemCount(mappedItems.reduce((s, it) => s + it.quantity, 0));
      } catch (error: unknown) {
        console.error('Error fetching guest cart:', error);
        setItems([]);
        setTotal(0);
        setItemCount(0);
      }
      return;
    }

    try {
      const response = await apiService.getCart();
      const mappedItems: CartItem[] = (response.items || []).map((item: { type: string; itemId: string; name?: string; price?: number; image?: string; quantity?: number }) => ({
        id: `${item.type}_${item.itemId}`,
        name: item.name ?? '',
        price: item.price ?? 0,
        image: item.image ?? '',
        quantity: item.quantity ?? 1,
        type: item.type as 'course' | 'product',
        itemId: item.itemId?.toString() ?? '',
      }));

      setItems(mappedItems);
      setTotal((response.total as number) ?? 0);
      setItemCount((response.itemCount as number) ?? mappedItems.length);
    } catch (error: unknown) {
      console.error('Error fetching cart:', error);
      setItems([]);
      setTotal(0);
      setItemCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (itemId: string, itemType: 'course' | 'product', quantity: number = 1) => {
    // If user is not authenticated, save to guest cart in localStorage
    if (!user) {
      try {
        const guestRaw = localStorage.getItem('guest_cart');
          const guestItems: Array<{ itemId: string; itemType: string; quantity?: number }> = guestRaw ? JSON.parse(guestRaw) : [];

          const existing = guestItems.find(i => i.itemId?.toString() === itemId && i.itemType === itemType);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + quantity;
        } else {
          guestItems.push({ itemId, itemType, quantity });
        }

        localStorage.setItem('guest_cart', JSON.stringify(guestItems));
        await fetchCart();
        return;
      } catch (error: unknown) {
        console.error('Error adding to guest cart:', error);
        throw error;
      }
    }

    try {
      await apiService.addToCart(itemId, itemType, quantity);
      await fetchCart();
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string, itemType: 'course' | 'product') => {
    if (!user) {
      try {
        const guestRaw = localStorage.getItem('guest_cart');
          const guestItems: Array<{ itemId: string; itemType: string; quantity?: number }> = guestRaw ? JSON.parse(guestRaw) : [];
          const filtered = guestItems.filter(i => !(i.itemId?.toString() === itemId && i.itemType === itemType));
          localStorage.setItem('guest_cart', JSON.stringify(filtered));
          await fetchCart();
          return;
        } catch (error: unknown) {
          console.error('Error removing from guest cart:', error);
          throw error;
        }
    }

    try {
      await apiService.removeFromCart(itemId, itemType);
      await fetchCart();
    } catch (error: unknown) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, itemType: 'course' | 'product', quantity: number) => {
    if (!user) {
      try {
        const guestRaw = localStorage.getItem('guest_cart');
          const guestItems: Array<{ itemId: string; itemType: string; quantity?: number }> = guestRaw ? JSON.parse(guestRaw) : [];
          const existing = guestItems.find(i => i.itemId?.toString() === itemId && i.itemType === itemType);
        if (existing) {
          existing.quantity = quantity;
          localStorage.setItem('guest_cart', JSON.stringify(guestItems));
        }
        await fetchCart();
        return;
      } catch (error: unknown) {
        console.error('Error updating guest cart quantity:', error);
        throw error;
      }
    }

    try {
      await apiService.updateCartItem(itemId, itemType, quantity);
      await fetchCart();
    } catch (error: unknown) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      try {
        localStorage.removeItem('guest_cart');
        await fetchCart();
        return;
      } catch (error: unknown) {
        console.error('Error clearing guest cart:', error);
        throw error;
      }
    }

    try {
      await apiService.clearCart();
      await fetchCart();
    } catch (error: unknown) {
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