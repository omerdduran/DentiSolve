'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';  // AuthContext'inizin doğru olduğundan emin olun
import Image from 'next/image';
import LoginScreen from '@/components/LoginScreen';

export default function LoginPage() {
    const { isAuthenticated, login } = useAuth();  // isAuthenticated ve login fonksiyonlarını alın
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendirin
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSuccessfulLogin = (token: string) => {
        // Başarılı girişten sonra token'ı sakla
        localStorage.setItem('authToken', token);
        login(token);  // login fonksiyonunu kullanarak kullanıcıyı giriş yapmış duruma getir
        router.push('/dashboard');  // Giriş sonrası yönlendirme
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-ilhanblue">
            <Image
                src="/Ilhan-Clinic.png"
                alt="Clinic Logo"
                width={250}
                height={80}
                className="pt-8 sm:pt-16 md:pt-24 lg:pt-32"
            />
            <LoginScreen onSuccessfulLogin={handleSuccessfulLogin} />
        </div>
    );
}
