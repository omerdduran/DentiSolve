import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const eventId = parseInt(params.id, 10);

    if (isNaN(eventId)) {
        return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
    }

    try {
        const { title, start, end, color, patientId } = await request.json();

        // Validate input
        if (!title || !start || !end || !color || !patientId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title,
                start: new Date(start),
                end: new Date(end),
                color,
                patientId: parseInt(patientId, 10),
            },
        });

        return NextResponse.json(updatedEvent);
    } catch (error: unknown) {
        console.error('Error updating event:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Error updating event', error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Add handlers for other HTTP methods if needed
export async function GET() {
    return NextResponse.json({ message: 'GET method not implemented' }, { status: 501 });
}

export async function POST() {
    return NextResponse.json({ message: 'POST method not implemented' }, { status: 501 });
}

export async function DELETE() {
    return NextResponse.json({ message: 'DELETE method not implemented' }, { status: 501 });
}