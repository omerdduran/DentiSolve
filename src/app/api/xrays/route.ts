import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('Received data:', data);

        // Verileri ayıkla
        const { patient, datePerformed, findings, impression, imageUrl } = data;

        // `patient` nesnesinden `id` alın
        const patientId = patient?.id;

        // Zorunlu alanları kontrol et (imageUrl artık boş string olabilir)
        if (!patientId || !datePerformed || !findings || !impression) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // X-ray kaydı oluştur
        const newXray = await prisma.xray.create({
            data: {
                patient: {
                    connect: { id: patientId }
                },
                datePerformed: new Date(datePerformed),
                findings: findings,
                impression: impression,
                imageUrl: imageUrl || null,  // imageUrl boşsa null olarak ayarla
            },
        });

        return NextResponse.json(newXray, { status: 201 });
    } catch (error) {
        console.error('Error creating X-ray:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const xrays = await prisma.xray.findMany({
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                datePerformed: 'desc',
            },
        });

        return NextResponse.json(xrays);
    } catch (error) {
        console.error('Error fetching X-rays:', error);
        return NextResponse.json({ error: 'Failed to fetch X-rays' }, { status: 500 });
    }
}
