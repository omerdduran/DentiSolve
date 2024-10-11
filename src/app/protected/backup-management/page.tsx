'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface Backup {
    id: string;
    fileName: string;
    size: number;
    createdAt: string;
}

export default function BackupManagementPage() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [scheduleStatus, setScheduleStatus] = useState<{ isScheduled: boolean; cronExpression: string | null }>({ isScheduled: false, cronExpression: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBackups();
        fetchScheduleStatus();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/backups');
            if (!response.ok) throw new Error('Failed to fetch backups');
            const data = await response.json();
            setBackups(data);
        } catch (err) {
            setError('Failed to load backups');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchScheduleStatus = async () => {
        try {
            const response = await fetch('/api/backups?action=schedule-status');
            if (!response.ok) throw new Error('Failed to fetch schedule status');
            const data = await response.json();
            setScheduleStatus(data);
        } catch (err) {
            console.error('Failed to fetch schedule status:', err);
        }
    };

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
            await fetchBackups();
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
            await fetchScheduleStatus();
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
            await fetchScheduleStatus();
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
            await fetchBackups();
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
            await fetchBackups();
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Backup Management</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={createBackup}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    Create Backup
                </button>
                <button
                    onClick={() => scheduleBackup('0 0 * * *')}
                    disabled={scheduleStatus.isScheduled}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    Schedule Daily Backup
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
                    Restore Backup
                </button>
            </div>

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

            <h2 className="text-2xl font-bold mb-4">Backups</h2>
            {loading ? (
                <p className="text-gray-600">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b text-left">File Name</th>
                            <th className="py-2 px-4 border-b text-left">Created At</th>
                            <th className="py-2 px-4 border-b text-left">Size</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
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
                                        Download
                                    </button>
                                    <button
                                        onClick={() => deleteBackup(backup.id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}