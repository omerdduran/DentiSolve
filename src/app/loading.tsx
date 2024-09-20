import React from 'react';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Yükleniyor...</p>
                <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin</p>
            </div>
        </div>
    );
}