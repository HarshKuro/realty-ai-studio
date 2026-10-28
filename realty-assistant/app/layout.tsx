import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Realty Assistant | AI Property Video Studio',
  description: 'Minimalist editorial property video marketing studio with local Kokoro narration and FFmpeg rendering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0C0E] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

