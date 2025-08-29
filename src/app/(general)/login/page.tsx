"use client";
import { useFormState } from "react-dom";
import { login } from "@/app/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface LoginFormState {
  error: {
    email: string | null;
    password: string | null;
  };
  message: string | null;
}

export default function Page() {
  const [state, formAction] = useFormState<LoginFormState, FormData>(login, {
    error: { email: null, password: null },
    message: null,
  });

  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <form
        action={formAction}
        className="w-full max-w-lg mx-auto bg-base-200 p-12 rounded-lg drop-shadow-lg shadow-gray-300"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

        {registered && (
          <div className="mb-4 text-center text-green-500">
            Registration successful! Please login with your credentials.
          </div>
        )}

        {state.message && (
          <div className="mb-4 text-center text-red-500">{state.message}</div>
        )}

        <label className="block mb-4 text-lg font-semibold text-base-content">
          Email:
          <input
            type="email"
            name="email"
            className={`w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              state.error.email ? "border-red-500" : ""
            }`}
          />
          {state.error.email && (
            <p className="text-red-500 text-sm italic mt-1">{state.error.email}</p>
          )}
        </label>

        <label className="block mb-6 text-lg font-semibold text-base-content">
          Password:
          <input
            type="password"
            name="password"
            className={`w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              state.error.password ? "border-red-500" : ""
            }`}
          />
          {state.error.password && (
            <p className="text-red-500 text-sm italic mt-1">
              {state.error.password}
            </p>
          )}
        </label>

        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold btn btn-primary"
        >
          Login
        </button>

        <p className="mt-4 text-center text-base-content/80">
          Don&#39;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
