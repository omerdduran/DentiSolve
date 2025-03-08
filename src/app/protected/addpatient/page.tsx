"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from "@/components/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { PatientFormData } from '@/components/Forms/PatientForm';
import { useCreatePatient } from '@/hooks/use-query-hooks';

// Dinamik import
const PatientForm = dynamic(() => import('@/components/Forms/PatientForm'), {
    loading: () => (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-32 bg-gray-200 rounded w-full" />
            <div className="h-32 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
    ),
    ssr: false // Form genellikle client-side rendering gerektirir
});

// Loading Skeleton Component
const FormSkeleton = () => (
    <div className="max-w-4xl mx-auto p-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-32 bg-gray-200 rounded w-full" />
            <div className="h-32 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
    </div>
);

const AddPatient: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    const createPatientMutation = useCreatePatient();

    const handleSubmit = async (formData: PatientFormData) => {
        try {
            // dateOfBirth'i string'e dönüştür
            const patientData = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''
            };
            
            await createPatientMutation.mutateAsync(patientData);
            
            toast({
                title: "Başarılı!",
                description: "Hasta başarıyla eklendi.",
                className: "bg-green-500",
            });

            router.push('/protected/patient-management');
        } catch (error) {
            console.error('Hata:', error);
            toast({
                title: "Hata!",
                description: "Hasta eklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <Suspense fallback={<FormSkeleton />}>
                <div className="max-w-4xl mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Yeni Hasta Ekle</h1>
                    <PatientForm
                        onSubmit={handleSubmit}
                        submitButtonText={createPatientMutation.isPending ? "Ekleniyor..." : "Hasta Ekle"}
                        isLoading={createPatientMutation.isPending}
                    />
                </div>
            </Suspense>
            <Toaster />
        </>
    );
};

export default AddPatient;