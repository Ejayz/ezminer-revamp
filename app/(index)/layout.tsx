import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import IndexNavigationBar from "@/components/IndexNavigationBar";
import Providers from "../provider";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Login - Ez Miner",
  description:
    "Mine hashes using your cpu and convert them into crypto currency of your choice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme={"custom1"} lang="en">
      <body>
        <script
          src="https://alwingulla.com/88/tag.min.js"
          data-zone="42334"
          async
          data-cfasync="false"
        ></script>
      </body>
      <body className={inter.className}>
        <SpeedInsights></SpeedInsights>
        <Suspense fallback={<div>Loading...</div>}>
          <IndexNavigationBar>{children}</IndexNavigationBar>
        </Suspense>
      </body>
    </html>
  );
}
