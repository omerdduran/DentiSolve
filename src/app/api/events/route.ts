import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');

        const events = await prisma.event.findMany({
            where: patientId ? {
                patientId: parseInt(patientId)
            } : undefined,
            orderBy: {
                start: 'desc'
            }
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
