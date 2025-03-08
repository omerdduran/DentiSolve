"use client";

import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventContentArg, CalendarOptions } from '@fullcalendar/core';
import EventModal from "@/components/Modals/EventModal";
import { Patient } from "@/shared/types";
import { PRESET_COLORS } from "@/shared/utils";
import { useEvents, usePatients, QUERY_KEYS } from '@/hooks/use-query-hooks';
import { useQueryClient } from '@tanstack/react-query';

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
                @media (max-width: 768px) {
                    .fc .fc-toolbar {
                        flex-direction: column;
                        gap: 4px;
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1em;
                        margin: 0 !important;
                        padding: 4px 0;
                    }
                }
            `}</style>
            <FullCalendar {...calendarOptions} />
            {isModalOpen && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    event={selectedEvent}
                    patients={patientsData}
                    onUpdate={handleEventUpdate}
                />
            )}
        </div>
    );
};

export default DefaultCalendar;