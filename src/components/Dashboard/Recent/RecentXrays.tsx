import React from 'react';
import {RecentXraysProps} from '@/shared/types';

export const RecentXrays: React.FC<RecentXraysProps> = ({ xrays }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Son Eklenen X-rayler</h2>
            <table className="w-full">
                <thead>
                <tr>
                    <th className="text-left">Ad Soyad</th>
                    <th className="text-left">Röntgen Tarihi</th>
                    <th className="text-left">Bulgular</th>
                    <th className="text-left">İzlenim</th>
                </tr>
                </thead>
                <tbody>
                {xrays
                    .sort((a, b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime())
                    .slice(0, 5)
                    .map((xray) => (
                        <tr key={xray.id}>
                            <td>{`${xray.patient.firstName} ${xray.patient.lastName}`}</td>
                            <td>{new Date(xray.datePerformed).toLocaleDateString()}</td>
                            <td>{xray.findings}</td>
                            <td>{xray.impression}</td>
                        </tr>
                    ))}
                </tbody>


            </table>
        </div>
    );
};