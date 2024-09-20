'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {menuItems} from "@/shared/utils";

const Sidebar = () => {
    const router = useRouter();

    const handleClick = (path: string) => {
        router.push(path);
    };

    return (
        <aside
            id="default-sidebar"
            className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0 bg-ilhanblue dark:bg-ilhanblue"
            aria-label="Sidebar"
        >
            <div className="h-full px-3 py-4 overflow-y-auto">
                <ul className="space-y-2 font-medium">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <button
                                onClick={() => handleClick(item.path)}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            >
                                <Image
                                    src={item.whiteIcon}
                                    alt={item.name}
                                    className="w-5 h-5 transition duration-75 dark:group-hover:text-white"
                                />
                                <span className="ms-3">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;