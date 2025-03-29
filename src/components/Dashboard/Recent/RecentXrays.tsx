import React from 'react';
import { RecentXraysProps } from '@/lib/types';

export const RecentXrays: React.FC<RecentXraysProps> = ({ xrays }) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Son Eklenen X-rayler
            </h2>
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Ad Soyad
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Röntgen Tarihi
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Bulgular
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                İzlenim
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {xrays
                            .sort((a, b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime())
                            .slice(0, 5)
                            .map((xray) => (
                                <tr
                                    key={xray.id}
                                    className="border-b transition-colors hover:bg-muted/50"
                                >
                                    <td className="p-4 align-middle">
                                        {`${xray.patient.firstName} ${xray.patient.lastName}`}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {new Date(xray.datePerformed).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {xray.findings || 'Bulgu yok'}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {xray.impression || 'İzlenim yok'}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};