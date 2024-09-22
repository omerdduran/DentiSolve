"use client"

import React, { useState, useEffect } from 'react';
import { Patient } from "@/shared/types";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {PRESET_COLORS} from "@/shared/utils";


interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id?: number;
        title: string;
        start: string;
        end: string;
        color: string;
        patientId: number;
    } | null;
    onEventUpdate: (updatedEvent: any) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, onEventUpdate }) => {
    const [formData, setFormData] = useState({
        id: undefined as number | undefined,
        title: '',
        start: '',
        end: '',
        color: PRESET_COLORS[0].value,
        patientId: 0,
    });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && event) {
            const start = new Date(event.start);
            const end = new Date(event.end);
            setFormData({
                id: event.id,
                title: event.title,
                start: formatTime(start),
                end: formatTime(end),
                color: event.color,
                patientId: event.patientId,
            });
            setStartDate(start);
            setEndDate(end);
        } else {
            // Reset form for new event
            setFormData({
                id: undefined,
                title: '',
                start: '',
                end: '',
                color: PRESET_COLORS[0].value,
                patientId: 0,
            });
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedPatient(null);
        }
    }, [isOpen, event]);

    useEffect(() => {
        if (patients.length > 0 && formData.patientId) {
            const patient = patients.find(p => p.id === formData.patientId);
            setSelectedPatient(patient || null);
        }
    }, [patients, formData.patientId]);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data = await response.json();
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatTime = (date: Date): string => {
        return date.toTimeString().slice(0, 5); // Returns time in HH:MM format
    };

    const handleColorChange = (color: string) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const startDateTime = new Date(startDate!);
            const endDateTime = new Date(endDate!);
            const [startHours, startMinutes] = formData.start.split(':');
            const [endHours, endMinutes] = formData.end.split(':');

            startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

            const eventData = {
                ...formData,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                patientId: selectedPatient?.id
            };

            const url = formData.id ? `/api/events/${formData.id}` : '/api/events/create';
            const method = formData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) throw new Error('Failed to save event');

            const savedEvent = await response.json();
            onEventUpdate(savedEvent);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            setError('Failed to save event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.id) return;
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/events/${formData.id}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete event');

            onEventUpdate({ id: formData.id, deleted: true });
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Failed to delete event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Event' : 'Create New Event'}</h2>
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
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="start">Start Time</label>
                        <input
                            type="time"
                            id="start"
                            name="start"
                            value={formData.start}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="end">End Time</label>
                        <input
                            type="time"
                            id="end"
                            name="end"
                            value={formData.end}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Patient</label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {selectedPatient
                                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                                        : "Select patient..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search patient..." />
                                    <CommandList>
                                        <CommandEmpty>No patient found.</CommandEmpty>
                                        <CommandGroup>
                                            {patients.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    value={`${patient.firstName} ${patient.lastName}`}
                                                    onSelect={() => {
                                                        setSelectedPatient(patient);
                                                        setFormData(prev => ({ ...prev, patientId: patient.id }));
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {`${patient.firstName} ${patient.lastName}`}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Event Color</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {PRESET_COLORS.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => handleColorChange(preset.value)}
                                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        formData.color === preset.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                    }`}
                                    style={{ backgroundColor: preset.value }}
                                    title={preset.name}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            disabled={isLoading}
                        >
                            {formData.id ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                    {formData.id && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className='w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
                                disabled={isLoading}
                            >
                                Delete Event
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EventModal;