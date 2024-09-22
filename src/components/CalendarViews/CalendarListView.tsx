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
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="mb-6">{content}</p>
                <button onClick={onClose} className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200">
                    Kapat
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
            content: `Tarih: ${event.start?.toLocaleDateString('tr-TR')}\nHasta: ${patientName}`
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
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            list: 'Liste'
        },
        locale: 'tr'
    };

    if (loading) return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-4">Hata: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Yaklaşan Randevular</h2>
            <div className="w-full calendar-container">
                <style jsx global>{`
                    .calendar-container {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                    .fc .fc-list-event:hover td {
                        background-color: #f0f0f0;
                    }
                    .fc .fc-list-event-dot {
                        border-color: #007aff;
                    }
                    .fc .fc-list-day-cushion {
                        background-color: #f8f8f8;
                    }
                    .fc .fc-list-event-time {
                        color: #666;
                    }
                    .fc .fc-list-event-title {
                        font-weight: 500;
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1.2em;
                        font-weight: 600;
                    }
                    .fc .fc-button {
                        background-color: #f0f0f0;
                        border-color: #e0e0e0;
                        color: #333;
                        font-weight: 400;
                        text-transform: capitalize;
                        border-radius: 6px;
                    }
                    .fc .fc-button:hover {
                        background-color: #e0e0e0;
                        border-color: #d0d0d0;
                    }
                    .fc .fc-button:active,
                    .fc .fc-button:focus {
                        box-shadow: 0 0 0 0.2rem rgba(0,122,255,.25);
                    }
                `}</style>
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