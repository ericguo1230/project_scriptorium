"use client";
import { useFormState } from "react-dom";
import { register } from "@/app/actions";
import Link from "next/link";

export interface RegisterFormState {
  error: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
  };
  message: string | null | undefined;
}

export default function Page() {
  const [state, formAction] = useFormState<RegisterFormState, FormData>(
    register,
    {
      error: {
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        confirmPassword: null,
      },
      message: null,
    }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 py-12">
      <form
        action={formAction}
        className="w-full max-w-lg mx-auto bg-base-200 p-12 rounded-lg drop-shadow-lg shadow-gray-300"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

        {state.message && (
          <div className="mb-4 text-center text-red-500">{state.message}</div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="block text-lg font-semibold text-base-content">
            First Name:
            <input
              type="text"
              name="firstName"
              className={`w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                state.error.firstName ? "border-red-500" : ""
              }`}
            />
            {state.error.firstName && (
              <p className="text-red-500 text-sm italic mt-1">
                {state.error.firstName}
              </p>
            )}
          </label>

          <label className="block text-lg font-semibold text-base-content">
            Last Name:
            <input
              type="text"
              name="lastName"
              className={`w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                state.error.lastName ? "border-red-500" : ""
              }`}
            />
            {state.error.lastName && (
              <p className="text-red-500 text-sm italic mt-1">
                {state.error.lastName}
              </p>
            )}
          </label>
        </div>

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
        
        <label className="block mb-4 text-lg font-semibold text-base-content">
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

        <label className="block mb-6 text-lg font-semibold text-base-content">
          Confirm Password:
          <input
            type="password"
            name="confirmPassword"
            className={`w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              state.error.confirmPassword ? "border-red-500" : ""
            }`}
          />
          {state.error.confirmPassword && (
            <p className="text-red-500 text-sm italic mt-1">
              {state.error.confirmPassword}
            </p>
          )}
        </label>

        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold btn btn-primary"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-base-content/80">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
