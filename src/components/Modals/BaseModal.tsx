import React from 'react';
import ModalWrapper from './ModalWrapper';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {children}
        </ModalWrapper>
    );
};

export default BaseModal;