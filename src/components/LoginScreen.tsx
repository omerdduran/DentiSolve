import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';

interface LoginScreenProps {
    onSuccessfulLogin: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessfulLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Kullanıcı adı ve şifre gereklidir.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.token);
                if (onSuccessfulLogin) {
                    onSuccessfulLogin(data.token);
                }
                router.push('/protected/dashboard');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-card rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-2xl font-bold text-center text-foreground mb-6">DentiSolve&apos;a Hoş Geldiniz</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        <User size={18} />
                    </div>
                    <Input
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                    />
                </div>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        <Lock size={18} />
                    </div>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                
                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Giriş yapılıyor...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <LogIn className="mr-2" size={18} />
                            Giriş Yap
                        </div>
                    )}
                </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} DentiSolve. Tüm hakları saklıdır.</p>
            </div>
        </div>
    );
};

export default LoginScreen;