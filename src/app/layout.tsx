// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({subsets:["latin"]});

// export const metadata: Metadata = {
//   title: "Savvy",
//   description: "Your go to platform whenever you need help with finances",
// };

// export default function RootLayout({children}) {
//   return (
//     <html lang="en">
//       <body className={'${inter.className}'}>{children}</body>
//     </html>
//   );
// }
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs";
// import "./globals.css";
// import Header from "@/components/header";
// import {} from 'sonner'
// // import { Toaster } from "@/components/ui/toaster"

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head />
//       <body>
//         <main>{children}</main>
//       </body>
//     </html>
//   )
// }


// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Savvy",
//   description: "Your go-to platform whenever you need help with finances",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ClerkProvider>
//     <html>
//       <body className={inter.className}>
//         {/*header*/}
//         <Header/>
//         <main className="min-h-screen">{children}</main>
//         <Toaster/>
//         {/*footer*/}
//         <footer className="bg-blue-50 py-12">
//           <div className="container mx-auto px-4 text-center text-gray-600">
//             <p>Made through tutorial</p>
//           </div>
//         </footer>
//         </body>
//     </html>
//     </ClerkProvider>
//   );
// }
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Savvy",
  description: "Your go-to platform whenever you need help with finances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />

          <main className="min-h-screen">{children}</main>

          {/* Sonner toaster */}
          <Toaster richColors/>

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made through Next JS , Tailwind , Shadcn UI , React JS</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}

