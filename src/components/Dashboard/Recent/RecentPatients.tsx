import React from 'react';
import { Patient } from '@/shared/types';
import { getAgeFromDateOfBirth } from '@/shared/utils';

interface RecentPatientsProps {
    patients: Patient[];
}

export const RecentPatients: React.FC<RecentPatientsProps> = ({ patients }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Son Eklenen Hastalar</h2>
            <table className="w-full">
                <thead>
                <tr>
                    <th className="text-left">Ad Soyad</th>
                    <th className="text-left">Yaş</th>
                    <th className="text-left">Güncel Tedavi</th>
                </tr>
                </thead>
                <tbody>
                {patients.map((patient) => (
                    <tr key={patient.id}>
                        <td>{`${patient.firstName} ${patient.lastName}`}</td>
                        <td>{getAgeFromDateOfBirth(patient.dateOfBirth)}</td>
                        <td>{patient.currentTreatment}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};