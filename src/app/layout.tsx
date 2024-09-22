'use client';

import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider, useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import Sidebar from "@/components/Navigation/SideBar";
import Head from "next/head";
import BottomNav from "@/components/Navigation/BottomNav";

const inter = Inter({ subsets: ["latin"] });

function MainContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        setShowSidebar(isAuthenticated && pathname !== '/login');
    }, [isAuthenticated, pathname]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {showSidebar && <Sidebar/>}
            <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : 'lg:ml-0'} pb-16`}>
                {children}
            </main>
            {showSidebar && <BottomNav />}
        </div>
    );
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <Head>
            <title>DentiSolve</title>
            <link rel="icon" href="/src/app/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <body className={inter.className}>
        <AuthProvider>
            <MainContent>{children}</MainContent>
        </AuthProvider>
        </body>
        </html>
    );
}