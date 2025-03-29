"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { PatientFormData } from '@/components/Forms/PatientForm';
import { useCreatePatient } from '@/hooks/use-query-hooks';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Dinamik import
const PatientForm = dynamic(() => import('@/components/Forms/PatientForm'), {
    loading: () => (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-lg w-full" />
            <div className="h-32 bg-muted rounded-lg w-full" />
            <div className="h-32 bg-muted rounded-lg w-full" />
            <div className="h-10 bg-muted rounded-lg w-1/2" />
        </div>
    ),
    ssr: false
});

// Loading Skeleton Component
const FormSkeleton = () => (
    <div className="max-w-4xl mx-auto p-4">
        <div className="h-8 bg-muted rounded-lg w-48 mb-4 animate-pulse" />
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-lg w-full" />
            <div className="h-32 bg-muted rounded-lg w-full" />
            <div className="h-32 bg-muted rounded-lg w-full" />
            <div className="h-10 bg-muted rounded-lg w-1/2" />
        </div>
    </div>
);

const AddPatient: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    const createPatientMutation = useCreatePatient();

    const handleSubmit = async (formData: PatientFormData) => {
        try {
            const patientData = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''
            };
            
            await createPatientMutation.mutateAsync(patientData);
            
            toast({
                title: "Başarılı!",
                description: "Hasta başarıyla eklendi.",
                variant: "default",
                className: "bg-emerald-500 text-white",
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
        <div className="min-h-screen bg-background">
            <Suspense fallback={<FormSkeleton />}>
                <div className="max-w-4xl mx-auto p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push('/protected/patient-management')}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">Yeni Hasta Ekle</h1>
                    </div>
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <PatientForm
                            onSubmit={handleSubmit}
                            submitButtonText={createPatientMutation.isPending ? "Ekleniyor..." : "Hasta Ekle"}
                            isLoading={createPatientMutation.isPending}
                        />
                    </div>
                </div>
            </Suspense>
            <Toaster />
        </div>
    );
};

export default AddPatient;