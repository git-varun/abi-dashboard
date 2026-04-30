import type {Metadata} from "next";
import {Space_Grotesk} from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import {ClientProviders} from "./ClientProviders";

const spaceGrotesk = Space_Grotesk({subsets: ["latin"], weight: ["300","400","500","600","700"]});

export const metadata: Metadata = {
    title: "ABI Workbench | Pro",
    description: "Modern smart contract interaction tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning>
      <head>
          <link
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
              rel="stylesheet"
          />
      </head>
      <body suppressHydrationWarning className={`${spaceGrotesk.className} bg-background text-on-background antialiased`}>
      <ClientProviders>
          {children}
          <Toaster position="top-center" richColors/>
      </ClientProviders>
      </body>
    </html>
  );
}
