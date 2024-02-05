import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import IndexNavigationBar from "@/components/IndexNavigationBar";
import Providers from "../provider";
import { Suspense } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Login - Ez Minner",
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
        <Suspense fallback={<div>Loading...</div>}>
          <IndexNavigationBar>{children}</IndexNavigationBar>
        </Suspense>
      
      </body>
    </html>
  );
}