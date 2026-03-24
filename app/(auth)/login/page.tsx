"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * /login — Sign-in page with Email/Password and Google OAuth.
 * Redirects authenticated users straight to /dashboard/edit.
 */
export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Email/Password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If user is already signed in, skip login
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/edit");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
        </div>
      </div>
    );
  }

  // Friendly error messages for Firebase auth error codes
  const getErrorMessage = (err: unknown): string => {
    if (!(err instanceof Error)) return "Something went wrong. Please try again.";
    const code = (err as { code?: string }).code;
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email. Try signing up.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return err.message || "Something went wrong. Please try again.";
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard/edit");
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setSigningIn(false);
    }
  };

  // Email/Password handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSigningIn(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard/edit");
    } catch (err) {
      console.error("Email auth failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-48 right-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[140px]" />

      {/* Login card — gradient border wrapper */}
      <div className="card-enter relative z-10 mx-4 w-full max-w-md rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 p-[1px]">
        <div className="rounded-2xl bg-gray-950/80 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
          {/* Brand mark */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-widest text-white">
              CNX<span className="text-indigo-500">.</span>
            </h1>
            <p className="mt-2 text-sm italic text-gray-400">
              Your digital identity.
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={signingIn}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  disabled={signingIn}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (sign-up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={signingIn}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={signingIn}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {isSignUp ? "Creating account…" : "Signing in…"}
                </span>
              ) : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle sign-in / sign-up */}
          <p className="mt-4 text-center text-sm text-gray-400">
            {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setConfirmPassword("");
              }}
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          {/* Divider with "or" */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-xs font-medium text-gray-500">or</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Google "G" icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            Continue with Google
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="shrink-0 text-red-400/60 transition-colors hover:text-red-400"
                aria-label="Dismiss error"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <button
              type="button"
              className="text-indigo-400 hover:text-indigo-300"
              tabIndex={0}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-indigo-400 hover:text-indigo-300"
              tabIndex={0}
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
