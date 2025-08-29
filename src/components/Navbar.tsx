"use client";
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/context/sessionProvider";
import { logout } from "@/app/actions";

import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function Navbar({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useSession();
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="drawer h-screen">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle h-16 flex-none"
        ref={checkboxRef}
      />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-none">
          <div className="navbar-start">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="my-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-6 w-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>

            <Link className="btn btn-ghost text-xl" href="/">
              Scriptorium
            </Link>
          </div>

          <div className="navbar-center hidden lg:block">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/execute">Code Editor</Link>
              </li>
              <li>
                <Link href="/templates">Templates</Link>
              </li>
              <li>
                <Link href="/blogs">Blogs</Link>
              </li>
              {session?.role === "admin" && (
                <li>
                  <Link href="/admin">Admin</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="navbar-end">
            <div className="m-2">
              <ThemeToggle theme={theme} />
            </div>

            {session ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="avatar w-10 rounded-full">
                    <Image
                      alt="avatar"
                      src={session.avatar}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                  <li className="p-3 text-primary font-bold">
                    Welcome, {session.firstName} {session.lastName}
                  </li>
                  <li>
                    <Link className="justify-between" href="/settings/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <a
                      onClick={async () => {
                        await logout();
                        router.refresh();
                        toast.success("Logged out successfully.");
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex space-x-1">
                <Link className="btn btn-sm btn-ghost" href="/login">
                  Log In
                </Link>
                <Link className="btn btn-sm btn-primary" href="/signup">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu menu-lg bg-base-200 min-h-full w-80 p-4">
          {/* Sidebar content here */}
          <li>
            <Link
              href="/execute"
              onClick={() => {
                checkboxRef.current?.click();
              }}
            >
              Code Editor
            </Link>
          </li>
          <li>
            <Link
              href="/templates"
              onClick={() => {
                checkboxRef.current?.click();
              }}
            >
              Templates
            </Link>
          </li>
          <li>
            <Link
              href="/blogs"
              onClick={() => {
                checkboxRef.current?.click();
              }}
            >
              Blogs
            </Link>
          </li>
          {session?.role === "admin" && (
            <li>
              <Link
                href="/admin"
                onClick={() => {
                  checkboxRef.current?.click();
                }}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
