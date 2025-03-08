import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const deletedPatient = await prisma.patient.delete({
            where: {
                id: parseInt(id),
            },
        });

        return NextResponse.json(deletedPatient);
    } catch (error) {
        console.error('Error deleting patient:', error);
        return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
    }
}
