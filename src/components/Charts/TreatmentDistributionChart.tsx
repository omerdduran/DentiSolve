// TreatmentDistributionChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Patient } from '@/shared/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TreatmentDistributionChartProps {
    patients: Patient[];
}

export const TreatmentDistributionChart: React.FC<TreatmentDistributionChartProps> = ({ patients }) => {
    const treatmentData = patients.reduce<Record<string, number>>((acc, patient) => {
        acc[patient.currentTreatment] = (acc[patient.currentTreatment] || 0) + 1;
        return acc;
    }, {});

    const pieChartData = Object.entries(treatmentData).map(([name, value]) => ({ name, value }));

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Güncel Tedaviler</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};