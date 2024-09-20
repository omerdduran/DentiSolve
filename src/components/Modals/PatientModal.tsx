import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import {Patient, Appointment, Xray, PatientFormData} from '@/shared/types';
import { formatDate } from '@/shared/utils';
import PatientForm from "@/components/Forms/PatientForm";

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    appointments?: Appointment[];
    xrays?: Xray[];
    onUpdate: (updatedPatient: Patient) => void;
    onAddAppointment: (appointment: { title: string; date: string }) => void;
    onXrayClick: (xray: Xray) => void;
    isLoadingAppointments: boolean;
    isLoadingXrays: boolean;
    onDelete: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       patient,
                                                       appointments = [],
                                                       xrays = [],
                                                       onUpdate,
                                                       onAddAppointment,
                                                       onXrayClick,
                                                       isLoadingAppointments,
                                                       isLoadingXrays,
                                                       onDelete
                                                   }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newAppointment, setNewAppointment] = useState({ title: '', date: '' });

    if (!isOpen || !patient) return null;

    const handleSave = (formData: PatientFormData) => {
        if (patient) {
            onUpdate({ ...formData, id: patient.id });
        }
        setIsEditing(false);
    };

    const handleAddAppointment = () => {
        onAddAppointment(newAppointment);
        setNewAppointment({ title: '', date: '' });
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-4">{isEditing ? "Hasta Bilgilerini Düzenle" : "Hasta Detayları"}</h2>
            <div className="space-y-6">
                {isEditing ? (
                    <PatientForm
                        initialData={patient}
                        onSubmit={handleSave}
                        submitButtonText="Kaydet"
                    />
                ) : (
                    <div className="space-y-2 text-sm md:text-base">
                        <p><strong>İsim:</strong> {patient.firstName} {patient.lastName}</p>
                        <p><strong>Doğum Tarihi:</strong> {formatDate(patient.dateOfBirth)}</p>
                        <p><strong>Telefon Numarası:</strong> {patient.homePhone || 'N/A'}</p>
                        <p><strong>Mevcut Tedavi veya İlaçlar:</strong> {patient.currentTreatment || 'N/A'}</p>
                        <p><strong>Tıbbi Geçmiş:</strong> {patient.medicalHistory || 'N/A'}</p>
                        <p><strong>Ameliyat Geçmişi:</strong> {patient.surgeryHistory || 'N/A'}</p>
                        <p><strong>Diğer Tıbbi Sorunlar:</strong> {patient.anyMedicalProblems || 'N/A'}</p>
                        <p><strong>Kadın Sağlığı:</strong> {patient.womenSpecificInfo || 'N/A'}</p>
                    </div>
                )}

                {/* Randevular bölümü */}
                <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">Randevular</h3>
                    {isLoadingAppointments ? (
                        <p>Randevular yükleniyor...</p>
                    ) : appointments.length > 0 ? (
                        <ul className="list-disc pl-5 mb-4 text-sm md:text-base">
                            {appointments.map(appointment => (
                                <li key={appointment.id}>
                                    {formatDate(appointment.date)}: {appointment.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mb-4">Henüz randevu bulunmamaktadır.</p>
                    )}
                    <div className="bg-gray-100 p-3 md:p-4 rounded-lg shadow-inner">
                        <h4 className="font-semibold text-sm mb-2">Yeni Randevu Ekle</h4>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                                type="text"
                                placeholder="Tedavi"
                                value={newAppointment.title}
                                onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                                className="flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="date"
                                value={newAppointment.date}
                                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                                className="w-full sm:w-32 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddAppointment}
                                className="w-full sm:w-auto px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Röntgenler bölümü */}
                <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">Röntgenler</h3>
                    {isLoadingXrays ? (
                        <p>Röntgenler yükleniyor...</p>
                    ) : xrays.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {xrays.map(xray => (
                                <div
                                    key={xray.id}
                                    className="border p-2 rounded cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => onXrayClick(xray)}
                                >
                                    <img src={xray.imageUrl} alt={xray.findings}
                                         className="w-full h-32 object-cover mb-2"/>
                                    <p className="text-sm">{formatDate(xray.datePerformed)}: {xray.impression}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Bu hasta için röntgen bulunmamaktadır.</p>
                    )}
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                {isEditing ? (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        İptal
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Düzenle
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Sil
                        </button>
                    </>
                )}
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Kapat
                </button>
            </div>
        </ModalWrapper>
    );
};

export default PatientModal;