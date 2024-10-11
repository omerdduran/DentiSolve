import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { signToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    console.log('Login attempt started');
    try {
        const { username, password } = await request.json();
        console.log('Received login request for username:', username);

        if (!username || !password) {
            console.log('Login failed: Missing username or password');
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        console.log('Searching for user in database');
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            console.log('Login failed: User not found');
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        console.log('User found in database');

        console.log('Hashing provided password');
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
            console.log('Login failed: Incorrect password');
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        console.log('Password verified successfully');

        console.log('Generating token');
        const token = signToken({ userId: user.id, username: user.username });
        console.log('Token generated successfully');

        const response = NextResponse.json({
            message: 'Login successful',
            token: token // Token'ı response body'sine ekledik
        }, { status: 200 });

        console.log('Setting cookie');
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600, // 1 saat
            path: '/'
        });
        console.log('Cookie set successfully');

        console.log('Login process completed successfully');
        return response;
    } catch (error) {
        console.error('Detailed login error:', error);
        return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
    } finally {
        console.log('Disconnecting from database');
        await prisma.$disconnect();
    }
}