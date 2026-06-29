'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await authClient.signIn.social({ provider: 'google' });
      if (signInError) {
        setError(signInError.message || 'Google sign in failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
        <GoogleIcon />
        {loading ? 'Redirecting...' : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}

export function AuthModal({
  mode,
  onModeChange,
  onSuccess,
}: {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const isLogin = mode === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let authError: { message?: string } | null = null;

    if (isLogin) {
      const res = await authClient.signIn.email({ email, password });
      authError = res.error;
    } else {
      const res = await authClient.signUp.email({ name, email, password });
      authError = res.error;
    }

    if (authError) {
      setError(authError.message || (isLogin ? 'Invalid credentials' : 'Something went wrong'));
      setLoading(false);
      return;
    }

    onSuccess();
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isLogin ? 'Sign In' : 'Create an Account'}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? 'Welcome back! Sign in to your account'
            : 'Sign up to start chatting with your PDFs'}
        </p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="auth-name">Name</Label>
            <Input
              id="auth-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isLogin ? undefined : 8}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? isLogin
              ? 'Signing in...'
              : 'Creating account...'
            : isLogin
              ? 'Sign In'
              : 'Create Account'}
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-popover px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <GoogleButton label={isLogin ? 'Sign in with Google' : 'Sign up with Google'} />

      <p className="mt-2 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
