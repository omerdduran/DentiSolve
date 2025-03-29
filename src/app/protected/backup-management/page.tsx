'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Backup {
    id: string;
    fileName: string;
    size: number;
    createdAt: string;
}

// Cron ifadesini okunabilir Türkçe metne çeviren fonksiyon
const cronToTurkishText = (cronExpression: string | null): string => {
    if (!cronExpression) return 'Belirtilmemiş';
    
    // "0 0 * * *" -> "Her gün gece yarısı (00:00)"
    if (cronExpression === '0 0 * * *') {
        return 'Her gün gece yarısı (00:00)';
    }
    
    return cronExpression;
};

// Loading Skeleton Components
const TableSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-muted rounded mb-4" />
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
            ))}
        </div>
    </div>
);

const ButtonsSkeleton = () => (
    <div className="flex flex-wrap gap-4 mb-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded" />
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
    const data = await response.json();
    console.log('Schedule status data:', data); // Debug için log
    return data;
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
            console.log('Refresh Data - Schedule Data:', scheduleData);
            
            // API'den gelen veriyi doğru formata çeviriyoruz
            const formattedScheduleData = {
                isScheduled: Boolean(scheduleData.isScheduled),
                cronExpression: scheduleData.isScheduled ? '0 0 * * *' : null
            };
            
            setBackups(backupsData);
            setScheduleStatus(formattedScheduleData);
            
            console.log('Formatted schedule data:', formattedScheduleData);
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
            console.log('Scheduling backup with cron:', cronExpression);

            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule: cronExpression }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Yedekleme zamanlaması oluşturulamadı');
            }
            
            const data = await response.json();
            console.log('Schedule backup response:', data);
            
            // API yanıtı farklı formatta olabilir, o yüzden doğru formata çeviriyoruz
            const updatedStatus = {
                isScheduled: true,
                cronExpression: cronExpression // API'den gelen veri yerine gönderdiğimiz cron ifadesini kullanıyoruz
            };
            
            setScheduleStatus(updatedStatus);
            console.log('Updated schedule status:', updatedStatus);
            
            setSuccess('Günlük yedekleme başarıyla zamanlandı');
            // refreshData'yı kaldırıyoruz çünkü state'i zaten güncelliyoruz
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Yedekleme zamanlaması oluşturulamadı');
            console.error('Schedule backup error:', err);
        }
    };

    const stopScheduledBackup = async () => {
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/backups?id=schedule', { method: 'DELETE' });
            if (!response.ok) throw new Error('Zamanlanmış yedekleme durdurulamadı');
            setSuccess('Zamanlanmış yedekleme durduruldu');
            await refreshData();
        } catch (err) {
            setError('Zamanlanmış yedekleme durdurulamadı');
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

    const downloadBackup = async (fileName: string) => {
        try {
            const response = await fetch(`/api/backups?action=download&fileName=${fileName}`, {
                method: 'GET',
            });
            
            if (!response.ok) {
                throw new Error('Failed to download backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download backup');
            console.error(err);
        }
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
            <div className="p-6 min-h-screen bg-background">
                <div className="h-8 w-48 bg-muted rounded mb-6 animate-pulse" />
                <ButtonsSkeleton />
                <div className="h-8 w-32 bg-muted rounded mb-4 animate-pulse" />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-background">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Yedek Yönetimi</h1>

            {error && <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-4 py-3 rounded mb-4">{success}</div>}

            <Suspense fallback={<ButtonsSkeleton />}>
                <div className="flex flex-wrap gap-4 mb-6">
                    <Button
                        onClick={createBackup}
                        disabled={loading}
                        variant="default"
                    >
                        Yedek Oluştur
                    </Button>
                    <Button
                        onClick={() => scheduleBackup('0 0 * * *')}
                        disabled={scheduleStatus.isScheduled}
                        variant="default"
                    >
                        Günlük Yedeklemeyi Başlat
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".zip"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="default"
                    >
                        Sistemi Yedekten Geri Yükle
                    </Button>
                </div>
            </Suspense>

            {scheduleStatus.isScheduled && (
                <div className="mb-6 p-4 bg-card rounded border border-border">
                    <div className="space-y-2">
                        <p className="text-foreground">
                            <span className="font-semibold">Durum:</span>{' '}
                            <span className="text-emerald-500">Aktif</span>
                        </p>
                        <p className="text-foreground">
                            <span className="font-semibold">Yedekleme Zamanı:</span>{' '}
                            <span className="text-primary">
                                {scheduleStatus.cronExpression ? cronToTurkishText(scheduleStatus.cronExpression) : 'Belirtilmemiş'}
                            </span>
                        </p>
                        <div className="text-xs text-muted-foreground">
                            Cron İfadesi: {scheduleStatus.cronExpression || 'Belirtilmemiş'}
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={stopScheduledBackup}
                            variant="destructive"
                            className="w-full sm:w-auto"
                        >
                            Zamanlanmış Yedeklemeyi Durdur
                        </Button>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-foreground">Yedekler</h2>
            <Suspense fallback={<TableSkeleton />}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-card rounded-lg border border-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="py-2 px-4 border-b border-border text-left text-muted-foreground">Dosya Adı</th>
                                <th className="py-2 px-4 border-b border-border text-left text-muted-foreground">Tarih</th>
                                <th className="py-2 px-4 border-b border-border text-left text-muted-foreground">Boyut</th>
                                <th className="py-2 px-4 border-b border-border text-left text-muted-foreground">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.map((backup) => (
                                <tr key={backup.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="py-2 px-4 border-b border-border text-foreground">{backup.fileName}</td>
                                    <td className="py-2 px-4 border-b border-border text-foreground">{format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                                    <td className="py-2 px-4 border-b border-border text-foreground">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td className="py-2 px-4 border-b border-border">
                                        <Button
                                            onClick={() => downloadBackup(backup.fileName)}
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                        >
                                            İndir
                                        </Button>
                                        <Button
                                            onClick={() => deleteBackup(backup.id)}
                                            variant="destructive"
                                            size="sm"
                                        >
                                            Sil
                                        </Button>
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