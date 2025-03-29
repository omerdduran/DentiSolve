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
            router.push('protected/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSuccessfulLogin = (token: string) => {
        // Başarılı girişten sonra token'ı sakla
        localStorage.setItem('authToken', token);
        login(token);  // login fonksiyonunu kullanarak kullanıcıyı giriş yapmış duruma getir
        router.push('protected/dashboard');  // Giriş sonrası yönlendirme
    };

    return (
        <div className="min-h-screen bg-[#141824] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-6">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/Ilhan-Clinic.png"
                        alt="DentiSolve Logo"
                        width={200}
                        height={65}
                        priority
                        quality={90}
                        className="drop-shadow-lg w-auto h-auto"
                        style={{ width: '200px', height: 'auto' }}
                    />
                </div>
            </div>
            
            <LoginScreen onSuccessfulLogin={handleSuccessfulLogin} />
            
            <div className="mt-8 text-center text-xs text-gray-400">
                <p>Güvenli giriş için lütfen kullanıcı adı ve şifrenizi giriniz.</p>
            </div>
        </div>
    );
}
