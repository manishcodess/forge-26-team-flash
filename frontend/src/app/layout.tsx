import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResQFlow AI — Autonomous Climate Emergency Response & Relief Logistics",
  description: "Autonomous disaster response platform for flood monitoring, deterministic inventory allocation, and verified route planning in Bihar, India.",
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
