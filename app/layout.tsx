import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pump.fun Graduated Library",
  description: "Browse graduated Pump.fun tokens organized by market cap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg">
        {children}
      </body>
    </html>
  );
}
