import React from 'react';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, label }) => (
    <button
        className={`
            px-4 py-2 mr-2 rounded-md font-medium transition-all duration-200
            ${isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            disabled:pointer-events-none disabled:opacity-50
        `}
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
        tabIndex={0}
    >
        {label}
    </button>
);

export default TabButton;
