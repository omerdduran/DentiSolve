import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Doğru kullanım
import { useAuth } from '../../context/AuthContext';

const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            login();
            router.push('/dashboard');
        } else {
            alert('Login failed');
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
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Giriş Yap
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;
