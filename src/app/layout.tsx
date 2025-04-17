import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DestructorBR",
  description: "Web3 dApp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          <ThirdwebProvider>{children}
          </ThirdwebProvider>
      </body>
    </html>
  );
}
