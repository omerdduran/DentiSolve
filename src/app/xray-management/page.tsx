'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {Patient, Xray} from "@/shared/types";
import XrayModal from "@/components/Modals/XrayModal";

export default function XrayManagement() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [xrays, setXrays] = useState<Xray[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedXray, setSelectedXray] = useState<Xray | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchPatients();
        } else {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const fetchXrays = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/xrays');
            if (!response.ok) throw new Error('Failed to fetch X-rays');
            const data = await response.json();
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
            const response = await fetch('/api/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to load patients. Some features may be limited.');
        }
    }, []);

    useEffect(() => {
        fetchXrays();
        fetchPatients();
    }, [fetchXrays, fetchPatients]);

    const handleAddXray = useCallback(() => {
        setSelectedXray(null);
        setIsModalOpen(true);
    }, []);

    const handleEditXray = useCallback((xray: Xray) => {
        setSelectedXray(xray);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedXray(null);
    }, []);

    const handleUpdate = useCallback(async (id: number | null, data: Partial<Xray>) => {
        try {
            const url = id ? `/api/xrays/${id}` : '/api/xrays';
            const method = id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/xrays/${id}`, { method: 'DELETE' });
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
                className="border p-4 rounded shadow"
                onClick={() => handleEditXray(xray)}
            >
                <h3 className="font-bold">{xray.patient.firstName} {xray.patient.lastName}</h3>
                <p>Tarih: {new Date(xray.datePerformed).toLocaleDateString()}</p>
            </div>
        ));
    }, [filteredXrays, handleEditXray]);


    if (isLoading) {
        return <div className="text-center mt-8">X-ray yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="p-6 min-h-screen">
            <div className='flex flex-col md:flex-row md:items-center mb-6'>
                <h1 className="text-2xl font-bold mb-4 md:mb-0 md:mr-6">X-ray Yönetimi</h1>
                <Button onClick={handleAddXray}>Yeni X-ray Ekle</Button>
            </div>
            <div className="flex-grow md:mr-4">
                <input
                    type="text"
                    placeholder="Hasta adına göre arama yapın"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>
            {error  && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-4">
                {xrayList}
            </div>
            <XrayModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                xray={selectedXray}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                patients={patients}
            />
        </div>
    );
}