import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username, password, email } = await request.json();

        if (!username || !password || !email) {
            return NextResponse.json({ message: 'Username, password, and email are required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
            }
            if (existingUser.email === email) {
                return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
            }
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
        });

        return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}