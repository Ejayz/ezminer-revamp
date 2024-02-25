import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import IndexNavigationBar from "@/components/IndexNavigationBar";
import Providers from "../provider";
import { Suspense } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Register - Ez Miner",
  description:
    "Mine hashes using your cpu and convert them into crypto currency of your choice.",
  keywords:
    "mining, crypto, cpu, hash, withdraw,faucetpay,faucetpay.com,faucetpay.io,ezminer,ezminer.tech,ez minner,ez minner.tech easy minner, easy miner,mine real crypto , how to mine real crypto",
  authors: [
    { name: "WestnileOD", url: "https://twitter.com/westnileod" },
    { name: "Ejayz", url: "https://github.com/Ejayz" },
  ],
  publisher: "WestnileOD",
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Ez Miner - Real CPU Minning. No to cloud minning !",
    description:
      "Mine hashes using your cpu and convert them into crypto currency of your choice.",
    url: "https://ezminer.tech",
    siteName: "Ez Miner",
    locale: "en_US",
    type: "website",
  },
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
          <IndexNavigationBar>{children}</IndexNavigationBar>
        </Suspense>
      
      </body>
    </html>
  );
}
