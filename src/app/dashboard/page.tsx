'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Patient, Xray } from '@/shared/types';
import MyCalendarListView from "@/components/CalendarViews/CalendarListView";
import {TreatmentDistributionChart} from "@/components/Charts/TreatmentDistributionChart";
import TabSection from "@/components/Dashboard/TabSection";

// TODO: Add Customization

const fetchApiData = async () => {
    const [patientsResponse, xraysResponse] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/xrays')
    ]);
    const patientsData = await patientsResponse.json();
    const xraysData = await xraysResponse.json();
    return { patientsData, xraysData };
};

const Dashboard: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [xrays, setXrays] = useState<Xray[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('patients');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
        } else {
            loadData();
        }
    }, [isAuthenticated, router]);

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

    if (!isAuthenticated || loading) {
        return null;
    }

    const recentPatients = patients.slice(-5).reverse();
    const recentXrays = xrays.slice(-5).reverse();

    return (
        <div className="p-6
        min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <MyCalendarListView />
                <TreatmentDistributionChart patients={patients} />
            </div>
            <TabSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                recentPatients={recentPatients}
                recentXrays={recentXrays}
            />
        </div>
    );
};

export default Dashboard;
