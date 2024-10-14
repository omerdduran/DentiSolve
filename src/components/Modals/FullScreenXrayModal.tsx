import React from 'react';
import Image from 'next/image';
import ModalWrapper from './ModalWrapper';

interface FullScreenXrayModalProps {
    isOpen: boolean;
    onClose: () => void;
    xRay: {
        imageUrl: string;
        datePerformed: string;
        findings: string;
        impression: string;
    } | null;
    formatDate: (date: string) => string;
}

const FullScreenXrayModal: React.FC<FullScreenXrayModalProps> = ({ isOpen, onClose, xRay, formatDate }) => {
    if (!xRay) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Röntgen Detayları</h2>
                <button
                    onClick={onClose}
                    className="text-2xl font-bold"
                >
                    &times;
                </button>
            </div>
            <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3 pr-4 relative" style={{ height: '500px' }}>
                    <Image
                        src={xRay.imageUrl}
                        alt="X-Ray"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                <div className="md:w-1/3 mt-4 md:mt-0">
                    <p><strong>Tarih:</strong> {formatDate(xRay.datePerformed)}</p>
                    <p className="mt-2"><strong>Bulgular:</strong></p>
                    <p>{xRay.findings}</p>
                    <p className="mt-2"><strong>İzlenim:</strong></p>
                    <p>{xRay.impression}</p>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default FullScreenXrayModal;