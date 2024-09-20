import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';

const PRESET_COLORS = [
    { name: 'Kırmızı', value: '#FF0000' },
    { name: 'Mavi', value: '#0000FF' },
    { name: 'Yeşil', value: '#00FF00' },
    { name: 'Sarı', value: '#FFFF00' },
    { name: 'Mor', value: '#800080' },
];

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
}

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalData: {
        id: number;
        title: string;
        start: string;
        end: string;
        patientName: string;
        patientId: number;
        color: string;
    } | null;
    onEventUpdate: (updatedEvent: any) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, modalData, onEventUpdate }) => {
    const [formData, setFormData] = useState({
        id: 0,
        title: '',
        start: '',
        end: '',
        patientId: 0,
        patientName: '',
        color: '',
    });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    useEffect(() => {
        if (modalData) {
            setFormData({
                id: modalData.id,
                title: modalData.title,
                start: formatDateForDisplay(modalData.start),
                end: formatDateForDisplay(modalData.end),
                patientId: modalData.patientId,
                patientName: modalData.patientName,
                color: modalData.color,
            });
        }
    }, [modalData]);

    const fetchPatients = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            const data = await response.json();
            console.log('Fetched patients:', data);
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to load patients. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'patientId') {
            const selectedPatient = patients.find(p => p.id === Number(value));
            setFormData(prev => ({
                ...prev,
                patientId: Number(value),
                patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.id) {
            setError('Invalid event ID. Cannot update event.');
            return;
        }

        const updatedEvent = {
            ...formData,
            start: formatDateForAPI(formData.start),
            end: formatDateForAPI(formData.end),
        };

        try {
            const response = await fetch(`/api/events/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEvent),
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            const updatedData = await response.json();
            onEventUpdate(updatedData);
            onClose();
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Failed to update event. Please try again.');
        }
    };

    const formatDateForDisplay = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toLocaleString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const formatDateForAPI = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toISOString();
        } catch (error) {
            console.error('Error formatting date for API:', error);
            return dateString;
        }
    };

    if (!modalData) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">Event Details</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="start">Start</label>
                    <input
                        type="text"
                        id="start"
                        name="start"
                        value={formData.start}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.type = 'datetime-local'}
                        onBlur={(e) => {
                            e.target.type = 'text';
                            setFormData(prev => ({ ...prev, start: formatDateForDisplay(e.target.value) }));
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="end">End</label>
                    <input
                        type="text"
                        id="end"
                        name="end"
                        value={formData.end}
                        onChange={handleInputChange}
                        onFocus={(e) => e.target.type = 'datetime-local'}
                        onBlur={(e) => {
                            e.target.type = 'text';
                            setFormData(prev => ({ ...prev, end: formatDateForDisplay(e.target.value) }));
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="patientName">Patient</label>
                    {isLoading ? (
                        <p>Loading patients...</p>
                    ) : (
                        <>
                            <input
                                type="text"
                                id="patientName"
                                name="patientName"
                                value={formData.patientName}
                                readOnly
                                className="w-full px-3 py-2 border rounded-md mb-2"
                            />
                            <select
                                id="patientId"
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Change patient</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {`${patient.firstName} ${patient.lastName}`}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="color">Color</label>
                    <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    >
                        {PRESET_COLORS.map((color) => (
                            <option key={color.value} value={color.value}>
                                {color.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-6 flex justify-between">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={isLoading}
                    >
                        Update Event
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default EventModal;