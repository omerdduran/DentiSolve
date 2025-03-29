"use client";

import React, { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/hooks/use-query-hooks';
import EventModal from '@/components/Modals/EventModal';

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

export default function CalendarPage() {
    const [showEventModal, setShowEventModal] = useState(false);
    const queryClient = useQueryClient();
    const [refreshKey, setRefreshKey] = useState(0);

    // Sayfa yüklendiğinde verileri yenile
    useEffect(() => {
        // Sadece events sorgusunu geçersiz kıl
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
    }, [queryClient, refreshKey]);

    const toggleEventModal = () => {
        setShowEventModal(!showEventModal);
    };

    const handleEventUpdate = () => {
        // Etkinlik güncellendiğinde takvimi yenile
        setShowEventModal(false);
        
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
                onClick={toggleEventModal}
                className="fixed bottom-20 sm:bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors duration-200 z-50"
                aria-label="Yeni randevu ekle"
            >
                <Plus size={28} />
            </button>

            {showEventModal && (
                <EventModal
                    isOpen={showEventModal}
                    onClose={toggleEventModal}
                    event={null}
                    onUpdate={handleEventUpdate}
                />
            )}
        </main>
    );
}