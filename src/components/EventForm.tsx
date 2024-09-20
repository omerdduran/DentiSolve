import React, { useState, useEffect } from 'react';
import { Patient } from "@/shared/types";
import { PRESET_COLORS } from "@/shared/utils";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EventForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<string>('00:00');
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<string>('00:00');
    const [color, setColor] = useState(PRESET_COLORS[0].value);
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchPatients() {
            try {
                const response = await fetch('/api/patients');
                if (!response.ok) {
                    throw new Error('Hastalar getirilemedi');
                }
                const data = await response.json();
                setPatients(data);
            } catch (error) {
                console.error('Hata:', error);
                setError('Hastalar getirilemedi');
            } finally {
                setLoading(false);
            }
        }

        fetchPatients();
    }, []);

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (selectedPatient === null) {
            setError('Lütfen bir hasta seçin');
            setIsSubmitting(false);
            return;
        }

        if (!startDate || !endDate) {
            setError('Lütfen başlangıç ve bitiş tarihlerini seçin');
            setIsSubmitting(false);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
        end.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));

        if (end <= start) {
            setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    start,
                    end,
                    color,
                    patientId: selectedPatient
                }),
            });

            if (!response.ok) {
                throw new Error('Etkinlik oluşturulamadı');
            }

            const result = await response.json();
            console.log('Etkinlik oluşturuldu:', result);
            setSuccess('Etkinlik başarıyla takvime eklendi');

            // Formu sıfırla
            setTitle('');
            setStartDate(null);
            setStartTime('00:00');
            setEndDate(null);
            setEndTime('00:00');
            setColor(PRESET_COLORS[0].value);
            setSelectedPatient(null);
            setQuery('');

            // 3 saniye sonra başarı mesajını temizle
            setTimeout(() => setSuccess(null), 3000);

        } catch (error) {
            console.error('Hata:', error);
            setError('Etkinlik oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = query === ''
        ? []
        : patients.filter(patient =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query.toLowerCase())
        );

    if (loading) return <p className="text-center py-4">Hastalar yükleniyor...</p>;

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
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tedavi</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Tedavi girin"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Başlangıç
                            Tarihi</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Tarih seçin"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Başlangıç Saati
                            (24 saat formatı)</label>
                        <input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(formatTime(e.target.value))}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Bitiş
                            Tarihi</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Tarih seçin"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Bitiş Saati (24
                            saat formatı)</label>
                        <input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(formatTime(e.target.value))}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>


                <div>
                    <label htmlFor="patient" className="block text-sm font-medium text-gray-700">Hasta</label>
                    <div className="relative mt-1">
                        <input
                            id="patient"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Hasta ara"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {filteredPatients.length > 0 && (
                            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {filteredPatients.map(patient => (
                                    <li
                                        key={patient.id}
                                        onClick={() => {
                                            setSelectedPatient(patient.id);
                                            setQuery(`${patient.firstName} ${patient.lastName}`);
                                        }}
                                        className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
                                            selectedPatient === patient.id ? 'text-white bg-blue-600' : 'text-gray-900'
                                        }`}
                                    >
                                        {patient.firstName} {patient.lastName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Belirti Rengi</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {PRESET_COLORS.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => setColor(preset.value)}
                                className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    color === preset.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-2 text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600'} rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
                {isSubmitting ? 'Yükleniyor...' : 'Takvime Ekle'}
            </button>
        </form>
    );
};

export default EventForm;
