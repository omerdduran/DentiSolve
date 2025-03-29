"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Patient } from "@/lib/types";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from 'date-fns/locale'
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
import {PRESET_COLORS} from "@/lib/utils";
import ModalWrapper from './ModalWrapper';


interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id?: number;
        title?: string;
        start?: string | Date;
        end?: string | Date;
        color?: string;
        backgroundColor?: string;
        patientId?: number;
        publicId?: string;
        extendedProps?: {
            patientId?: number;
        };
        _instance?: {
            range?: {
                start?: Date;
                end?: Date;
            };
        };
        _def?: {
            publicId?: string;
            title?: string;
            ui?: {
                backgroundColor?: string;
            };
        };
    } | null;
    patients?: Patient[];
    onUpdate: (updatedEvent: any) => void;
    onLoaded?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, patients: propPatients, onUpdate, onLoaded }) => {
    const [formData, setFormData] = useState({
        id: undefined as number | undefined,
        title: '',
        start: '',
        end: '',
        color: PRESET_COLORS[0].value,
        patientId: 0,
    });
    const [patients, setPatients] = useState<Patient[]>(propPatients || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const formatTime = useCallback((date: Date): string => {
        return date.toTimeString().slice(0, 5);
    }, []);

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Hastalar yüklenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Varsayılan değerlere sıfırlama fonksiyonu
    const resetToDefaultValues = useCallback(() => {
        const now = new Date();
        
        setSelectedPatient(null);
        setFormData({
            id: undefined,
            title: '',
            start: formatTime(now),
            end: formatTime(now),
            color: PRESET_COLORS[0].value,
            patientId: 0
        });
        setStartDate(now);
        setEndDate(now);
    }, [formatTime]);

    // Modal açıldığında hastaları yükle
    useEffect(() => {
        if (isOpen) {
            if (propPatients) {
                setPatients(propPatients);
            } else {
                fetchPatients();
            }
            if (onLoaded) {
                onLoaded();
            }
        }
    }, [isOpen, onLoaded, propPatients, fetchPatients]);

    // Event verilerini form state'ine yükle
    useEffect(() => {
        if (isOpen && patients.length > 0) {
            if (event) {
                try {
                    const patientId = event.patientId || 
                                     (event.extendedProps && event.extendedProps.patientId) || 
                                     0;
                    
                    let start: Date;
                    let end: Date;
                    
                    if (typeof event.start === 'string') {
                        start = new Date(event.start);
                    } else if (event.start instanceof Date) {
                        start = event.start;
                    } else if (event._instance?.range?.start) {
                        start = new Date(event._instance.range.start);
                    } else {
                        start = new Date();
                    }
                    
                    if (typeof event.end === 'string') {
                        end = new Date(event.end);
                    } else if (event.end instanceof Date) {
                        end = event.end;
                    } else if (event._instance?.range?.end) {
                        end = new Date(event._instance.range.end);
                    } else {
                        end = new Date(start);
                        end.setHours(end.getHours() + 1);
                    }
                    
                    const eventPatient = patients.find(p => p.id === patientId);
                    setSelectedPatient(eventPatient || null);
                    
                    let eventId: number | undefined;
                    if (event.id) {
                        eventId = event.id;
                    } else if (event.publicId && typeof event.publicId === 'string') {
                        eventId = parseInt(event.publicId);
                    } else if (event._def?.publicId) {
                        eventId = parseInt(event._def.publicId);
                    }
                    
                    const eventTitle = event.title || 
                                      (event._def?.title) || 
                                      '';
                    
                    const eventColor = event.color || 
                                      event.backgroundColor || 
                                      (event._def?.ui?.backgroundColor) || 
                                      PRESET_COLORS[0].value;
                    
                    setFormData({
                        id: eventId,
                        title: eventTitle,
                        start: formatTime(start),
                        end: formatTime(end),
                        color: eventColor,
                        patientId: patientId
                    });
                    
                    setStartDate(start);
                    setEndDate(end);
                } catch (error) {
                    console.error('Event verisi işlenirken hata oluştu:', error);
                    resetToDefaultValues();
                }
            } else {
                resetToDefaultValues();
            }
        }
    }, [isOpen, event, patients, resetToDefaultValues, formatTime]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleColorChange = useCallback((color: string) => {
        setFormData(prev => ({ ...prev, color }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPatient) {
            setError('Lütfen bir hasta seçin');
            return;
        }
        
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
                patientId: selectedPatient.id
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
            onUpdate(savedEvent);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            setError('Etkinlik kaydedilemedi');
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, formData, selectedPatient, onUpdate, onClose]);

    const handleDelete = useCallback(async () => {
        if (!formData.id) {
            onClose();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/events/${formData.id}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete event');
            }

            // Silme işlemi başarılı olduğunda
            onUpdate({ id: formData.id, deleted: true });
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Etkinlik silinemedi');
        } finally {
            setIsLoading(false);
        }
    }, [formData.id, onUpdate, onClose]);

    if (!isOpen) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{formData.id ? 'Randevuyu Düzenle' : 'Yeni Randevu Ekle'}</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="title">Başlık</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
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
                                    {startDate ? format(startDate, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" onPointerDownOutside={(e) => e.preventDefault()}>
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <button 
                                            type="button" 
                                            className="p-1 rounded-full hover:bg-gray-100"
                                            onClick={() => {
                                                const prevMonth = new Date(startDate || new Date());
                                                prevMonth.setMonth(prevMonth.getMonth() - 1);
                                                setStartDate(prevMonth);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                        </button>
                                        <div className="font-medium">
                                            {startDate ? format(startDate, "MMMM yyyy", { locale: tr }) : format(new Date(), "MMMM yyyy", { locale: tr })}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="p-1 rounded-full hover:bg-gray-100"
                                            onClick={() => {
                                                const nextMonth = new Date(startDate || new Date());
                                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                                setStartDate(nextMonth);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['PT', 'SA', 'ÇA', 'PE', 'CU', 'CT', 'PZ'].map((day, i) => (
                                            <div key={i} className="text-center text-xs font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1">
                                        {(() => {
                                            const currentDate = startDate || new Date();
                                            const year = currentDate.getFullYear();
                                            const month = currentDate.getMonth();
                                            
                                            const firstDay = new Date(year, month, 1);
                                            const lastDay = new Date(year, month + 1, 0);
                                            
                                            let firstDayOfWeek = firstDay.getDay();
                                            firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                                            
                                            const daysFromPrevMonth = firstDayOfWeek;
                                            const totalDays = daysFromPrevMonth + lastDay.getDate();
                                            const totalCells = Math.ceil(totalDays / 7) * 7;
                                            
                                            const days = [];
                                            
                                            const prevMonthLastDay = new Date(year, month, 0).getDate();
                                            for (let i = 0; i < daysFromPrevMonth; i++) {
                                                const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
                                                days.push({
                                                    date: new Date(year, month - 1, day),
                                                    day,
                                                    isCurrentMonth: false,
                                                    isToday: false
                                                });
                                            }
                                            
                                            const today = new Date();
                                            for (let i = 1; i <= lastDay.getDate(); i++) {
                                                const date = new Date(year, month, i);
                                                days.push({
                                                    date,
                                                    day: i,
                                                    isCurrentMonth: true,
                                                    isToday: 
                                                        date.getDate() === today.getDate() && 
                                                        date.getMonth() === today.getMonth() && 
                                                        date.getFullYear() === today.getFullYear(),
                                                    isSelected: startDate && 
                                                        date.getDate() === startDate.getDate() && 
                                                        date.getMonth() === startDate.getMonth() && 
                                                        date.getFullYear() === startDate.getFullYear()
                                                });
                                            }
                                            
                                            const remainingCells = totalCells - days.length;
                                            for (let i = 1; i <= remainingCells; i++) {
                                                days.push({
                                                    date: new Date(year, month + 1, i),
                                                    day: i,
                                                    isCurrentMonth: false,
                                                    isToday: false
                                                });
                                            }
                                            
                                            return days.map((day, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={cn(
                                                        "h-8 w-8 rounded-full flex items-center justify-center text-sm",
                                                        !day.isCurrentMonth && "text-gray-400",
                                                        day.isCurrentMonth && "hover:bg-gray-100",
                                                        day.isToday && "border border-blue-500",
                                                        day.isSelected && "bg-blue-500 text-white hover:bg-blue-600"
                                                    )}
                                                    onClick={() => setStartDate(day.date)}
                                                >
                                                    {day.day}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="start">Başlangıç Saati</label>
                        <input
                            type="time"
                            id="start"
                            name="start"
                            value={formData.start}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
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
                                    {endDate ? format(endDate, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" onPointerDownOutside={(e) => e.preventDefault()}>
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <button 
                                            type="button" 
                                            className="p-1 rounded-full hover:bg-gray-100"
                                            onClick={() => {
                                                const prevMonth = new Date(endDate || new Date());
                                                prevMonth.setMonth(prevMonth.getMonth() - 1);
                                                setEndDate(prevMonth);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                        </button>
                                        <div className="font-medium">
                                            {endDate ? format(endDate, "MMMM yyyy", { locale: tr }) : format(new Date(), "MMMM yyyy", { locale: tr })}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="p-1 rounded-full hover:bg-gray-100"
                                            onClick={() => {
                                                const nextMonth = new Date(endDate || new Date());
                                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                                setEndDate(nextMonth);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['PT', 'SA', 'ÇA', 'PE', 'CU', 'CT', 'PZ'].map((day, i) => (
                                            <div key={i} className="text-center text-xs font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1">
                                        {(() => {
                                            const currentDate = endDate || new Date();
                                            const year = currentDate.getFullYear();
                                            const month = currentDate.getMonth();
                                            
                                            const firstDay = new Date(year, month, 1);
                                            const lastDay = new Date(year, month + 1, 0);
                                            
                                            let firstDayOfWeek = firstDay.getDay();
                                            firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                                            
                                            const daysFromPrevMonth = firstDayOfWeek;
                                            const totalDays = daysFromPrevMonth + lastDay.getDate();
                                            const totalCells = Math.ceil(totalDays / 7) * 7;
                                            
                                            const days = [];
                                            
                                            const prevMonthLastDay = new Date(year, month, 0).getDate();
                                            for (let i = 0; i < daysFromPrevMonth; i++) {
                                                const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
                                                days.push({
                                                    date: new Date(year, month - 1, day),
                                                    day,
                                                    isCurrentMonth: false,
                                                    isToday: false
                                                });
                                            }
                                            
                                            const today = new Date();
                                            for (let i = 1; i <= lastDay.getDate(); i++) {
                                                const date = new Date(year, month, i);
                                                days.push({
                                                    date,
                                                    day: i,
                                                    isCurrentMonth: true,
                                                    isToday: 
                                                        date.getDate() === today.getDate() && 
                                                        date.getMonth() === today.getMonth() && 
                                                        date.getFullYear() === today.getFullYear(),
                                                    isSelected: endDate && 
                                                        date.getDate() === endDate.getDate() && 
                                                        date.getMonth() === endDate.getMonth() && 
                                                        date.getFullYear() === endDate.getFullYear()
                                                });
                                            }
                                            
                                            const remainingCells = totalCells - days.length;
                                            for (let i = 1; i <= remainingCells; i++) {
                                                days.push({
                                                    date: new Date(year, month + 1, i),
                                                    day: i,
                                                    isCurrentMonth: false,
                                                    isToday: false
                                                });
                                            }
                                            
                                            return days.map((day, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={cn(
                                                        "h-8 w-8 rounded-full flex items-center justify-center text-sm",
                                                        !day.isCurrentMonth && "text-gray-400",
                                                        day.isCurrentMonth && "hover:bg-gray-100",
                                                        day.isToday && "border border-blue-500",
                                                        day.isSelected && "bg-blue-500 text-white hover:bg-blue-600"
                                                    )}
                                                    onClick={() => setEndDate(day.date)}
                                                >
                                                    {day.day}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="end">Bitiş Saati</label>
                        <input
                            type="time"
                            id="end"
                            name="end"
                            value={formData.end}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Hasta</label>
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
                                        : "Hasta seçin..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput 
                                        placeholder="Hasta ara..." 
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>Hasta bulunamadı.</CommandEmpty>
                                        <CommandGroup>
                                            {filteredPatients.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    onSelect={() => {
                                                        setSelectedPatient(patient);
                                                        setFormData(prev => ({ ...prev, patientId: patient.id }));
                                                        setOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {patient.firstName} {patient.lastName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Renk</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {PRESET_COLORS.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${formData.color === colorOption.value ? 'border-black' : 'border-transparent'}`}
                                    style={{ backgroundColor: colorOption.value }}
                                    onClick={() => handleColorChange(colorOption.value)}
                                    aria-label={`Renk: ${colorOption.name}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        {formData.id && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Siliniyor...' : 'Sil'}
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    );
};

export default EventModal;