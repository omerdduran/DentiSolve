"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Patient, Xray, Appointment } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { 
    usePatients, 
    usePatientXrays, 
    usePatientAppointments, 
    useUpdatePatient, 
    useDeletePatient, 
    useCreateAppointment 
} from '@/hooks/use-query-hooks';

// Dinamik importlar
const PatientModal = dynamic(() => import("@/components/Modals/PatientModal"), {
    loading: () => null,
    ssr: false
});

const FullScreenXrayModal = dynamic(() => import("@/components/Modals/FullScreenXrayModal"), {
    loading: () => null,
    ssr: false
});

const PatientList: React.FC = () => {
    const router = useRouter();
    const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
    
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPatientModalLoading, setIsPatientModalLoading] = useState<boolean>(false);
    const [isXrayModalLoading, setIsXrayModalLoading] = useState<boolean>(false);
    const [selectedXray, setSelectedXray] = useState<Xray | null>(null);
    const [isXrayModalOpen, setIsXrayModalOpen] = useState(false);

    // Fetch patient-specific data when a patient is selected
    const { 
        data: xrays = [], 
        isLoading: isLoadingXrays 
    } = usePatientXrays(selectedPatient?.id || 0, {
        enabled: !!selectedPatient && isModalOpen
    });
    
    const { 
        data: appointments = [], 
        isLoading: isLoadingAppointments 
    } = usePatientAppointments(selectedPatient?.id || 0, {
        enabled: !!selectedPatient && isModalOpen
    });

    // Mutations
    const updatePatientMutation = useUpdatePatient();
    const deletePatientMutation = useDeletePatient();
    const createAppointmentMutation = useCreateAppointment();

    // Update filtered patients when patients or search term changes
    useEffect(() => {
        if (patients) {
            if (searchTerm) {
                setFilteredPatients(
                    patients.filter(patient =>
                        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
            } else {
                setFilteredPatients(patients);
            }
        }
    }, [searchTerm, patients]);

    const handlePatientClick = (patient: Patient): void => {
        setIsPatientModalLoading(true);
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleUpdatePatient = async (updatedPatient: Patient): Promise<void> => {
        try {
            await updatePatientMutation.mutateAsync({ 
                id: updatedPatient.id, 
                data: updatedPatient 
            });
            setSelectedPatient(updatedPatient);
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!selectedPatient) return;

        try {
            await deletePatientMutation.mutateAsync(selectedPatient.id);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting patient:', error);
        }
    };

    const handleAddAppointment = async (appointment: { title: string; date: string }): Promise<void> => {
        if (!selectedPatient) return;

        try {
            await createAppointmentMutation.mutateAsync({ 
                ...appointment, 
                patientId: selectedPatient.id 
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
        }
    };

    const handleXrayClick = (xray: Xray): void => {
        setIsXrayModalLoading(true);
        setSelectedXray(xray);
        setIsXrayModalOpen(true);
    };

    if (isLoadingPatients) {
        return (
            <div className="p-6 min-h-screen bg-background">
                <div className="flex flex-col md:flex-row md:items-center mb-6">
                    <h1 className="text-2xl font-bold mb-4 md:mb-0 md:mr-6 text-foreground">Hasta Yönetimi</h1>
                    <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="h-12 bg-muted rounded-lg animate-pulse mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-background">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0 md:mr-6 text-foreground">Hasta Yönetimi</h1>
                <Button onClick={() => router.push('/protected/addpatient')}>Hasta Ekle</Button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Hasta ismi ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
            </div>

            <Suspense fallback={
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            }>
                <ul className="space-y-4">
                    {filteredPatients.map(patient => (
                        <li key={patient.id}
                            className="bg-card text-card-foreground p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-border"
                            onClick={() => handlePatientClick(patient)}>
                            <span className="font-semibold text-lg">{patient.firstName} {patient.lastName}</span>
                        </li>
                    ))}
                </ul>
            </Suspense>

            {isPatientModalLoading && isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md animate-pulse overflow-y-auto scrollbar-hide">
                        <div className="h-8 bg-muted rounded mb-4" />
                        <div className="space-y-4">
                            <div className="h-10 bg-muted rounded" />
                            <div className="h-10 bg-muted rounded" />
                            <div className="h-24 bg-muted rounded" />
                            <div className="h-24 bg-muted rounded" />
                            <div className="h-40 bg-muted rounded" />
                            <div className="flex justify-between mt-4">
                                <div className="h-10 bg-muted rounded w-24" />
                                <div className="h-10 bg-muted rounded w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && selectedPatient && (
                <PatientModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedPatient(null);
                    }}
                    patient={selectedPatient}
                    onUpdate={handleUpdatePatient}
                    onDelete={handleDelete}
                    onAddAppointment={handleAddAppointment}
                    appointments={appointments}
                    xrays={xrays}
                    isLoadingXrays={isLoadingXrays}
                    isLoadingAppointments={isLoadingAppointments}
                    onXrayClick={handleXrayClick}
                    onLoaded={() => setIsPatientModalLoading(false)}
                />
            )}

            {isXrayModalLoading && isXrayModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md animate-pulse overflow-y-auto scrollbar-hide">
                        <div className="h-8 bg-muted rounded mb-4" />
                        <div className="h-[400px] bg-muted rounded mb-4" />
                        <div className="flex justify-between">
                            <div className="h-10 bg-muted rounded w-24" />
                        </div>
                    </div>
                </div>
            )}

            {isXrayModalOpen && selectedXray && (
                <FullScreenXrayModal
                    isOpen={isXrayModalOpen}
                    onClose={() => {
                        setIsXrayModalOpen(false);
                        setSelectedXray(null);
                    }}
                    xray={selectedXray}
                    onLoaded={() => setIsXrayModalLoading(false)}
                />
            )}
        </div>
    );
};

export default PatientList;