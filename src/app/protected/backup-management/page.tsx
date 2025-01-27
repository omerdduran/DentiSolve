'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

interface Backup {
    id: string;
    fileName: string;
    size: number;
    createdAt: string;
}

// Loading Skeleton Components
const TableSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
        </div>
    </div>
);

const ButtonsSkeleton = () => (
    <div className="flex flex-wrap gap-4 mb-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded" />
        ))}
    </div>
);

// Optimize edilmiş veri yükleme fonksiyonları
const fetchBackupsData = async () => {
    const response = await fetch('/api/backups', {
        next: { revalidate: 30 } // 30 saniyelik cache
    });
    if (!response.ok) throw new Error('Failed to fetch backups');
    return response.json();
};

const fetchScheduleStatusData = async () => {
    const response = await fetch('/api/backups?action=schedule-status', {
        next: { revalidate: 30 }
    });
    if (!response.ok) throw new Error('Failed to fetch schedule status');
    return response.json();
};

export default function BackupManagementPage() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [scheduleStatus, setScheduleStatus] = useState<{ isScheduled: boolean; cronExpression: string | null }>({ isScheduled: false, cronExpression: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshData = async () => {
        try {
            const [backupsData, scheduleData] = await Promise.all([
                fetchBackupsData(),
                fetchScheduleStatusData()
            ]);
            setBackups(backupsData);
            setScheduleStatus(scheduleData);
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError('Failed to refresh data');
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await refreshData();
            } catch (err) {
                console.error('Error loading initial data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        void loadInitialData();
    }, []);

    const createBackup = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create backup');
            }
            const data = await response.json();
            setSuccess(data.message);
            await refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create backup');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scheduleBackup = async (cronExpression: string) => {
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule: cronExpression }),
            });
            if (!response.ok) throw new Error('Failed to schedule backup');
            setSuccess('Backup scheduled successfully');
            await refreshData();
        } catch (err) {
            setError('Failed to schedule backup');
            console.error(err);
        }
    };

    const stopScheduledBackup = async () => {
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/backups?id=schedule', { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to stop scheduled backup');
            setSuccess('Scheduled backup stopped');
            await refreshData();
        } catch (err) {
            setError('Failed to stop scheduled backup');
            console.error(err);
        }
    };

    const deleteBackup = async (id: string) => {
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`/api/backups?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete backup');
            setSuccess('Backup deleted successfully');
            await refreshData();
        } catch (err) {
            setError('Failed to delete backup');
            console.error(err);
        }
    };

    const downloadBackup = (fileName: string) => {
        window.location.href = `../../../../backups`;
    };

    const restoreBackup = async (file: File) => {
        setError(null);
        setSuccess(null);
        const formData = new FormData();
        formData.append('backup', file);

        try {
            const response = await fetch('/api/backups', {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to restore backup');
            }

            setSuccess('Backup restored successfully');
            await refreshData();
        } catch (err) {
            setError('Failed to restore backup');
            console.error(err);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            restoreBackup(file);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
                <ButtonsSkeleton />
                <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Yedek Yönetimi</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <Suspense fallback={<ButtonsSkeleton />}>
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={createBackup}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        Yedek Oluştur
                    </button>
                    <button
                        onClick={() => scheduleBackup('0 0 * * *')}
                        disabled={scheduleStatus.isScheduled}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        Günlük Yedeklemeyi Başlat
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".zip"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Sistemi Yedekten Geri Yükle
                    </button>
                </div>
            </Suspense>

            {scheduleStatus.isScheduled && (
                <div className="mb-6 p-4 bg-gray-100 rounded">
                    <p className="mb-2">Current schedule: {scheduleStatus.cronExpression}</p>
                    <button
                        onClick={stopScheduledBackup}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Stop Scheduled Backup
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4">Yedekler</h2>
            <Suspense fallback={<TableSkeleton />}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Dosya Adı</th>
                                <th className="py-2 px-4 border-b text-left">Tarih</th>
                                <th className="py-2 px-4 border-b text-left">Boyut</th>
                                <th className="py-2 px-4 border-b text-left">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.map((backup) => (
                                <tr key={backup.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{backup.fileName}</td>
                                    <td className="py-2 px-4 border-b">{format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                                    <td className="py-2 px-4 border-b">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => downloadBackup(backup.fileName)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 text-sm"
                                        >
                                            İndir
                                        </button>
                                        <button
                                            onClick={() => deleteBackup(backup.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Suspense>
        </div>
    );
}