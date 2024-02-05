import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import DashboardNavigationBar from "@/components/DashboardNavigationBar";
import Providers from "../provider";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Miner - Ez Miner",
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
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            limit={5}
          />
          <DashboardNavigationBar>{children}</DashboardNavigationBar>
        </Suspense>
      </body>
    </html>
  );
}
