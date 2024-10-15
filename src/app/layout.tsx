import { Inter } from "next/font/google";
import "./globals.css";
import { initializeFirebase } from "@/lib/firebase";

const inter = Inter({ subsets: ["latin"] });

initializeFirebase(); // Initialize Firebase when the app starts

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
