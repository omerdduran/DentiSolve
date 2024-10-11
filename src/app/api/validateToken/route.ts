import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        console.log('Received token:', token); // Token'ı loglayalım

        if (!token) {
            return NextResponse.json({ message: 'Token is required' }, { status: 400 });
        }

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            console.error('JWT_SECRET is not defined');
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully', decoded);
            return NextResponse.json({ valid: true, user: decoded });
        } catch (error) {
            console.error('Token verification failed', error);
            if (error instanceof jwt.JsonWebTokenError) {
                console.error('JWT Error details:', error.message);
            }
            return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 401 });
        }
    } catch (error) {
        console.error('Error in validateToken route', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}