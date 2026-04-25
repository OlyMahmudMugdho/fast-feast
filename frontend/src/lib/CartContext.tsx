'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

interface CartItem {
  id: string;
  name: string;
  price: string;
  image_url: string;
  quantity: number;
  shop_id: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Sync userId from localStorage
  useEffect(() => {
    const updateUserId = () => {
      const storedId = localStorage.getItem('userId');
      setUserId(storedId);
    };

    updateUserId();
    window.addEventListener('storage', updateUserId);
    return () => window.removeEventListener('storage', updateUserId);
  }, []);

  // Load cart from user-specific key
  useEffect(() => {
    if (userId) {
      const savedCart = localStorage.getItem(`cart_${userId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [userId]);

  // Save cart to user-specific key
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  const addToCart = (item: any) => {
    setCart(prev => {
      if (prev.length > 0 && prev[0].shop_id !== item.shop_id) {
        message.warning('You can only order from one shop at a time. Clearing previous cart.');
        return [{ ...item, quantity: 1 }];
      }

      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    message.success(`${item.name} added to cart`);
    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }
  };

  const total = cart.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
