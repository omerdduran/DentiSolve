import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    console.log('Logout API called');

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        console.log('Current token cookie:', token ? 'exists' : 'does not exist');

        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        console.log('Attempting to clear cookie');
        response.cookies.set({
            name: 'token',
            value: '',
            expires: new Date(0),
            path: '/',
            sameSite: 'lax', // 'none' yerine 'lax' kullanıyoruz, çünkü 'none' sadece HTTPS gerektirir
            secure: process.env.NODE_ENV !== 'development', // Geliştirme ortamında HTTPS olmayabilir
            httpOnly: true
        });

        // Cookie'nin silinip silinmediğini kontrol et
        const updatedToken = response.cookies.get('token');
        console.log('Updated token cookie:', updatedToken ? 'still exists (this is unexpected)' : 'successfully removed');

        if (updatedToken) {
            console.warn('Warning: Token cookie could not be removed');
        }

        return response;
    } catch (error) {
        console.error('Error during logout process:', error);
        return NextResponse.json(
            { message: 'Internal server error during logout' },
            { status: 500 }
        );
    }
}