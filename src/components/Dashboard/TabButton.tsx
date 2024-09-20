import React from 'react';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, label }) => (
    <button
        className={`px-4 py-2 mr-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
        onClick={onClick}
    >
        {label}
    </button>
);

export default TabButton;
