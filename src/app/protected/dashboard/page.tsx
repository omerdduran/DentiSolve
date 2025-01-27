'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Patient, Xray } from '@/shared/types';

// Dinamik importlar
const MyCalendarListView = dynamic(
  () => import("@/components/CalendarViews/CalendarListView"),
  {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded-lg" />,
    ssr: false
  }
);

const TreatmentDistributionChart = dynamic(
  () => import("@/components/Charts/TreatmentDistributionChart").then(mod => mod.TreatmentDistributionChart),
  {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded-lg" />
  }
);

const TabSection = dynamic(
  () => import("@/components/Dashboard/TabSection"),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-gray-200 rounded-lg" />
  }
);

// Optimize edilmiş veri yükleme fonksiyonları
const fetchPatients = async () => {
    const response = await fetch('/api/patients', {
        next: { revalidate: 60 } // 60 saniyelik cache
    });
    return response.json();
};

const fetchXrays = async () => {
    const response = await fetch('/api/xrays', {
        next: { revalidate: 60 }
    });
    return response.json();
};

const fetchApiData = async () => {
    try {
        const [patientsData, xraysData] = await Promise.all([
            fetchPatients(),
            fetchXrays()
        ]);
        return { patientsData, xraysData };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const Dashboard: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [xrays, setXrays] = useState<Xray[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('patients');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { patientsData, xraysData } = await fetchApiData();
            setPatients(patientsData);
            setXrays(xraysData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-200 rounded-lg" />}>
                    <TreatmentDistributionChart patients={patients} />
                </Suspense>
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