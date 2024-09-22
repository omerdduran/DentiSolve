"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'react-phone-input-2/lib/plain.css'
import { useAuth } from '../../../context/AuthContext';
import PatientForm, { PatientFormData } from '@/components/Forms/PatientForm';


const AddPatient: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);


    const handleSubmit = async (formData: PatientFormData) => {
        try {
            // API'ye veri gönderme işlemi
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

            alert('Hasta başarıyla eklendi')
            console.log('Hasta başarıyla eklendi');
            // router.push('/patients');
        } catch (error) {
            console.error('Hata:', error);
        }
    };


    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Yeni Hasta Ekle</h1>
            <PatientForm onSubmit={handleSubmit} />
        </div>
    );
};

export default AddPatient;