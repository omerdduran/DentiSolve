import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    console.log('Logout API called');

    try {
        // Create the response first
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Check if token exists and delete it
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        console.log('Current token cookie:', token ? 'exists' : 'does not exist');

        // Clear the cookie in the response
        console.log('Attempting to clear cookie');
        
        // Method 1: Set an expired cookie in the response
        response.cookies.set({
            name: 'token',
            value: '',
            expires: new Date(0),
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        });
        
        // Method 2: Delete the cookie from the cookie store
        cookieStore.delete('token');
        console.log('Cookie deleted from cookie store');
        
        // Method 3: Set cookie with maxAge 0 (immediately expires)
        cookieStore.set('token', '', { maxAge: 0 });
        console.log('Cookie set with maxAge 0');

        return response;
    } catch (error) {
        console.error('Error during logout process:', error);
        return NextResponse.json(
            { message: 'Internal server error during logout' },
            { status: 500 }
        );
    }
}