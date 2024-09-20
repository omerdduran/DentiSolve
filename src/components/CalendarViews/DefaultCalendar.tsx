'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Patient, Event } from '@/shared/types';
import {PRESET_COLORS} from "@/shared/utils";
import EventModal from "@/components/Modals/EventModal";

const DefaultCalendar: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [patients, setPatients] = useState<{ [key: number]: Patient }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const calendarRef = useRef<any>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchEvents();
        fetchPatients();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            setError('Failed to load events. Please try again later.');
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data: Patient[] = await response.json();
            const patientMap = data.reduce((acc, patient) => {
                acc[patient.id] = patient;
                return acc;
            }, {} as { [key: number]: Patient });
            setPatients(patientMap);
        } catch (error) {
            setError('Failed to load patient information.');
        }
    };

    const handleEventClick = useCallback((info: any) => {
        const event = events.find(e => e.id.toString() === info.event.id);
        if (event) {
            const patient = patients[event.patientId];
            setModalData({
                title: event.title,
                start: new Date(event.start).toLocaleString('tr-TR'),
                end: new Date(event.end).toLocaleString('tr-TR'),
                patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
                color: event.color,
            });
            setIsModalOpen(true);
        }
    }, [events, patients]);

    const handleDateClick = useCallback((info: any) => {
        setModalData({ title: 'Yeni Etkinlik', start: info.dateStr, end: info.dateStr, color: PRESET_COLORS[0].value });
        setIsModalOpen(true);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-2">
            {error && <div className="text-red-500 mb-4 p-2 bg-red-100 rounded">{error}</div>}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Randevu Takvimi</h2>
                </div>
                <div className="p-4">
                    <Calendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
                        // @ts-ignore
                        events={events}
                        eventClick={handleEventClick}
                        dateClick={handleDateClick}
                        locale="tr"
                        nowIndicator={true}
                    />
                </div>
            </div>
            {isModalOpen && <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} modalData={modalData} />}
        </div>
    );
};

export default DefaultCalendar;
