import React, {useState} from 'react';
import ModalWrapper from './ModalWrapper';
import {Patient, Appointment, Xray, PatientFormData} from '@/shared/types';
import {formatDate} from '@/shared/utils';
import PatientForm from "@/components/Forms/PatientForm";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {ChevronDown, ChevronUp} from 'lucide-react';

interface PatientModalProps {
    isOpen: boolean,
    onClose: () => void,
    patient: Patient | null,
    appointments?: Appointment[],
    xrays?: Xray[],
    onUpdate: (updatedPatient: Patient) => Promise<void>,
    onXrayClick: (xray: Xray) => void,
    isLoadingAppointments: boolean,
    isLoadingXrays: boolean,
    onDelete: () => void,
    onAddAppointment?: (appointment: { title: string; date: string }) => Promise<void>
}


const PatientModal: React.FC<PatientModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       patient,
                                                       appointments = [],
                                                       xrays = [],
                                                       onUpdate,
                                                       onXrayClick,
                                                       isLoadingAppointments,
                                                       isLoadingXrays,
                                                       onDelete,
                                                       onAddAppointment
                                                   }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    const [isXraysOpen, setIsXraysOpen] = useState(false);

    if (!isOpen || !patient) return null;

    const handleSave = async (formData: PatientFormData) => {
        if (patient) {
            await onUpdate({...patient, ...formData});
        }
        setIsEditing(false);
    };

    // @ts-ignore
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Hasta Bilgilerini Düzenle" : "Hasta Detayları"}</h2>
            <div className="space-y-4">
                {isEditing ? (
                    <PatientForm
                        initialData={{
                            firstName: patient.firstName,
                            lastName: patient.lastName,
                            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
                            homePhone: patient.homePhone || '',
                            currentTreatment: patient.currentTreatment || '',
                            medicalHistory: patient.medicalHistory || '',
                            anyMedicalProblems: patient.anyMedicalProblems || '',
                            womenSpecificInfo: patient.womenSpecificInfo || ''
                        }}
                        // @ts-ignore
                        onSubmit={handleSave}
                        submitButtonText="Kaydet"
                    />
                ) : (
                    <div className="space-y-2 text-sm">
                        <p><strong>İsim:</strong> {patient.firstName} {patient.lastName}</p>
                        <p><strong>Doğum Tarihi:</strong> {formatDate(patient.dateOfBirth)}</p>
                        <p><strong>Telefon:</strong> {patient.homePhone || 'N/A'}</p>
                        <p><strong>Tedavi/İlaçlar:</strong> {patient.currentTreatment || 'N/A'}</p>
                        <p><strong>Tıbbi Geçmiş:</strong> {patient.medicalHistory || 'N/A'}</p>
                        <p><strong>Diğer Sorunlar:</strong> {patient.anyMedicalProblems || 'N/A'}</p>
                        <p><strong>Kadın Sağlığı:</strong> {patient.womenSpecificInfo || 'N/A'}</p>
                    </div>
                )}

                {/* Randevular bölümü */}
                <Collapsible open={isAppointmentsOpen} onOpenChange={setIsAppointmentsOpen}
                             className="w-full border rounded-md">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
                        Randevular
                        {isAppointmentsOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2">
                        {isLoadingAppointments ? (
                            <p className="text-sm">Randevular yükleniyor...</p>
                        ) : appointments.length > 0 ? (
                            <ul className="text-sm space-y-1">
                                {appointments.map(appointment => (
                                    <li key={appointment.id}>
                                        {formatDate(appointment.start)}: {appointment.title}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm">Henüz randevu bulunmamaktadır.</p>
                        )}
                    </CollapsibleContent>
                </Collapsible>

                {/* Röntgenler bölümü */}
                <Collapsible open={isXraysOpen} onOpenChange={setIsXraysOpen} className="w-full border rounded-md">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
                        Röntgenler
                        {isXraysOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2">
                        {isLoadingXrays ? (
                            <p className="text-sm">Röntgenler yükleniyor...</p>
                        ) : xrays.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {xrays.map(xray => (
                                    <div
                                        key={xray.id}
                                        className="border p-2 rounded cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => onXrayClick(xray)}
                                    >
                                        <img src={xray.imageUrl} alt={xray.findings}
                                             className="w-full h-24 object-cover mb-1"/>
                                        <p className="text-xs">{formatDate(xray.datePerformed)}: {xray.impression}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm">Bu hasta için röntgen bulunmamaktadır.</p>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                {isEditing ? (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        İptal
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Düzenle
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Sil
                        </button>
                    </>
                )}
                <button
                    onClick={onClose}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Kapat
                </button>
            </div>
        </ModalWrapper>
    );
};

export default PatientModal;