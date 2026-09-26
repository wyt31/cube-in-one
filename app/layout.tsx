import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Cube in One",
  description: "Fewer Clicks, More Practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* cubing/twisty — load the <twisty-player> custom element from the
            official CDN as a native ESM module. This registers the global
            custom element; pages that render <twisty-player> just use it.
            We use the CDN (not the npm package) because Next.js's webpack
            cannot bundle cubing.js's web-worker + WASM modules — see
            https://github.com/cubing/cubing.js/issues/323. */}
        <script
          type="module"
          src="https://cdn.cubing.net/v0/js/cubing/twisty"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
