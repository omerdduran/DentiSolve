"use client";

import React, { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/use-query-hooks';

// Dinamik importlar
const DefaultCalendar = dynamic(() => import("@/components/CalendarViews/DefaultCalendar"), {
    loading: () => (
        <div className="w-full h-[600px] bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
            </div>
        </div>
    ),
    ssr: false // Calendar genellikle client-side rendering gerektirir
});

const EventForm = dynamic(() => import("@/components/EventForm"), {
    loading: () => (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-32 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
    )
});

export default function CalendarPage() {
    const [showEventForm, setShowEventForm] = useState(false);
    const queryClient = useQueryClient();
    const [refreshKey, setRefreshKey] = useState(0);

    // Sayfa yüklendiğinde verileri yenile
    useEffect(() => {
        // Sadece events sorgusunu geçersiz kıl
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
    }, [queryClient, refreshKey]);

    const toggleEventForm = () => {
        setShowEventForm(!showEventForm);
    };

    const handleEventAdded = () => {
        // Etkinlik eklendiğinde takvimi yenile
        setShowEventForm(false);
        
        // Takvimi zorla yenile
        setRefreshKey(prev => prev + 1);
        
        // Events sorgusunu geçersiz kıl ve yeniden getir
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
        queryClient.refetchQueries({ queryKey: [QUERY_KEYS.EVENTS] });
    };

    return (
        <main className="flex flex-col items-center p-4 md:p-8 lg:p-12 relative">
            <div className="w-full max-w-7xl min-h-dvh">
                <Suspense fallback={
                    <div className="w-full h-[600px] bg-white rounded-lg shadow-md p-4 animate-pulse">
                        <div className="h-12 bg-gray-200 rounded mb-4" />
                        <div className="grid grid-cols-7 gap-2">
                            {[...Array(35)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                }>
                    <DefaultCalendar key={refreshKey} />
                </Suspense>
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
                        <Suspense fallback={
                            <div className="space-y-4 animate-pulse">
                                <div className="h-10 bg-gray-200 rounded w-full" />
                                <div className="h-32 bg-gray-200 rounded w-full" />
                                <div className="h-10 bg-gray-200 rounded w-1/2" />
                            </div>
                        }>
                            <EventForm onEventAdded={handleEventAdded} />
                        </Suspense>
                    </div>
                </div>
            )}
        </main>
    );
}