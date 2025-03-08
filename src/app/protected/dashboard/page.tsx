'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Patient, Xray } from '@/shared/types';
import { usePatients, useXrays } from '@/hooks/use-query-hooks';

// Dinamik importlar
const MyCalendarListView = dynamic(
  () => import("@/components/CalendarViews/CalendarListView"),
  {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded-lg" />,
    ssr: false
  }
);

// Güncel tedaviler grafiği şimdilik devre dışı
/*
const TreatmentDistributionChart = dynamic(
  () => import("@/components/Charts/TreatmentDistributionChart").then(mod => mod.TreatmentDistributionChart),
  {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded-lg" />
  }
);
*/

const TabSection = dynamic(
  () => import("@/components/Dashboard/TabSection"),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-gray-200 rounded-lg" />
  }
);

const Dashboard: React.FC = () => {
    const { data: patients = [], isLoading: patientsLoading } = usePatients();
    const { data: xrays = [], isLoading: xraysLoading } = useXrays();
    const [activeTab, setActiveTab] = useState('patients');

    const loading = patientsLoading || xraysLoading;

    if (loading) {
        return (
            <div className="p-6 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="h-[300px] animate-pulse bg-gray-200 rounded-lg" />
                    <div className="h-[300px] animate-pulse bg-gray-200 rounded-lg" />
                </div>
                <div className="h-[200px] animate-pulse bg-gray-200 rounded-lg" />
            </div>
        );
    }

    const recentPatients = patients.slice(-5).reverse();
    const recentXrays = xrays.slice(-5).reverse();

    return (
        <div className="p-6 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-200 rounded-lg" />}>
                    <MyCalendarListView />
                </Suspense>
                {/* Güncel tedaviler grafiği şimdilik devre dışı
                <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-200 rounded-lg" />}>
                    <TreatmentDistributionChart patients={patients} />
                </Suspense>
                */}
            </div>
            <Suspense fallback={<div className="h-[200px] animate-pulse bg-gray-200 rounded-lg" />}>
                <TabSection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    recentPatients={recentPatients}
                    recentXrays={recentXrays}
                />
            </Suspense>
        </div>
    );
};

export default Dashboard;