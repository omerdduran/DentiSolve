'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {menuItems} from "@/shared/utils";

const BottomNav = () => {
    const router = useRouter();

    const handleClick = (path: string) => {
        router.push(path);
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg lg:hidden flex justify-around items-center py-2 z-50">
            {menuItems.map((item) => (
                <button key={item.name} onClick={() => handleClick(item.path)} className="text-gray-600 hover:text-gray-900">
                    <Image src={item.icon} alt={item.name} width={24} height={24} />
                </button>
            ))}
        </footer>
    );
};

export default BottomNav;