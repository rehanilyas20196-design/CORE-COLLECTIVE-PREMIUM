'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let subscription = null;

    const clearStaleSession = async () => {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
      try {
        Object.keys(localStorage || {}).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
        Object.keys(sessionStorage || {}).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k); });
      } catch {}
    };

    const onUserReady = (user) => {
      if (cancelled) return;
      const profile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || ''
      };
      setUserProfile(profile);
      setIsAdmin(user.email === 'hinata4020196@gmail.com');
      setIsSupplier(!!user.user_metadata?.is_supplier);
    };

    if (supabase) {
      supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (!error && user && !cancelled) {
          onUserReady(user);
        } else if (error && !cancelled) {
          clearStaleSession();
        }
        if (!cancelled) setLoading(false);
      });

      const result = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user && !cancelled) {
          onUserReady(session.user);
        }
        if (event === 'SIGNED_OUT' && !cancelled) {
          setUserProfile(null);
          setIsAdmin(false);
        }
      });
      subscription = result.data.subscription;
    } else {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    const handleAuthChange = (e) => {
      const user = e.detail?.user;
      if (user) {
        const profile = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          phone: user.user_metadata?.phone || '',
          date_of_birth: user.user_metadata?.date_of_birth || '',
        };
        setUserProfile(profile);
        setIsAdmin(user.email === 'hinata4020196@gmail.com');
        setIsSupplier(!!user.user_metadata?.is_supplier);
      }
    };
    const handleAuthExpired = () => {
      setUserProfile(null);
      setIsAdmin(false);
      setIsSupplier(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('authChanged', handleAuthChange);
      window.addEventListener('authExpired', handleAuthExpired);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('authChanged', handleAuthChange);
        window.removeEventListener('authExpired', handleAuthExpired);
      }
    };
  }, []);

  const updateProfile = useCallback((profile) => {
    setUserProfile(profile);
  }, []);

  const updateAdmin = useCallback((admin) => {
    setIsAdmin(admin);
  }, []);

  return (
    <AuthContext.Provider value={{ userProfile, setUserProfile, isAdmin, setIsAdmin, isSupplier, setIsSupplier, updateProfile, updateAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
