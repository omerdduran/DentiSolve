import React, {useState, useEffect} from 'react';
import Image from 'next/image';
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
import {Button} from "@/components/ui/button";

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
    onAddAppointment?: (appointment: { title: string; date: string }) => Promise<void>,
    onLoaded?: () => void
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
                                                       onAddAppointment,
                                                       onLoaded
                                                   }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    const [isXraysOpen, setIsXraysOpen] = useState(false);
    const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

    useEffect(() => {
        if (isOpen && onLoaded) {
            onLoaded();
        }
    }, [isOpen, onLoaded]);

    if (!isOpen || !patient) return null;

    const handleSave = async (formData: PatientFormData) => {
        if (patient) {
            await onUpdate({...patient, ...formData});
        }
        setIsEditing(false);
    };

    const handleImageError = (id: number) => {
        setImageErrors(prev => ({...prev, [id]: true}));
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4 text-foreground">{isEditing ? "Hasta Bilgilerini Düzenle" : "Hasta Detayları"}</h2>
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
                    <>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ad</p>
                                    <p className="text-foreground">{patient.firstName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Soyad</p>
                                    <p className="text-foreground">{patient.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                                    <p className="text-foreground">{patient.homePhone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                                    <p className="text-foreground">{patient.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <Collapsible open={isAppointmentsOpen} onOpenChange={setIsAppointmentsOpen}
                                       className="w-full border border-border rounded-md bg-card">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-foreground">
                                    Randevular
                                    {isAppointmentsOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-2 text-card-foreground">
                                    {isLoadingAppointments ? (
                                        <p className="text-sm text-muted-foreground">Randevular yükleniyor...</p>
                                    ) : appointments.length > 0 ? (
                                        <ul className="text-sm space-y-1">
                                            {appointments.map(appointment => (
                                                <li key={appointment.id} className="text-foreground">
                                                    {formatDate(appointment.start)}: {appointment.title}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Henüz randevu bulunmamaktadır.</p>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>

                            <Collapsible open={isXraysOpen} onOpenChange={setIsXraysOpen} className="w-full border border-border rounded-md bg-card">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-foreground">
                                    Röntgenler
                                    {isXraysOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-2 text-card-foreground">
                                    {isLoadingXrays ? (
                                        <p className="text-sm text-muted-foreground">Röntgenler yükleniyor...</p>
                                    ) : xrays.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {xrays.map(xray => (
                                                <div
                                                    key={xray.id}
                                                    className="border border-border bg-card p-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
                                                    onClick={() => onXrayClick(xray)}
                                                >
                                                    <div className="relative aspect-square mb-2">
                                                        {!imageErrors[xray.id] ? (
                                                            <Image
                                                                src={xray.imageUrl}
                                                                alt="X-ray"
                                                                fill
                                                                className="object-cover rounded"
                                                                onError={() => handleImageError(xray.id)}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                                                                <span className="text-muted-foreground">Görüntü yüklenemedi</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">{formatDate(xray.datePerformed)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Henüz röntgen bulunmamaktadır.</p>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </>
                )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                {isEditing ? (
                    <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                    >
                        İptal
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                        >
                            Düzenle
                        </Button>
                        <Button
                            onClick={onDelete}
                            variant="destructive"
                        >
                            Sil
                        </Button>
                    </>
                )}
                <Button
                    onClick={onClose}
                    variant="secondary"
                >
                    Kapat
                </Button>
            </div>
        </ModalWrapper>
    );
};

export default PatientModal;