import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jazida - Pokémons",
  description: "Jazida - Pokémons: Gerencie, batalhe e divirta-se com seus pokémons favoritos!",
  openGraph: {
    title: "Jazida - Pokémons",
    description: "Gerencie, batalhe e divirta-se com seus pokémons favoritos!",
    url: "https://jazida.pokemon.majorssolutions.com.br/",
    siteName: "Jazida - Pokémons",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Jazida - Pokémons",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jazida - Pokémons",
    description: "Gerencie, batalhe e divirta-se com seus pokémons favoritos!",
    images: ["/og-image.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", sizes: "512x512" },
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#facc15",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
