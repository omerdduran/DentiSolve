import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, EventInput, CalendarOptions } from '@fullcalendar/core';
import {Patient} from "@/shared/types";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{content}</p>
                <button onClick={onClose} className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                    Close
                </button>
            </div>
        </div>
    );
};

const SimpleCalendarListView: React.FC = () => {
    const [events, setEvents] = useState<EventInput[]>([]);
    const [patients, setPatients] = useState<{ [key: number]: Patient }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([fetchEvents(), fetchPatients()]);
            } catch (err) {
                setError('Veri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchEvents = async () => {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Randevular alınamadı');
        const data = await response.json();
        setEvents(data.map((event: any) => ({
            ...event,
            extendedProps: { patientId: event.patientId }
        })));
    };

    const fetchPatients = async () => {
        const response = await fetch('/api/patients');
        if (!response.ok) throw new Error('Hastalar getirilemedi');
        const data: Patient[] = await response.json();
        const patientMap = data.reduce((acc, patient) => {
            acc[patient.id] = patient;
            return acc;
        }, {} as { [key: number]: Patient });
        setPatients(patientMap);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const event = clickInfo.event;
        const patientId = event.extendedProps.patientId as number;
        const patient = patients[patientId];
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmeyen Hasta';
        setModalContent({
            title: event.title,
            content: `Date: ${event.start?.toLocaleDateString()}\nPatient: ${patientName}`
        });
        setModalOpen(true);
    };

    const calendarOptions: CalendarOptions = {
        plugins: [listPlugin],
        initialView: "listWeek",
        events: events.map(event => ({
            ...event,
            title: `${event.title} - ${patients[event.extendedProps?.patientId as number]?.firstName || 'Bilinmeyen'} ${patients[event.extendedProps?.patientId as number]?.lastName || 'Hasta'}`,
        })),
        headerToolbar: {
            start: 'prev',
            center: 'title',
            end: 'next'
        },
        height: 'auto',
        eventClick: handleEventClick,
        noEventsContent: 'Görüntülenecek etkinlik yok',
        buttonText: {
            today: 'bugün',
            month: 'ay',
            week: 'hafta',
            day: 'gün',
            list: 'liste'
        },
        locale: 'tr'
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>Hata: {error}</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Yaklaşan Randevular</h2>
            <div className="w-full">
                <FullCalendar {...calendarOptions} />
            </div>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalContent.title}
                content={modalContent.content}
            />
        </div>
    );
};

export default SimpleCalendarListView;