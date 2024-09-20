export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    currentTreatment: string;
    homePhone?: string;
    medicalHistory?: string;
    surgeryHistory?: string;
    anyMedicalProblems?: string;
    womenSpecificInfo?: string;
}

export interface Event {
    id: number;
    title: string;
    start: string;
    end: string;
    color: string;
    patientId: number;
}

export interface Xray {
    id: number;
    patient: {
        id: number;
        firstName: string;
        lastName: string;
    };
    datePerformed: string;
    findings: string;
    impression: string;
    imageUrl: string;
}

export interface Appointment {
    id: number;
    title: string;
    date: string;
    patientId: number;
}

export interface RecentXraysProps {
    xrays: Xray[];
}

export interface PatientFormData {
    id?: number;  // optional, yeni hasta ekleme durumu için
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    homePhone: string;
    currentTreatment: string;
    medicalHistory: string;
    surgeryHistory: string;
    anyMedicalProblems: string;
    womenSpecificInfo: string;
}