import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface PatientFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    homePhone: string;
    currentTreatment: string;
    medicalHistory: string;
    anyMedicalProblems: string;
    womenSpecificInfo: string;
}

interface PatientFormProps {
    initialData?: Partial<PatientFormData>;
    onSubmit: (formData: PatientFormData) => Promise<void>;
    submitButtonText?: string;
    isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
                                                     initialData,
                                                     onSubmit,
                                                     submitButtonText = 'Hasta Ekle',
                                                     isLoading = false
                                                 }) => {
    const [formData, setFormData] = useState<PatientFormData>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
        homePhone: initialData?.homePhone || '',
        currentTreatment: initialData?.currentTreatment || '',
        medicalHistory: initialData?.medicalHistory || '',
        anyMedicalProblems: initialData?.anyMedicalProblems || '',
        womenSpecificInfo: initialData?.womenSpecificInfo || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | undefined) => {
        setFormData(prev => ({ ...prev, dateOfBirth: date }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, homePhone: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const CustomCalendar: React.FC<{
        selected: Date | undefined;
        onSelect: (date: Date | undefined) => void;
        disabled: (date: Date) => boolean;
    }> = ({ selected, onSelect, disabled }) => {
        const [date, setDate] = useState(selected || new Date());

        const onMonthChange = (action: 'next' | 'previous') => {
            setDate(prevDate => {
                const newDate = new Date(prevDate);
                if (action === 'next') {
                    newDate.setMonth(newDate.getMonth() + 1);
                } else {
                    newDate.setMonth(newDate.getMonth() - 1);
                }
                return newDate;
            });
        };

        const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

        return (
            <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                    <Button
                        variant="outline"
                        className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        onClick={() => onMonthChange('previous')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Select
                        value={date.getFullYear().toString()}
                        onValueChange={(value) => setDate(new Date(parseInt(value), date.getMonth(), 1))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue>{date.getFullYear()}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        onClick={() => onMonthChange('next')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={onSelect}
                    disabled={disabled}
                    month={date}
                    onMonthChange={setDate}
                />
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad</label>
                    <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Soyad</label>
                    <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full mt-1 pl-3 text-left font-normal",
                                    !formData.dateOfBirth && "text-muted-foreground"
                                )}
                            >
                                {formData.dateOfBirth ? (
                                    format(formData.dateOfBirth, "PPP")
                                ) : (
                                    <span>Bir tarih seçin</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CustomCalendar
                                selected={formData.dateOfBirth}
                                onSelect={handleDateChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                    <PhoneInput
                        value={formData.homePhone}
                        onChange={handlePhoneChange}
                        defaultCountry="TR"
                        className="mt-1"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mevcut Tedavi veya İlaçlar</label>
                <Textarea
                    name="currentTreatment"
                    value={formData.currentTreatment}
                    onChange={handleChange}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tıbbi Geçmiş</label>
                <Textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Diğer Tıbbi Sorunlar</label>
                <Textarea
                    name="anyMedicalProblems"
                    value={formData.anyMedicalProblems}
                    onChange={handleChange}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Kadın Sağlığı (Gebelik, Düşük, Menstruasyon, Menopoz)</label>
                <Textarea
                    name="womenSpecificInfo"
                    value={formData.womenSpecificInfo}
                    onChange={handleChange}
                    className="mt-1"
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {submitButtonText}
                </Button>
            </div>
        </form>
    );
};

export default PatientForm;