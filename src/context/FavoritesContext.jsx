'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const loadingRef = useRef(false);

  const storageKey = useCallback((key) => `core_${userProfile?.id || 'anon'}_${key}`, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile?.id) return;
    const savedFav = localStorage.getItem(storageKey('fav'));
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, [userProfile?.id, storageKey]);

  useEffect(() => {
    if (!userProfile?.id || favorites.length === 0) return;
    localStorage.setItem(storageKey('fav'), JSON.stringify(favorites));
  }, [favorites, userProfile?.id, storageKey]);

  const loadFavorites = useCallback(async () => {
    const userId = userProfile?.id;
    if (!userId || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await api.favorites.getAll();
      const items = data.map(item => ({
        id: item.product_id,
        ...item.product_data,
        fav_id: item.id,
      }));
      const saved = localStorage.getItem(`core_${userId}_fav`);
      if (saved) {
        const local = JSON.parse(saved);
        if (local.length > 0 && items.length === 0) return;
        if (local.length > 0 && items.length > 0) {
          const merged = [...local];
          const localIds = new Set(local.map(i => i.id));
          for (const apiItem of items) {
            if (!localIds.has(apiItem.id)) merged.push(apiItem);
          }
          setFavorites(merged);
          return;
        }
      }
      setFavorites(items);
    } catch (e) {
      console.error('Error loading favorites:', e);
    } finally {
      loadingRef.current = false;
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      loadFavorites();
    }
  }, [userProfile?.id, loadFavorites]);

  const toggleFavorite = useCallback(async (product) => {

    const isFav = favorites.some(item => item.id === product.id);
    if (isFav) {
      setFavorites(prev => prev.filter(item => item.id !== product.id));
    } else {
      setFavorites(prev => [...prev, product]);
    }
    try {
      await api.favorites.toggle(product.id, product);
    } catch (e) {
      console.error('Error syncing favorite:', e);
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites, toggleFavorite, loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
