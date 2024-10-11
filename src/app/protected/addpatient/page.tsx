"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientForm, { PatientFormData } from '@/components/Forms/PatientForm';
import { useToast } from "@/components/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

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

            router.push('/patient-management');
        } catch (error) {
            console.error('Hata:', error);
            toast({
                title: "Hata!",
                description: "Hasta eklenirken bir sorun oluştu.",
                variant: "destructive",  // Kırmızı toast için
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Yeni Hasta Ekle</h1>
                <PatientForm
                    onSubmit={handleSubmit}
                    submitButtonText={isLoading ? "Ekleniyor..." : "Hasta Ekle"}
                    isLoading={isLoading}
                />
            </div>
            <Toaster />
        </>
    );
};

export default AddPatient;