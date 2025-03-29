'use client';

import React, { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button"
import { Xray } from "@/lib/types";
import { useXrays, usePatients, useUpdateOrCreateXray, useDeleteXray } from '@/hooks/use-query-hooks';

// Dinamik import
const XrayModal = dynamic(() => import("@/components/Modals/XrayModal"), {
    loading: () => null,
    ssr: false
});

// Loading Skeleton Component
const XrayListSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border bg-card p-4 rounded-lg shadow-sm animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-1/3" />
            </div>
        ))}
    </div>
);

export default function XrayManagement() {
    const { data: xrays = [], isLoading: isLoadingXrays, error: xraysError } = useXrays();
    const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
    const updateOrCreateXrayMutation = useUpdateOrCreateXray();
    const deleteXrayMutation = useDeleteXray();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedXray, setSelectedXray] = useState<Xray | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddXray = () => {
        setIsModalLoading(true);
        setSelectedXray(null);
        setIsModalOpen(true);
    };

    const handleEditXray = (xray: Xray) => {
        setIsModalLoading(true);
        setSelectedXray(xray);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedXray(null);
        setIsModalLoading(false);
    };

    const handleUpdate = async (id: number | null, data: Partial<Xray>) => {
        try {
            await updateOrCreateXrayMutation.mutateAsync({ id, data });
            handleCloseModal();
        } catch (error) {
            console.error(`Error ${id ? 'updating' : 'adding'} X-ray:`, error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            // Silinen röntgenin hasta ID'sini bulalım
            const xrayToDelete = xrays.find(x => x.id === id);
            const patientId = xrayToDelete?.patient?.id;
            
            await deleteXrayMutation.mutateAsync({ 
                id, 
                patientId 
            });
            handleCloseModal();
        } catch (error) {
            console.error('Error deleting X-ray:', error);
        }
    };

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
                className="border border-border bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleEditXray(xray)}
            >
                <h3 className="font-bold text-foreground">{xray.patient.firstName} {xray.patient.lastName}</h3>
                <p className="text-muted-foreground">Tarih: {new Date(xray.datePerformed).toLocaleDateString()}</p>
            </div>
        ));
    }, [filteredXrays]);

    const isLoading = isLoadingXrays || isLoadingPatients;
    const error = xraysError ? String(xraysError) : null;

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
        <div className="p-6 min-h-screen bg-background">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0 text-foreground">X-ray Yönetimi</h1>
                <Button onClick={handleAddXray}>Yeni X-ray Ekle</Button>
            </div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Hasta adına göre arama yapın"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-foreground placeholder:text-muted-foreground"
                />
            </div>
            {error && <p className="text-destructive mb-4">{error}</p>}
            <Suspense fallback={<XrayListSkeleton />}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredXrays.map(xray => (
                        <div
                            key={xray.id}
                            className="border border-border bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleEditXray(xray)}
                        >
                            <h3 className="font-bold text-foreground">{xray.patient.firstName} {xray.patient.lastName}</h3>
                            <p className="text-muted-foreground">Tarih: {new Date(xray.datePerformed).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </Suspense>
            
            {isModalLoading && isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-background/80 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md animate-pulse overflow-y-auto scrollbar-hide border border-border">
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