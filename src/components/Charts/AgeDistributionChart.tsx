import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Patient } from '@/shared/types';
import { getAgeFromDateOfBirth } from '@/shared/utils';

interface AgeDistributionChartProps {
    patients: Patient[];
}

export const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ patients }) => {
    const ageData = patients.reduce<Record<number, number>>((acc, patient) => {
        const age = getAgeFromDateOfBirth(patient.dateOfBirth);
        const ageGroup = Math.floor(age / 10) * 10;
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(ageData).map(([ageGroup, count]) => ({
        ageGroup: `${ageGroup}-${parseInt(ageGroup) + 9}`,
        count
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Age Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};