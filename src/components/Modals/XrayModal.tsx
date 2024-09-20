import React, {useState, useEffect, useCallback, useMemo} from 'react';
import ModalWrapper from './ModalWrapper';
import { Patient, Xray } from "@/shared/types";

interface XrayModalProps {
    isOpen: boolean;
    onClose: () => void;
    xray: Xray | null;
    onDelete: (id: number) => void;
    onUpdate: (id: number | null, data: Partial<Xray>) => void;
    patients: Patient[];
}

const XrayModal: React.FC<XrayModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 xray,
                                                 onDelete,
                                                 onUpdate,
                                                 patients
                                             }) => {
    const [editedXray, setEditedXray] = useState<Partial<Xray>>({
        datePerformed: '',
        findings: '',
        impression: '',
        imageUrl: '',
        patient: { id: 0, firstName: '', lastName: '' }
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (xray) {
                setEditedXray(xray);
            } else {
                setEditedXray({
                    datePerformed: new Date().toISOString().split('T')[0],
                    findings: '',
                    impression: '',
                    imageUrl: '',
                    patient: patients[0] || { id: 0, firstName: '', lastName: '' }
                });
            }
        }
    }, [isOpen, xray, patients]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedXray(prev => {
            if (name === 'patientId') {
                const selectedPatient = patients.find(p => p.id === parseInt(value));
                return { ...prev, patient: selectedPatient || prev.patient };
            }
            return { ...prev, [name]: value };
        });
    }, [patients]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }, []);

    const uploadFile = useCallback(async () => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            console.log('Uploaded file URL:', data.url); // Bu satır dosyanın doğru yüklenip yüklenmediğini kontrol eder.
            return data.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    }, [file]);


    const handleUpdate = useCallback(async () => {
        let imageUrl = editedXray.imageUrl;
        if (file) {
            const uploadedUrl = await uploadFile();
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            }
        }

        console.log('Final X-ray data:', { ...editedXray, imageUrl });

        onUpdate(xray?.id || null, { ...editedXray, imageUrl });
        onClose();
    }, [editedXray, file, onUpdate, onClose, xray, uploadFile]);


    const handleDelete = useCallback(() => {
        if (xray && xray.id) {
            onDelete(xray.id);
            onClose();
        }
    }, [xray, onDelete, onClose]);

    const patientOptions = useMemo(() => {
        return patients.map(patient => (
            <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
            </option>
        ));
    }, [patients]);

    if (!isOpen) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-4">{xray ? 'X-ray\'i Düzenle' : 'Yeni X-ray Ekle'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Hasta:</label>
                    <select
                        id="patientId"
                        name="patientId"
                        value={editedXray.patient?.id || ''}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Hasta Seç</option>
                        {patientOptions}
                    </select>

                </div>
                <div>
                    <label htmlFor="datePerformed" className="block text-sm font-medium text-gray-700">Tarih:</label>
                    <input
                        type="date"
                        id="datePerformed"
                        name="datePerformed"
                        value={editedXray.datePerformed?.split('T')[0] || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="findings" className="block text-sm font-medium text-gray-700">Bulgular:</label>
                    <textarea
                        id="findings"
                        name="findings"
                        value={editedXray.findings || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows={3}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="impression" className="block text-sm font-medium text-gray-700">İzlenim:</label>
                    <textarea
                        id="impression"
                        name="impression"
                        value={editedXray.impression || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows={3}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">X-ray Görüntüsü Yükleme:</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full"
                        accept="image/*"
                    />
                </div>
                {(editedXray.imageUrl || file) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">X-ray:</label>
                        <img
                            src={file ? URL.createObjectURL(file) : editedXray.imageUrl}
                            alt="X-ray"
                            className="mt-1 max-w-full h-auto"
                        />
                    </div>
                )}
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        {xray ? 'Güncelle' : 'Ekle'}
                    </button>
                    {xray && (
                        <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                            Sil
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        İptal
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default XrayModal;