"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from "@/components/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { PatientFormData } from '@/components/Forms/PatientForm';

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
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: PatientFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Hasta eklenirken bir hata oluştu');
            }

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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Suspense fallback={<FormSkeleton />}>
                <div className="max-w-4xl mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Yeni Hasta Ekle</h1>
                    <PatientForm
                        onSubmit={handleSubmit}
                        submitButtonText={isLoading ? "Ekleniyor..." : "Hasta Ekle"}
                        isLoading={isLoading}
                    />
                </div>
            </Suspense>
            <Toaster />
        </>
    );
};

export default AddPatient;