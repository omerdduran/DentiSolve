import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/plain.css';
import {treatmentOptions} from "@/shared/utils";

interface PatientFormProps {
    initialData?: Partial<PatientFormData>;
    onSubmit: (formData: PatientFormData) => void;
    submitButtonText?: string;
}

export interface PatientFormData {
    id?: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    homePhone: string;
    currentTreatment: string;
    medicalHistory: string;
    surgeryHistory: string;
    anyMedicalProblems: string;
    womenSpecificInfo: string;
}

export interface Patient extends PatientFormData {
    id: number;
}


const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, submitButtonText = 'Hasta Ekle' }) => {
    const [formData, setFormData] = useState<PatientFormData>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        homePhone: '',
        currentTreatment: '',
        medicalHistory: '',
        surgeryHistory: '',
        anyMedicalProblems: '',
        womenSpecificInfo: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prevData => ({ ...prevData, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prevData => ({ ...prevData, homePhone: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Soyad</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon numarası</label>
                    <PhoneInput
                        country={'tr'}
                        value={formData.homePhone}
                        onChange={handlePhoneChange}
                        inputProps={{
                            name: 'homePhone',
                            required: true,
                            autoFocus: true,
                        }}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Mevcut Tedavi veya İlaçlar</label>
                    <select
                        name="currentTreatment"
                        value={formData.currentTreatment}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Seçiniz</option>
                        {treatmentOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tıbbi Geçmiş</label>
                    <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Ameliyat Geçmişi</label>
                    <textarea
                        name="surgeryHistory"
                        value={formData.surgeryHistory}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Diğer Tıbbi Sorunlar</label>
                    <textarea
                        name="anyMedicalProblems"
                        value={formData.anyMedicalProblems}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Kadın Sağlığı (Gebelik, Düşük, Menstruasyon, Menopoz)</label>
                    <textarea
                        name="womenSpecificInfo"
                        value={formData.womenSpecificInfo}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600"
                >
                    {submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default PatientForm;