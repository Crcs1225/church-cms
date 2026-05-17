import type { Metadata } from "next";
import { APP_TITLE, CHURCH_NAME_FULL, CHURCH_NAME_SHORT } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `${CHURCH_NAME_FULL} (${CHURCH_NAME_SHORT}) administration system`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
