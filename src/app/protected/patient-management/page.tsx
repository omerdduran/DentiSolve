"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Patient, Xray, Appointment } from '@/shared/types';
import { formatDate } from '@/shared/utils';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";

// Dinamik importlar
const PatientModal = dynamic(() => import("@/components/Modals/PatientModal"), {
    loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
        </div>
    </div>
});

const FullScreenXrayModal = dynamic(() => import("@/components/Modals/FullScreenXrayModal"), {
    loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg animate-pulse">
            <div className="h-96 w-96 bg-gray-200 rounded" />
        </div>
    </div>
});

// Optimize edilmiş veri yükleme fonksiyonları
const fetchPatients = async () => {
    const response = await fetch('/api/patients', {
        next: { revalidate: 30 } // 30 saniyelik cache
    });
    if (!response.ok) {
        throw new Error('Failed to fetch patients');
    }
    return response.json();
};

const fetchPatientXrays = async (patientId: number) => {
    const response = await fetch(`/api/xrays?patientId=${patientId}`, {
        next: { revalidate: 30 }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch patient X-rays');
    }
    return response.json();
};

const fetchPatientAppointments = async (patientId: number) => {
    const response = await fetch(`/api/events?patientId=${patientId}`, {
        next: { revalidate: 30 }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch patient appointments');
    }
    return response.json();
};

const PatientList: React.FC = () => {
    const router = useRouter();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isLoadingXrays, setIsLoadingXrays] = useState<boolean>(false);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [xrays, setXrays] = useState<Xray[]>([]);
    const [selectedXray, setSelectedXray] = useState<Xray | null>(null);
    const [isXrayModalOpen, setIsXrayModalOpen] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await fetchPatients();
                setPatients(data);
                setFilteredPatients(data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };
        void loadInitialData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredPatients(
                patients.filter(patient =>
                    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    useEffect(() => {
        if (selectedPatient) {
            const loadPatientData = async () => {
                setIsLoadingXrays(true);
                setIsLoadingAppointments(true);
                try {
                    const [xrayData, appointmentData] = await Promise.all([
                        fetchPatientXrays(selectedPatient.id),
                        fetchPatientAppointments(selectedPatient.id)
                    ]);
                    setXrays(xrayData.filter((xray: Xray) => xray.patient.id === selectedPatient.id));
                    setAppointments(appointmentData.filter((appointment: Appointment) => 
                        appointment.patientId === selectedPatient.id
                    ));
                } catch (error) {
                    console.error('Error loading patient data:', error);
                    setXrays([]);
                    setAppointments([]);
                } finally {
                    setIsLoadingXrays(false);
                    setIsLoadingAppointments(false);
                }
            };
            void loadPatientData();
        }
    }, [selectedPatient]);

    const handlePatientClick = (patient: Patient): void => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleUpdatePatient = async (updatedPatient: Patient): Promise<void> => {
        try {
            const response = await fetch(`/api/patients/${updatedPatient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPatient),
            });

            if (!response.ok) {
                throw new Error('Failed to update patient');
            }

            const result = await response.json();
            console.log('Patient updated:', result);

            setPatients(prevPatients =>
                prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
            );
            setFilteredPatients(prevPatients =>
                prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
            );
            setSelectedPatient(updatedPatient);

        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!selectedPatient) return;

        try {
            const response = await fetch(`/api/patients/${selectedPatient.id}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete patient');
            }

            const result = await response.json();
            console.log('Patient deleted:', result);

            await fetchPatients();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error deleting patient:', error);
        }
    };

    const handleAddAppointment = async (appointment: { title: string; date: string }): Promise<void> => {
        if (!selectedPatient) return;

        try {
            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...appointment, patientId: selectedPatient.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to create appointment');
            }

            const result = await response.json();
            console.log('Appointment created:', result);

            setAppointments(prevAppointments => [...prevAppointments, result]);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleXrayClick = (xray: Xray): void => {
        setSelectedXray(xray);
        setIsXrayModalOpen(true);
    };

    return (
        <div className="p-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0 md:mr-6">Hasta Yönetimi</h1>
                <Button onClick={() => router.push('/protected/addpatient')}>Hasta Ekle</Button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Hasta ismi ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <Suspense fallback={
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            }>
                <ul className="space-y-4">
                    {filteredPatients.map(patient => (
                        <li key={patient.id}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handlePatientClick(patient)}>
                            <span className="font-semibold text-lg">{patient.firstName} {patient.lastName}</span>
                        </li>
                    ))}
                </ul>
            </Suspense>

            <Suspense fallback={null}>
                <PatientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    patient={selectedPatient}
                    appointments={appointments}
                    xrays={xrays}
                    onUpdate={handleUpdatePatient}
                    onAddAppointment={handleAddAppointment}
                    onXrayClick={handleXrayClick}
                    isLoadingAppointments={isLoadingAppointments}
                    isLoadingXrays={isLoadingXrays}
                    onDelete={handleDelete}
                />
            </Suspense>

            <Suspense fallback={null}>
                <FullScreenXrayModal
                    isOpen={isXrayModalOpen}
                    onClose={() => setIsXrayModalOpen(false)}
                    xRay={selectedXray}
                    formatDate={formatDate}
                />
            </Suspense>
        </div>
    );
};

export default PatientList;