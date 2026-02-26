import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
import {Toaster} from "sonner";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "ABI Explorer | Pro",
    description: "Modern smart contract interaction tool",
};

export default function RootLayout({
  children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      // 'dark' class ensures the Zinc theme is active
      // suppressHydrationWarning handles browser extension conflicts
      <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
      <Providers>{children}
          <Toaster theme="dark" position="top-center" richColors/>
      </Providers>
      </body>
    </html>
  );
}