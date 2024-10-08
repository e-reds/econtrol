import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider"
import Header from '@/components/Header/Header';
export const metadata = {
  title: 'eControl',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen">
        <Header />
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
