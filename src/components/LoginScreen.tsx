import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
    onSuccessfulLogin: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessfulLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt started');
        setIsLoading(true);
        setError('');

        try {
            console.log('Sending request to /api/login');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            console.log('Response received', response.status);

            if (response.ok) {
                const data = await response.json();
                login(data.token);  // token'ı login fonksiyonuna geçiriyoruz
                if (onSuccessfulLogin) {
                    onSuccessfulLogin(data.token);
                }
                router.push('/protected/dashboard');  // Yönlendirmeyi değiştirdik
            } else {
                const errorData = await response.json();
                console.log('Login failed', errorData);
                setError(errorData.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsLoading(false);
            console.log('Login attempt finished');
        }
    };

    return (
        <div className="flex flex-col items-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <input
                    type="text"
                    placeholder="Kullanıcı adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;