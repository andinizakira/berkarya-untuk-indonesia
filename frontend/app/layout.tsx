import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Berkarya Untuk Indonesia",
  description: "Satu Ide. Satu Karya. Satu Dampak. — Inisiatif pemuda Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.className}>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
