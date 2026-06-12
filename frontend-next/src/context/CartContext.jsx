'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { userProfile } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const loadingRef = useRef(false);
  const userIdRef = useRef(null);

  useEffect(() => { userIdRef.current = userProfile?.id; }, [userProfile?.id]);

  const storageKey = useCallback((key) => `core_${userProfile?.id || 'anon'}_${key}`, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile?.id) return;
    const savedCart = localStorage.getItem(storageKey('cart'));
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, [userProfile?.id, storageKey]);

  useEffect(() => {
    if (!userProfile?.id || cartItems.length === 0) return;
    localStorage.setItem(storageKey('cart'), JSON.stringify(cartItems));
  }, [cartItems, userProfile?.id, storageKey]);

  const loadCart = useCallback(async () => {
    const userId = userProfile?.id;
    if (!userId || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await api.cart.getAll();
      const items = data.map(item => ({
        id: item.product_id,
        ...item.product_data,
        qty: item.qty,
        cart_item_id: item.id,
      }));
      const saved = localStorage.getItem(`core_${userId}_cart`);
      if (saved) {
        const local = JSON.parse(saved);
        if (local.length > 0 && items.length === 0) return;
        if (local.length > 0 && items.length > 0) {
          const merged = [...local];
          const localIds = new Set(local.map(i => i.id));
          for (const apiItem of items) {
            if (!localIds.has(apiItem.id)) merged.push(apiItem);
          }
          setCartItems(merged);
          return;
        }
      }
      setCartItems(items);
    } catch (e) {
      console.error('Error loading cart:', e);
    } finally {
      loadingRef.current = false;
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      loadCart();
    }
  }, [userProfile?.id, loadCart]);

  useEffect(() => {
    const totalCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    setCartCount(totalCount);
  }, [cartItems]);

  const addToCart = useCallback(async (product) => {
    const { default: supabase } = await import('../lib/supabase');


    const selectedQty = product.qty || 1;
    const normalizedProduct = {
      ...product,
      title: product.title || product.name || 'Product',
      name: product.name || product.title || 'Product',
      image: product.image || product.image_url || '',
      image_url: product.image_url || product.image || '',
      seller: product.seller || product.supplier || 'Core Collective',
      specs: product.specs || product.description || product.category || 'Standard product',
    };

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === normalizedProduct.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === normalizedProduct.id ? { ...item, qty: (item.qty || 1) + selectedQty } : item
        );
      }
      return [...prev, { ...normalizedProduct, qty: selectedQty }];
    });

    try {
      await api.cart.add(normalizedProduct.id, selectedQty, normalizedProduct);
    } catch (e) {
      console.error('Error syncing cart:', e);
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    try {
      await api.cart.remove(productId);
    } catch (e) {
      console.error('Error removing from cart:', e);
    }
  }, []);

  const clearCartFn = useCallback(async () => {
    setCartItems([]);
    try {
      await api.cart.clear();
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  }, []);

  const updateQty = useCallback((itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, qty: newQty } : i));
    api.cart.updateQty(itemId, newQty).catch(console.error);
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, cartCount, addToCart, removeFromCart, clearCart: clearCartFn, updateQty, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
