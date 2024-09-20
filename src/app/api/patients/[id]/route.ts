import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const patientId = params.id;
        const data = await request.json();

        const {
            firstName,
            lastName,
            dateOfBirth,
            homePhone,
            currentTreatment,
            medicalHistory,
            surgeryHistory,
            anyMedicalProblems,
            womenSpecificInfo
        } = data;

        const updatedPatient = await prisma.patient.update({
            where: { id: parseInt(patientId) },
            data: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                homePhone,
                currentTreatment,
                medicalHistory,
                surgeryHistory,
                anyMedicalProblems,
                womenSpecificInfo
            },
        });

        return NextResponse.json(updatedPatient);
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json({ error: 'Error updating patient' }, { status: 500 });
    }
}