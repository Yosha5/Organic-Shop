import './globals.css';
import { Hind_Siliguri } from 'next/font/google';
import { LangProvider } from '@/components/LangContext';
import { ShopProvider } from '@/components/CartContext';
import Shell from '@/components/Shell';

const font = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

export const metadata = {
  title: 'OrganicBazar | অর্গানিক বাজার – Pure & Natural Food',
  description: 'খাঁটি মধু, ঘি, তেল, মসলা ও আরও অনেক কিছু। Organic food with cash on delivery across Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={`${font.variable} font-sans`}>
        <LangProvider>
          <ShopProvider>
            <Shell>{children}</Shell>
          </ShopProvider>
        </LangProvider>
      </body>
    </html>
  );
}
