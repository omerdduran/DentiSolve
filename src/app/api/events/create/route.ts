import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { title, date, start, end, color, patientId } = await request.json();

        if (!title || (!date && (!start || !end)) || patientId === undefined) {
            return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
        }

        let eventData: any = {
            title,
            patientId: parseInt(patientId, 10),
        };

        if (date) {
            // Eski format
            eventData.date = new Date(date);
        } else {
            // Yeni format
            eventData.start = new Date(start);
            eventData.end = new Date(end);
            eventData.color = color || '#3788d8'; // Varsayılan renk
        }

        const newEvent = await prisma.event.create({
            data: eventData,
        });

        return NextResponse.json(newEvent);
    } catch (error) {
        console.error('Etkinlik oluşturma hatası:', error);
        return NextResponse.json({ error: 'Etkinlik oluşturulamadı' }, { status: 500 });
    }
}