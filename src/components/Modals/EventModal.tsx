"use client"

import React, { useState, useEffect } from 'react';
import { Patient } from "@/shared/types";
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
import {PRESET_COLORS} from "@/shared/utils";
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

    // Varsayılan değerlere sıfırlama fonksiyonu
    const resetToDefaultValues = () => {
        const now = new Date();
        const defaultPatient = patients[0];
        
        setSelectedPatient(defaultPatient || null);
        setFormData({
            id: undefined,
            title: '',
            start: formatTime(now),
            end: formatTime(now),
            color: PRESET_COLORS[0].value,
            patientId: defaultPatient?.id || 0
        });
        setStartDate(now);
        setEndDate(now);
    };

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
    }, [isOpen, onLoaded, propPatients]);

    useEffect(() => {
        if (isOpen && patients.length > 0) {
            if (event) {
                try {
                    // Güvenli bir şekilde patientId'yi al
                    const patientId = event.patientId || 
                                     (event.extendedProps && event.extendedProps.patientId) || 
                                     0;
                    
                    // Güvenli bir şekilde start ve end tarihlerini al
                    let start: Date;
                    let end: Date;
                    
                    if (typeof event.start === 'string') {
                        start = new Date(event.start);
                    } else if (event.start instanceof Date) {
                        start = event.start;
                    } else if (event._instance && event._instance.range && event._instance.range.start) {
                        start = new Date(event._instance.range.start);
                    } else {
                        start = new Date();
                    }
                    
                    if (typeof event.end === 'string') {
                        end = new Date(event.end);
                    } else if (event.end instanceof Date) {
                        end = event.end;
                    } else if (event._instance && event._instance.range && event._instance.range.end) {
                        end = new Date(event._instance.range.end);
                    } else {
                        // End tarihi yoksa start tarihinden 1 saat sonrasını kullan
                        end = new Date(start);
                        end.setHours(end.getHours() + 1);
                    }
                    
                    // Hasta seçimini yap
                    const eventPatient = patients.find(p => p.id === patientId);
                    setSelectedPatient(eventPatient || null);
                    
                    // Form verilerini güncelle
                    let eventId: number | undefined;
                    if (event.id) {
                        eventId = event.id;
                    } else if (event.publicId && typeof event.publicId === 'string') {
                        eventId = parseInt(event.publicId);
                    } else if (event._def && event._def.publicId) {
                        eventId = parseInt(event._def.publicId);
                    }
                    
                    const eventTitle = event.title || 
                                      (event._def && event._def.title) || 
                                      '';
                    
                    const eventColor = event.color || 
                                      event.backgroundColor || 
                                      (event._def && event._def.ui && event._def.ui.backgroundColor) || 
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
                    // Hata durumunda varsayılan değerleri kullan
                    resetToDefaultValues();
                }
            } else {
                resetToDefaultValues();
            }
        }
    }, [isOpen, event, patients, resetToDefaultValues]);

    const fetchPatients = async () => {
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
    };

    const handleDelete = async () => {
        if (!formData.id) {
            onClose();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/events/${formData.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete event');

            onUpdate({ id: formData.id, deleted: true });
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Etkinlik silinemedi');
        } finally {
            setIsLoading(false);
        }
    };

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
                            className="w-full px-3 py-2 border rounded-md"
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
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                    locale={tr}
                                />
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
                            className="w-full px-3 py-2 border rounded-md"
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
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                    locale={tr}
                                />
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
                            className="w-full px-3 py-2 border rounded-md"
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
                                    <CommandInput placeholder="Hasta ara..." />
                                    <CommandList>
                                        <CommandEmpty>Hasta bulunamadı.</CommandEmpty>
                                        <CommandGroup>
                                            {patients.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    value={patient.id.toString()}
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