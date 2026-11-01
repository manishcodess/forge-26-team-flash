import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResQ — Disaster Relief & Resource Allocation Platform",
  description: "Disaster response and logistics platform optimizing emergency relief supply allocation, flood hazard tracking, and dispatch coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
