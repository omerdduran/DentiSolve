import React, { useState } from 'react';
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
    const [imageError, setImageError] = useState(false);
    
    if (!xRay) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 bg-white/10">
                    <h2 className="text-2xl font-bold text-white">Röntgen Detayları</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 text-2xl font-bold p-2"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex flex-col md:flex-row flex-1 p-4 overflow-auto">
                    <div className="md:w-3/4 relative flex-1 min-h-[60vh] md:min-h-[80vh]">
                        <Image
                            src={imageError ? '/images/placeholder-xray.webp' : (xRay.imageUrl || '/images/placeholder-xray.webp')}
                            alt="Full Screen X-ray"
                            fill
                            className="object-contain bg-black"
                            sizes="(max-width: 768px) 100vw, 75vw"
                            quality={100}
                            priority
                            onError={() => setImageError(true)}
                        />
                    </div>
                    <div className="md:w-1/4 mt-4 md:mt-0 md:ml-4 bg-white/10 p-4 rounded-lg text-white space-y-4 overflow-y-auto">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Tarih</h3>
                            <p>{formatDate(xRay.datePerformed)}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Bulgular</h3>
                            <p className="whitespace-pre-wrap">{xRay.findings}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">İzlenim</h3>
                            <p className="whitespace-pre-wrap">{xRay.impression}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default FullScreenXrayModal;