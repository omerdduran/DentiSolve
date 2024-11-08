'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Yolun doğru olduğundan emin olun
import Image from "next/image";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
    const { isAuthenticated, login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        console.log('Checking authentication status');
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedToken = localStorage.getItem('authToken');

        if (storedAuth === 'true' && storedToken) {
            try {
                console.log('Validating stored token');
                const response = await fetch('/api/validateToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: storedToken }),
                });

                if (response.ok) {
                    console.log('Token is valid, logging in');
                    await login(storedToken);
                    router.push('/protected/dashboard');
                    return; // Early return to prevent setting isLoading to false
                } else {
                    console.log('Token is invalid, clearing local storage');
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('Token validation error:', error);
            }
        } else {
            console.log('No stored authentication found');
        }
        setIsLoading(false);
    }, [login, router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleSuccessfulLogin = useCallback((token: string) => {
        console.log('Login successful, setting local storage');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', token);
        login(token);
        router.push('protected/dashboard');
    }, [login, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-ilhanblue">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        console.log('User is already authenticated, redirecting to dashboard');
        router.push('protected/dashboard');
        return null;
    }

    console.log('Rendering login screen');
    return (
        <div className="flex flex-col items-center min-h-screen bg-ilhanblue">
            <Image
                src="/Ilhan-Clinic.png"
                alt="Dentisolve Logo"
                width={250}
                height={80}
                className="pt-8 sm:pt-16 md:pt-24 lg:pt-32"
            />
            <LoginScreen onSuccessfulLogin={handleSuccessfulLogin} />
        </div>
    );
}