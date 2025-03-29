'use client';
// export const dynamic = 'force-dynamic' // Removed to allow caching


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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

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
        // Update sidebar visibility based on authentication and screen size
        setShowSidebar(isAuthenticated && pathname !== '/' && !isSmallScreen);
        setShowBottomNav(isSmallScreen && isAuthenticated && pathname !== '/');
    }, [pathname, isAuthenticated, isSmallScreen]);

    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;
    const { getOpenState } = sidebar;

    const sidebarClass = showSidebar && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72");
    
    // Determine if we're on the root route
    const isAuthRoute = pathname === '/';
    
    // Apply different background colors based on the route
    const mainBackgroundClass = isAuthRoute 
        ? "bg-slate-900" 
        : "bg-background dark:bg-[#0f172a]";

    return (
        <>
            {showSidebar && <Sidebar />}
            <main
                className={cn(
                    "min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300",
                    sidebarClass,
                    mainBackgroundClass
                )}
            >
                {children}
            </main>
            {showBottomNav && <BottomNav />}
        </>
    );
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    // Create a client
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0, // Verileri her zaman bayat olarak işaretle
                gcTime: 5 * 60 * 1000, // 5 dakika önbelleğe al
                refetchOnMount: true, // Bileşen mount olduğunda yeniden getir
                refetchOnWindowFocus: true, // Pencere odaklandığında yeniden getir
                refetchOnReconnect: true, // Yeniden bağlandığında yeniden getir
                retry: 1
            },
        },
    }));

    return (
        <html lang="en" className={`${inter.variable} ${roboto.variable}`} suppressHydrationWarning>
        <head>
            <title>DentiSolve</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MainContent>{children}</MainContent>
                    <Toaster />
                </AuthProvider>
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </QueryClientProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}