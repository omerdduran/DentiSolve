import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, EventInput, CalendarOptions } from '@fullcalendar/core';
import { Patient } from "@/lib/types";
import { useEvents, usePatients } from '@/hooks/use-query-hooks';
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
                <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
                <p className="mb-6 text-card-foreground">{content}</p>
                <Button 
                    onClick={onClose} 
                    className="w-full"
                >
                    Kapat
                </Button>
            </div>
        </div>
    );
};

const SimpleCalendarListView: React.FC = () => {
    const { data: eventsData = [], isLoading: eventsLoading, error: eventsError } = useEvents();
    const { data: patientsData = [], isLoading: patientsLoading } = usePatients();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });

    // Convert patients array to a map for easier lookup
    const patients = React.useMemo(() => {
        return patientsData.reduce((acc, patient) => {
            acc[patient.id] = patient;
            return acc;
        }, {} as { [key: number]: Patient });
    }, [patientsData]);

    // Format events for the calendar
    const events = React.useMemo(() => {
        return eventsData.map((event: any) => ({
            ...event,
            extendedProps: { patientId: event.patientId }
        }));
    }, [eventsData]);

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
        locale: 'tr'
    };

    const loading = eventsLoading || patientsLoading;
    const error = eventsError ? String(eventsError) : null;

    if (loading) return <div className="flex justify-center items-center h-64 text-muted-foreground">Yükleniyor...</div>;
    if (error) return <div className="text-destructive text-center p-4">Hata: {error}</div>;

    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Yaklaşan Randevular</h2>
            <div className="w-full calendar-container">
                <style jsx global>{`
                    .calendar-container {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                    .fc {
                        --fc-border-color: hsl(var(--border));
                        --fc-button-text-color: hsl(var(--foreground));
                        --fc-button-bg-color: hsl(var(--card));
                        --fc-button-border-color: hsl(var(--border));
                        --fc-button-hover-bg-color: hsl(var(--accent));
                        --fc-button-hover-border-color: hsl(var(--border));
                        --fc-button-active-bg-color: hsl(var(--accent));
                        --fc-button-active-border-color: hsl(var(--border));
                        --fc-event-bg-color: hsl(var(--primary));
                        --fc-event-border-color: hsl(var(--primary));
                        --fc-event-text-color: hsl(var(--primary-foreground));
                        --fc-list-event-hover-bg-color: hsl(var(--accent));
                        --fc-today-bg-color: hsl(var(--accent));
                    }
                    .fc .fc-list-event:hover td {
                        background-color: hsl(var(--accent));
                    }
                    .fc .fc-list-event-dot {
                        border-color: hsl(var(--primary));
                    }
                    .fc .fc-list-day-cushion {
                        background-color: hsl(var(--muted));
                    }
                    .fc .fc-list-event-time {
                        color: hsl(var(--muted-foreground));
                    }
                    .fc .fc-list-event-title {
                        font-weight: 500;
                        color: hsl(var(--foreground));
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1.2em;
                        font-weight: 600;
                        color: hsl(var(--foreground));
                    }
                    .fc .fc-button {
                        background-color: hsl(var(--card));
                        border-color: hsl(var(--border));
                        color: hsl(var(--foreground));
                        font-weight: 400;
                        text-transform: capitalize;
                        border-radius: 6px;
                    }
                    .fc .fc-button:hover {
                        background-color: hsl(var(--accent));
                        border-color: hsl(var(--border));
                    }
                    .fc .fc-button:active,
                    .fc .fc-button:focus {
                        box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
                    }
                    .fc .fc-list-empty {
                        background-color: hsl(var(--card));
                        color: hsl(var(--muted-foreground));
                    }
                    .fc .fc-list-table td {
                        border-color: hsl(var(--border));
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