"use client";

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventContentArg, CalendarOptions } from '@fullcalendar/core';
import EventModal from "@/components/Modals/EventModal";
import { Patient } from "@/shared/types";

interface ExtendedEventInput extends EventInput {
    extendedProps?: {
        patientId?: number;
    };
}

const DefaultCalendar: React.FC = () => {
    const [events, setEvents] = useState<ExtendedEventInput[]>([]);
    const [patients, setPatients] = useState<{ [key: number]: Patient }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ExtendedEventInput | null>(null);
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
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Randevular alınamadı');
            const data = await response.json();
            setEvents(data.map((event: any) => ({
                ...event,
                extendedProps: { patientId: event.patientId }
            })));
        } catch (error) {
            console.error('Olayları getirirken hata oluştu:', error);
            throw error;
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) throw new Error('Hastalar getirilemedi');
            const data: Patient[] = await response.json();
            const patientMap = data.reduce((acc, patient) => {
                acc[patient.id] = patient;
                return acc;
            }, {} as { [key: number]: Patient });
            setPatients(patientMap);
        } catch (error) {
            console.error('Hastaları getirirken hata oluştu:', error);
            throw error;
        }
    };

    const handleDateSelect = (selectInfo: any) => {
        setSelectedEvent({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };

    const handleEventUpdate = async (updatedEvent: ExtendedEventInput) => {
        if (updatedEvent.id) {
            if ('deleted' in updatedEvent && updatedEvent.deleted) {
                setEvents(events.filter(e => e.id !== updatedEvent.id));
            } else {
                setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
            }
        } else {
            setEvents([...events, updatedEvent]);
        }
        await fetchEvents();
    };

    const eventContent = (eventInfo: EventContentArg) => {
        const { event } = eventInfo;
        const patientId = event.extendedProps?.patientId as number;
        const patient = patients[patientId];
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmeyen Hasta';

        return (
            <div className="event-content">
                <div className="event-title">{event.title}</div>
                <div className="event-patient">{patientName}</div>
            </div>
        );
    };

    const calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        events: events,
        select: handleDateSelect,
        eventClick: handleEventClick,
        eventContent: eventContent,
        eventDisplay: "block",
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        },
        displayEventTime: true,
        displayEventEnd: true,
        nextDayThreshold: "00:00:00",
        eventOrder: "start,-duration,allDay,title",
        eventOrderStrict: false,
        progressiveEventRendering: true,
        buttonText: {
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
        },
        locale: 'tr',
        nowIndicator: true,
        firstDay: 1,
        slotMinTime: '08:00:00',
        slotMaxTime: '24:00:00',
        height: 'auto',
        aspectRatio: 1.8,
        themeSystem: 'standard',
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>Hata: {error}</div>;

    return (
        <div className="calendar-container">
            <style jsx global>{`
                .calendar-container {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .fc {
                    --fc-border-color: #e0e0e0;
                    --fc-button-bg-color: #f0f0f0;
                    --fc-button-border-color: #e0e0e0;
                    --fc-button-text-color: #333;
                    --fc-button-hover-bg-color: #e0e0e0;
                    --fc-button-hover-border-color: #d0d0d0;
                    --fc-button-active-bg-color: #d0d0d0;
                    --fc-button-active-border-color: #c0c0c0;
                }
                .fc .fc-button {
                    font-weight: 400;
                    text-transform: capitalize;
                    border-radius: 6px;
                }
                .fc .fc-button-primary:not(:disabled).fc-button-active,
                .fc .fc-button-primary:not(:disabled):active {
                    background-color: #007aff;
                    border-color: #007aff;
                    color: #fff;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border-color: #f0f0f0;
                }
                .fc .fc-day-other .fc-daygrid-day-top {
                    opacity: 0.5;
                }
                .fc .fc-daygrid-day-number {
                    font-size: 0.9em;
                    padding: 4px 6px;
                }
                .fc .fc-col-header-cell-cushion {
                    font-weight: 500;
                }
                .event-content {
                    font-size: 0.8em;
                    line-height: 1.2;
                    padding: 2px 4px;
                }
                .event-title {
                    font-weight: 500;
                }
                .event-patient {
                    font-style: italic;
                    opacity: 0.8;
                }
            `}</style>
            <FullCalendar {...calendarOptions} />
            {isModalOpen && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                    // @ts-ignore
                    event={selectedEvent}
                    onEventUpdate={handleEventUpdate}
                />
            )}
        </div>
    );
};

export default DefaultCalendar;