import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    console.log('DELETE request received for event ID:', params.id);
    try {
        const { id } = params;
        const deletedEvent = await prisma.event.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}