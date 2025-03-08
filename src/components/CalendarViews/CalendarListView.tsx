import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, EventInput, CalendarOptions } from '@fullcalendar/core';
import {Patient} from "@/shared/types";
import ModalWrapper from '@/components/Modals/ModalWrapper';
import { Button } from '@/components/ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div 
                    className="text-gray-700" 
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                <div className="flex justify-end pt-4">
                    <Button 
                        onClick={onClose} 
                        variant="default"
                        size="default"
                    >
                        Kapat
                    </Button>
                </div>
            </div>
        </ModalWrapper>
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
        
        // Tarih ve saat bilgilerini formatla
        const startDate = event.start ? new Date(event.start) : new Date();
        const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 30 * 60000); // Varsayılan 30 dk
        
        const dateOptions: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions: Intl.DateTimeFormatOptions = { 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        
        const formattedDate = startDate.toLocaleDateString('tr-TR', dateOptions);
        const startTime = startDate.toLocaleTimeString('tr-TR', timeOptions);
        const endTime = endDate.toLocaleTimeString('tr-TR', timeOptions);
        
        const contentDetails = [
            { icon: '📅', label: 'Tarih', value: formattedDate },
            { icon: '⏰', label: 'Saat', value: `${startTime} - ${endTime}` },
            { icon: '👤', label: 'Hasta', value: patientName },
        ];
        
        if (patient?.homePhone) {
            contentDetails.push({ icon: '📞', label: 'Telefon', value: patient.homePhone });
        }
        
        const formattedContent = contentDetails
            .map(detail => `<div class="flex items-start mb-2">
                <span class="mr-2">${detail.icon}</span>
                <div>
                    <span class="font-medium">${detail.label}:</span> 
                    <span>${detail.value}</span>
                </div>
            </div>`)
            .join('');
        
        setModalContent({
            title: event.title,
            content: formattedContent
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
        height: 500,
        firstDay: 1,
        eventClick: handleEventClick,
        noEventsContent: 'Görüntülenecek etkinlik yok',
        buttonText: {
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            list: 'Liste'
        },
        locale: 'tr',
        duration: { weeks: 2 }
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
                        cursor: pointer;
                    }
                    .fc .fc-list-event-dot {
                        border-color: #007aff;
                        border-width: 6px;
                    }
                    .fc .fc-list-day-cushion {
                        background-color: #f8f8f8;
                        padding: 12px 16px;
                    }
                    .fc .fc-list-event-time {
                        color: #666;
                        font-weight: 500;
                        font-size: 0.95rem;
                    }
                    .fc .fc-list-event-title {
                        font-weight: 500;
                        font-size: 0.95rem;
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1.4em;
                        font-weight: 600;
                        color: #333;
                    }
                    .fc .fc-button {
                        background-color: #f0f0f0;
                        border-color: #e0e0e0;
                        color: #333;
                        font-weight: 500;
                        text-transform: capitalize;
                        border-radius: 8px;
                        padding: 8px 16px;
                    }
                    .fc .fc-button:hover {
                        background-color: #e0e0e0;
                        border-color: #d0d0d0;
                    }
                    .fc .fc-button:active,
                    .fc .fc-button:focus {
                        box-shadow: 0 0 0 0.2rem rgba(0,122,255,.25);
                    }
                    .fc-theme-standard .fc-list {
                        border: 1px solid #eaeaea;
                        border-radius: 8px;
                    }
                    .fc-theme-standard .fc-list-day-side-text {
                        font-weight: 600;
                    }
                    .fc-theme-standard td, 
                    .fc-theme-standard th {
                        border-color: #eaeaea;
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