"use client"

import React, { useState } from 'react';
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
import { usePatients, useCreateAppointment } from '@/hooks/use-query-hooks';

interface EventFormProps {
    onEventAdded?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onEventAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        start: '',
        end: '',
        color: PRESET_COLORS[0].value,
        patientId: 0,
    });
    const { data: patients = [], isLoading: patientsLoading } = usePatients();
    const createAppointmentMutation = useCreateAppointment();
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedPatient) {
            setError('Lütfen bir hasta seçin');
            return;
        }

        if (!startDate || !endDate) {
            setError('Lütfen başlangıç ve bitiş tarihlerini seçin');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(parseInt(formData.start.split(':')[0]), parseInt(formData.start.split(':')[1]));
        end.setHours(parseInt(formData.end.split(':')[0]), parseInt(formData.end.split(':')[1]));

        if (end <= start) {
            setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
            return;
        }

        try {
            await createAppointmentMutation.mutateAsync({
                title: formData.title,
                date: start.toISOString(),
                patientId: selectedPatient.id
            });
            
            setSuccess('Etkinlik başarıyla takvime eklendi');

            // Formu sıfırla
            setFormData({
                title: '',
                start: '',
                end: '',
                color: PRESET_COLORS[0].value,
                patientId: 0,
            });
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedPatient(null);

            // Etkinlik eklendiğinde callback'i çağır
            if (onEventAdded) {
                onEventAdded();
            } else {
                // 3 saniye sonra başarı mesajını temizle
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Hata:', error);
            setError('Etkinlik oluşturulamadı. Lütfen tekrar deneyin.');
        }
    };

    if (patientsLoading) return <p className="text-center py-4">Yükleniyor...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="title">Tedavi</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
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
                                    {startDate ? format(startDate, "PPP") : <span>Tarih seçin</span>}
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
                    <div>
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
                    <div>
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
                                    {endDate ? format(endDate, "PPP") : <span>Tarih seçin</span>}
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
                    <div>
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
                </div>

                <div>
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
                                <CommandEmpty>Hasta bulunamadı.</CommandEmpty>
                                <CommandList>
                                    <CommandGroup>
                                        {patients.map((patient) => (
                                            <CommandItem
                                                key={patient.id}
                                                value={`${patient.firstName} ${patient.lastName}`}
                                                onSelect={() => {
                                                    setSelectedPatient(patient);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedPatient?.id === patient.id
                                                            ? "opacity-100"
                                                            : "opacity-0"
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

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="color">Renk</label>
                    <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        {PRESET_COLORS.map((color) => (
                            <option key={color.value} value={color.value}>
                                {color.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={createAppointmentMutation.isPending}
            >
                {createAppointmentMutation.isPending ? "Oluşturuluyor..." : "Randevu Oluştur"}
            </Button>
        </form>
    );
};

export default EventForm;