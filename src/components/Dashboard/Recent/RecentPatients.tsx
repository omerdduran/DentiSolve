import React from 'react';
import { Patient } from '@/lib/types';
import { getAgeFromDateOfBirth } from '@/lib/utils';

interface RecentPatientsProps {
    patients: Patient[];
}

export const RecentPatients: React.FC<RecentPatientsProps> = ({ patients }) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Son Eklenen Hastalar
            </h2>
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Ad Soyad
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Yaş
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Güncel Tedavi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                className="border-b transition-colors hover:bg-muted/50"
                            >
                                <td className="p-4 align-middle">
                                    {`${patient.firstName} ${patient.lastName}`}
                                </td>
                                <td className="p-4 align-middle">
                                    {getAgeFromDateOfBirth(patient.dateOfBirth)}
                                </td>
                                <td className="p-4 align-middle">
                                    {patient.currentTreatment || 'Tedavi yok'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};