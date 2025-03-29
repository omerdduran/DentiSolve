"use client";

import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventContentArg, CalendarOptions } from '@fullcalendar/core';
import EventModal from "@/components/Modals/EventModal";
import { Patient } from "@/lib/types";
import { PRESET_COLORS } from "@/lib/utils";
import { useEvents, usePatients, QUERY_KEYS } from '@/hooks/use-query-hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';

interface ExtendedEventInput extends Omit<EventInput, 'id'> {
    id?: number;
    extendedProps?: {
        patientId?: number;
    };
}

const DefaultCalendar: React.FC = () => {
    const { data: eventsData = [], isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
    const { data: patientsData = [], isLoading: patientsLoading } = usePatients();
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ExtendedEventInput | null>(null);

    // Convert patients array to a map for easier lookup
    const patients = useMemo(() => {
        return patientsData.reduce((acc, patient) => {
            acc[patient.id] = patient;
            return acc;
        }, {} as { [key: number]: Patient });
    }, [patientsData]);

    // Format events for the calendar
    const events = useMemo(() => {
        return eventsData.map((event: any) => ({
            ...event,
            id: typeof event.id === 'string' ? parseInt(event.id, 10) : event.id,
            extendedProps: { patientId: event.patientId }
        }));
    }, [eventsData]);

    const handleDateSelect = (selectInfo: any) => {
        setSelectedEvent({
            title: '',
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            color: PRESET_COLORS[0].value,
            extendedProps: {
                patientId: 0
            }
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        setSelectedEvent({
            id: event.publicId ? parseInt(event.publicId, 10) : event._def.publicId ? parseInt(event._def.publicId, 10) : undefined,
            title: event.title || event._def.title,
            start: event.start || event._instance.range.start,
            end: event.end || event._instance.range.end,
            color: event.backgroundColor || event._def.ui.backgroundColor,
            extendedProps: {
                patientId: event.extendedProps?.patientId
            }
        });
        setIsModalOpen(true);
    };

    const handleEventUpdate = async () => {
        // Tüm ilgili verileri yenile
        await refetchEvents();
        // Hasta verilerini de yenile
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
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

    const loading = eventsLoading || patientsLoading;
    const error = eventsError ? String(eventsError) : null;

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>Hata: {error}</div>;

    return (
        <div className="calendar-container bg-card rounded-lg shadow-sm p-4">
            <style jsx global>{`
                .calendar-container {
                    font-family: var(--font-sans);
                }
                .fc {
                    --fc-border-color: hsl(var(--border));
                    --fc-button-bg-color: hsl(var(--muted));
                    --fc-button-border-color: hsl(var(--border));
                    --fc-button-text-color: hsl(var(--muted-foreground));
                    --fc-button-hover-bg-color: hsl(var(--accent));
                    --fc-button-hover-border-color: hsl(var(--accent));
                    --fc-button-active-bg-color: hsl(var(--accent));
                    --fc-button-active-border-color: hsl(var(--accent));
                    --fc-page-bg-color: hsl(var(--card));
                    --fc-neutral-bg-color: hsl(var(--muted));
                    --fc-list-event-hover-bg-color: hsl(var(--accent));
                    --fc-today-bg-color: ${isDark ? 'hsl(var(--muted))' : 'hsl(var(--accent)/0.1)'};
                    color: hsl(var(--card-foreground));
                }
                .fc .fc-button {
                    font-weight: 500;
                    text-transform: capitalize;
                    border-radius: var(--radius);
                    padding: 0.5rem 1rem;
                }
                .fc .fc-button-primary:not(:disabled).fc-button-active,
                .fc .fc-button-primary:not(:disabled):active {
                    background-color: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
                .fc-theme-standard td, 
                .fc-theme-standard th {
                    border-color: hsl(var(--border));
                }
                .fc .fc-day-other .fc-daygrid-day-top {
                    opacity: 0.5;
                }
                .fc .fc-daygrid-day-number {
                    font-size: 0.875rem;
                    padding: 0.5rem;
                    color: hsl(var(--foreground));
                }
                .fc .fc-col-header-cell-cushion {
                    font-weight: 500;
                    color: hsl(var(--foreground));
                    padding: 0.5rem;
                }
                .event-content {
                    font-size: 0.875rem;
                    line-height: 1.25;
                    padding: 0.25rem 0.5rem;
                }
                .event-title {
                    font-weight: 500;
                    color: hsl(var(--card));
                }
                .event-patient {
                    font-style: italic;
                    opacity: 0.9;
                    color: hsl(var(--card));
                }
                .fc-day-today {
                    background: ${isDark ? 'hsl(var(--muted))' : 'hsl(var(--accent)/0.1)'} !important;
                }
                .fc-highlight {
                    background: hsl(var(--accent)/0.2) !important;
                }
                .fc-event {
                    border-radius: var(--radius);
                    border: none;
                }
                .fc-event-main {
                    padding: 0.25rem;
                }
                .fc-toolbar-title {
                    color: hsl(var(--foreground));
                }
                @media (max-width: 768px) {
                    .fc .fc-toolbar {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>

            <div className="rounded-lg overflow-hidden">
                <FullCalendar {...calendarOptions} />
            </div>

            {isModalOpen && selectedEvent && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                    event={selectedEvent}
                    onUpdate={handleEventUpdate}
                />
            )}
        </div>
    );
};

export default DefaultCalendar;