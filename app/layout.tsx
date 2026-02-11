import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Majors of Pumpfun in the Last 30 Days",
  description: "The top graduated Pump.fun tokens organized by market cap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
