// src/app/api/xrays/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const xray = await prisma.xray.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!xray) {
            return NextResponse.json({ error: 'X-ray not found' }, { status: 404 });
        }
        return NextResponse.json(xray);
    } catch (error) {
        console.error('Error fetching X-ray:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        const updatedXray = await prisma.xray.update({
            where: { id: parseInt(params.id) },
            data: {
                datePerformed: new Date(data.datePerformed),
                findings: data.findings,
                impression: data.impression,
                imageUrl: data.imageUrl,
                patient: {
                    connect: { id: data.patient.id }
                }
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return NextResponse.json(updatedXray);
    } catch (error) {
        console.error('Error updating X-ray:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await prisma.xray.delete({
            where: { id: id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting X-ray:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}