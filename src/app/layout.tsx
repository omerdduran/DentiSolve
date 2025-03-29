'use client';
export const dynamic = 'force-dynamic'


import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/admin-panel/footer";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";
import BottomNav from "@/components/Navigation/BottomNav";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
});

const roboto = Roboto({
    weight: ['400', '500', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
    preload: true,
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
});

function MainContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [showSidebar, setShowSidebar] = useState(false);
    const [showBottomNav, setShowBottomNav] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const handleResize = useCallback(() => {
        setIsSmallScreen(window.innerWidth < 1000);
    }, []);

    useEffect(() => {
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        setShowSidebar(isAuthenticated && pathname !== '/login' && !isSmallScreen);
        setShowBottomNav(isSmallScreen && isAuthenticated && pathname !== '/login');
    }, [isAuthenticated, pathname, isSmallScreen]);

    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;
    const { getOpenState } = sidebar;

    const sidebarClass = showSidebar && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72");

    return (
        <>
            {showSidebar && <Sidebar />}
            <main
                className={cn(
                    "min-h-screen transition-[margin-left] ease-in-out duration-300",
                    sidebarClass
                )}
            >
                {children}
            </main>
            {showBottomNav && <BottomNav />}
        </>
    );
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginOrRoot = pathname === '/login' || pathname === '/';
    
    return (
        <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
        <head>
            <title>DentiSolve</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className={`${inter.className} antialiased ${isLoginOrRoot ? 'bg-[#141824]' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
            <AuthProvider>
                <MainContent>{children}</MainContent>
                <Toaster />
            </AuthProvider>
        </body>
        </html>
    );
}