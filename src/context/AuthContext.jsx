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
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        if (!session) {
          // No stored session at all — a plain anonymous visitor. Calling
          // getUser() here would only report "Auth session missing!" and spam
          // the console, so skip it entirely.
          setLoading(false);
          return;
        }
        supabase.auth.getUser().then(({ data: { user }, error }) => {
          if (!error && user && !cancelled) {
            onUserReady(user);
          } else if (error && !cancelled) {
            // Do NOT wipe the session here on transient failures. A network blip
            // (or an in-flight OTP/refresh) can produce an error that looks like
            // an invalid session, which would auto-logout freshly signed-in
            // users. But when the server definitively rejects the stored session
            // (Auth session missing / invalid JWT), purge it locally so it stops
            // replaying SIGNED_IN events, 401-ing API calls, and spamming the
            // console on every page load. Local-only cleanup: no server call.
            const msg = (error?.message || '').toLowerCase();
            const transient = /failed to fetch|network|timeout|too many requests|rate limit/i.test(msg);
            const definitive = !transient && /session missing|invalid jwt|invalid token|refresh token not found|token has expired|access token has expired/i.test(msg);
            console.warn('getUser() could not restore session:', error?.message);
            if (definitive && typeof window !== 'undefined') {
              try {
                ['localStorage', 'sessionStorage'].forEach((store) => {
                  const storage = window[store];
                  const dead = [];
                  for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith('sb-')) dead.push(key);
                  }
                  dead.forEach((key) => storage.removeItem(key));
                });
              } catch {}
            }
          }
          if (!cancelled) setLoading(false);
        }).catch(() => { if (!cancelled) setLoading(false); });
      });

      const result = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user && !cancelled) {
          // Supabase replays the previously stored session as a SIGNED_IN event
          // on every page load — even when that session is no longer valid
          // server-side (e.g. the refresh token was rotated/invalidated, which
          // getUser() surfaces as "Auth session missing!"). Accepting it here
          // sets a stale userProfile, making the Cart/Favorites/Notifications
          // contexts fire authenticated API calls that 401, which then run
          // clearLocalAuth()/authExpired and wipe the profile icon. Authorita-
          // tively confirm the session with getUser() before trusting it.
          try {
            supabase.auth.getUser().then(({ data: { user }, error }) => {
              if (!error && user && !cancelled) {
                onUserReady(user);
              }
            }).catch(() => {});
          } catch {}
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
