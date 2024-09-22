import React, { useEffect, useRef } from 'react';

interface ModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ isOpen, onClose, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;