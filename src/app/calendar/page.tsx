"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DefaultCalendar from "@/components/CalendarViews/DefaultCalendar";
import EventForm from "@/components/EventForm";
import { useAuth } from '../../../context/AuthContext';
import { Plus, X } from 'lucide-react';

export default function CalendarPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [showEventForm, setShowEventForm] = useState(false);

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

    const toggleEventForm = () => {
        setShowEventForm(!showEventForm);
    };

    return (
        <main className="flex flex-col items-center p-4 md:p-8 lg:p-12 relative">
            <div className="w-full max-w-7xl">
                <DefaultCalendar />
            </div>
            <button
                onClick={toggleEventForm}
                className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors duration-200"
                aria-label="Add Event"
            >
                <Plus size={24} />
            </button>
            {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-3xl p-11 w-full relative">
                        <button
                            onClick={toggleEventForm}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                        <EventForm />
                    </div>
                </div>
            )}
        </main>
    );
}