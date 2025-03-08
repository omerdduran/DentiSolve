'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button"
import { Patient, Xray } from "@/shared/types";

// Dinamik import
const XrayModal = dynamic(() => import("@/components/Modals/XrayModal"), {
    loading: () => null,
    ssr: false
});

// Optimize edilmiş veri yükleme fonksiyonları
const fetchXraysData = async () => {
    const response = await fetch('/api/xrays', {
        next: { revalidate: 30 } // 30 saniyelik cache
    });
    if (!response.ok) throw new Error('Failed to fetch X-rays');
    return response.json();
};

const fetchPatientsData = async () => {
    const response = await fetch('/api/patients', {
        next: { revalidate: 30 }
    });
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
};

// Loading Skeleton Component
const XrayListSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="border p-4 rounded shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
        ))}
    </div>
);

export default function XrayManagement() {
    const [xrays, setXrays] = useState<Xray[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedXray, setSelectedXray] = useState<Xray | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchXrays = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchXraysData();
            setXrays(data);
        } catch (error) {
            console.error('Error fetching X-rays:', error);
            setError('Failed to load X-rays. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPatients = useCallback(async () => {
        try {
            const data = await fetchPatientsData();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to load patients. Some features may be limited.');
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [xrayData, patientData] = await Promise.all([
                    fetchXraysData(),
                    fetchPatientsData()
                ]);
                setXrays(xrayData);
                setPatients(patientData);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        void loadInitialData();
    }, []);

    const handleAddXray = useCallback(() => {
        setIsModalLoading(true);
        setSelectedXray(null);
        setIsModalOpen(true);
    }, []);

    const handleEditXray = useCallback((xray: Xray) => {
        setIsModalLoading(true);
        setSelectedXray(xray);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedXray(null);
        setIsModalLoading(false);
    }, []);

    const handleUpdate = useCallback(async (id: number | null, data: Partial<Xray>) => {
        try {
            const url = id ? `/api/xrays/${id}` : '/api/xrays';
            const method = id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Failed to ${id ? 'update' : 'add'} X-ray`);
            await fetchXrays();
            handleCloseModal();
        } catch (error) {
            console.error(`Error ${id ? 'updating' : 'adding'} X-ray:`, error);
            setError(`Failed to ${id ? 'update' : 'add'} X-ray. Please try again.`);
        }
    }, [fetchXrays, handleCloseModal]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            const response = await fetch(`/api/xrays/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete X-ray');
            await fetchXrays();
            handleCloseModal();
        } catch (error) {
            console.error('Error deleting X-ray:', error);
            setError('Failed to delete X-ray. Please try again.');
        }
    }, [fetchXrays, handleCloseModal]);

    const filteredXrays = useMemo(() => {
        return xrays.filter(xray =>
            xray.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            xray.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            xray.datePerformed.includes(searchTerm)
        );
    }, [xrays, searchTerm]);

    const xrayList = useMemo(() => {
        return filteredXrays.map(xray => (
            <div
                key={xray.id}
                className="border p-4 rounded shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleEditXray(xray)}
            >
                <h3 className="font-bold">{xray.patient.firstName} {xray.patient.lastName}</h3>
                <p>Tarih: {new Date(xray.datePerformed).toLocaleDateString()}</p>
            </div>
        ));
    }, [filteredXrays, handleEditXray]);

    if (isLoading) {
        return (
            <div className="p-6 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4 md:mb-0 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-full mb-6 animate-pulse" />
                <XrayListSkeleton />
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">X-ray Yönetimi</h1>
                <Button onClick={handleAddXray}>Yeni X-ray Ekle</Button>
            </div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Hasta adına göre arama yapın"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Suspense fallback={<XrayListSkeleton />}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {xrayList}
                </div>
            </Suspense>
            
            {isModalLoading && isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-pulse overflow-y-auto scrollbar-hide">
                        <div className="h-8 bg-gray-200 rounded mb-4" />
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-200 rounded" />
                            <div className="h-24 bg-gray-200 rounded" />
                            <div className="h-24 bg-gray-200 rounded" />
                            <div className="h-40 bg-gray-200 rounded" />
                            <div className="flex justify-between mt-4">
                                <div className="h-10 bg-gray-200 rounded w-24" />
                                <div className="h-10 bg-gray-200 rounded w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isModalOpen && (
                <XrayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    xray={selectedXray}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    patients={patients}
                    onLoaded={() => setIsModalLoading(false)}
                />
            )}
        </div>
    );
}