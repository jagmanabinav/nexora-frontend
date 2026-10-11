import type { Metadata } from "next";
import "../styles/globals.css";
import { RootProvider } from "@nexora/shared";

export const metadata: Metadata = {
  title: "FabWash - Textile Fabric Washing",
  description: "Textile fabric receiving and washing operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
