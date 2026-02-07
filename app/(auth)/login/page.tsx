"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Mail, Loader2, Chrome } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogle = async () => {
    setLoading("google");
    await signIn("google", { callbackUrl });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    const res = await signIn("email", {
      email,
      callbackUrl,
      redirect: false,
    });
    setLoading(null);
    if (res?.ok) setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-600 text-sm">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={!!loading}
        className="btn-secondary w-full gap-3"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email magic link */}
      <form onSubmit={handleEmail} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="input-base"
        />
        <button
          type="submit"
          disabled={!!loading || !email}
          className="btn-primary w-full"
        >
          {loading === "email" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Send Magic Link
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Luxe<span className="text-blue-600">Store</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your account
            </p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </div>
          }>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-700">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
