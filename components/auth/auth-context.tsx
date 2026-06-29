'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthModal } from './auth-modal';

type AuthModalContextValue = {
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const openSignIn = useCallback(() => {
    setMode('login');
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setMode('register');
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openSignIn, openSignUp, closeAuthModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DialogContent>
          <AuthModal mode={mode} onModeChange={setMode} onSuccess={closeAuthModal} />
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
