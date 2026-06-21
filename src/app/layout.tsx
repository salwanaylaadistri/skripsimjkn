import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { UserLevelProvider } from "@/contexts/UserLevelContext";
import BottomNav from "@/components/layout/BottomNav";
import ScrollContainer from "@/components/layout/ScrollContainer";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mobile JKN",
  description: "Aplikasi Layanan BPJS Kesehatan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} h-full`}>
      <body className="h-full flex justify-center">
        <UserLevelProvider>
          <div className="w-full max-w-[430px] bg-white flex flex-col shadow-2xl" style={{ height: "100dvh" }}>
            <ScrollContainer>
              {children}
            </ScrollContainer>
            <BottomNav />
          </div>
        </UserLevelProvider>
      </body>
    </html>
  );
}


