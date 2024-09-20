import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const newPatient = await prisma.patient.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                homePhone: data.homePhone,
                currentTreatment: data.currentTreatment,
                medicalHistory: data.medicalHistory,
                surgeryHistory: data.surgeryHistory,
                anyMedicalProblems: data.anyMedicalProblems,
                womenSpecificInfo: data.womenSpecificInfo,
            },
        });

        return NextResponse.json(newPatient);
    } catch (error) {
        console.error('Error adding patient:', error);
        return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const patients = await prisma.patient.findMany();
        return NextResponse.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}