import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import DashboardNavigationBar from "@/components/DashboardNavigationBar";
import Providers from "../provider";
import { Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });
const getValidation = async () => {
  const res = await fetch("/api/validate");
  const data = await res.json();
  return data;
};
export const metadata: Metadata = {
  title: "Withdraw - Ez Miner",
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
        />
        <SpeedInsights></SpeedInsights>
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardNavigationBar>{children}</DashboardNavigationBar>
        </Suspense>
      </body>
    </html>
  );
}
