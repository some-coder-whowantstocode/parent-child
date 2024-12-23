
import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./storeProvider";
import Layout from "./popup/layout";
import { WorkerProvider } from "./lib/contexts/workerContext";

export const metadata: Metadata = {
  title: "parent-child",
  description: "Make the study better",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <WorkerProvider>
    <html lang="en">
      <body>
        <Layout>
            {children}
        </Layout>
      </body>
    </html>
      </WorkerProvider>
    </StoreProvider>
  );
}
