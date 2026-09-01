import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'API Forge AI — Universal AI Model Playground & API Debugger',
  description: 'A premium, universal AI API testing and experimentation platform. Test any endpoint, model ID, API key, custom authentication, and streaming responses with zero external visual dependencies.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
