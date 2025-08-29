import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Toastify
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { auth, getTheme } from "@/app/actions";
import SessionProvider from "@/context/sessionProvider";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scriptorium",
  description: "A place to write and share your code",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await auth();
  const theme = await getTheme();
  
  return (
    <html lang="en" data-theme={theme} data-color-mode={theme === "dark" ? "dark" : "light"} className={roboto.className} suppressHydrationWarning>
      <body>
        <SessionProvider session={sessionData}>
          {children}
          <ToastContainer position="bottom-right"/>
        </SessionProvider>
      </body>
    </html>
  );
}
