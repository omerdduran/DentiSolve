"use client";

import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import LoginScreen from "@/components/LoginScreen";

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
            login();
            router.push('/dashboard');
        }
    }, []);

    if (isAuthenticated) {
        return null; // or a loading spinner
    }

    // TODO: DentiSolve Logo ekle
    return (
        <div className="flex flex-col items-center min-h-screen bg-ilhanblue">
            <Image
                src="/Ilhan-Clinic.png"
                alt="Dentisolve Logo"
                width={250}
                height={80}
                className="pt-8 sm:pt-16 md:pt-24 lg:pt-32"
            />
            <LoginScreen></LoginScreen>
        </div>
    );
}