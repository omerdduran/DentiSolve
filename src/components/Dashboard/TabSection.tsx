import React from 'react';
import { Patient, Xray } from '@/shared/types';
import {RecentPatients} from "@/components/Dashboard/Recent/RecentPatients";
import {RecentXrays} from "@/components/Dashboard/Recent/RecentXrays";
import TabButton from "@/components/Dashboard/TabButton";

interface TabSectionProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    recentPatients: Patient[];
    recentXrays: Xray[];
}

const TabSection: React.FC<TabSectionProps> = ({ activeTab, setActiveTab, recentPatients, recentXrays }) => (
    <div className="mb-6">
        <div className="flex mb-4">
            <TabButton
                isActive={activeTab === 'patients'}
                onClick={() => setActiveTab('patients')}
                label="Son Hastalar"
            />
            <TabButton
                isActive={activeTab === 'xrays'}
                onClick={() => setActiveTab('xrays')}
                label="Son Röntgenler"
            />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
            {activeTab === 'patients' ? (
                <RecentPatients patients={recentPatients} />
            ) : (
                <RecentXrays xrays={recentXrays} />
            )}
        </div>
    </div>
);

export default TabSection;
