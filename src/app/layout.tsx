import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

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
  description: "Jazida - Pokémons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Jazida - Pokémons: Gerencie, batalhe e divirta-se com seus pokémons favoritos!" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#facc15" />

        {/* Open Graph */}
        <meta property="og:title" content="Jazida - Pokémons" />
        <meta property="og:description" content="Gerencie, batalhe e divirta-se com seus pokémons favoritos!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jazida.pokemon.majorssolutions.com.br/" />
        <meta property="og:image" content="/og-image.webp" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jazida - Pokémons" />
        <meta name="twitter:description" content="Gerencie, batalhe e divirta-se com seus pokémons favoritos!" />
        <meta name="twitter:image" content="/og-image.webp" />

        {/* android-chrome */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" />
        <link rel="icon" href="/android-chrome-512x512.png" sizes="512x512" />
        <link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" />

        {/* favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
