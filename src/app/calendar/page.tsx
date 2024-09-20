"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DefaultCalendar from "@/components/CalendarViews/DefaultCalendar";
import EventForm from "@/components/EventForm";
import { useAuth } from '../../../context/AuthContext';

export default function CalendarPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <main className="flex flex-col min-h-screen items-center p-4 md:p-8 lg:p-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Takvim</h1>
            <div className="w-full max-w-4xl">
                <EventForm />
                <div className="mt-8">
                    <DefaultCalendar />
                </div>
            </div>
        </main>
    );
}
