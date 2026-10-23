import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "STORE | Acessorios premium",
  description: "Loja moderna de acessorios, perfumes e tecnologia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              maxWidth: "240px",
              width: "auto",
              fontSize: "12px",
              padding: "8px 12px",
            },
          }}
        />
      </body>
    </html>
  );
}
