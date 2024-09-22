'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { menuItems } from "@/shared/utils";

const Sidebar = () => {
    const router = useRouter();
    const [activeItem, setActiveItem] = useState('');

    const handleClick = (path: string, name: string) => {
        router.push(path);
        setActiveItem(name);
    };

    return (
        <aside
            id="default-sidebar"
            className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg"
            aria-label="Sidebar"
        >
            <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
                <div className="mb-8 p-4 px-0 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-raleway bg-clip-text text-black tracking-wide">
                        Ilhan Clinic
                    </h1>
                </div>
                <ul className="space-y-2 flex-grow">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <button
                                onClick={() => handleClick(item.path, item.name)}
                                className={`flex items-center w-full p-3 text-gray-600 dark:text-gray-300 rounded-lg group transition-all duration-200 ${
                                    activeItem === item.name
                                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 shadow-md'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm'
                                }`}
                            >
                                <Image
                                    src={item.icon}
                                    alt={item.name}
                                    className={`w-5 h-5 transition duration-75 ${
                                        activeItem === item.name
                                            ? 'text-blue-600 dark:text-blue-400 transform scale-110'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                />
                                <span className={`ms-3 ${
                                    activeItem === item.name
                                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                                        : ''
                                }`}>
                                    {item.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handleClick('/backup-management', 'Backup Management')}
                        className="flex items-center w-full p-3 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span className="ms-3">Settings</span>
                    </button>
                    <button
                        onClick={() => handleClick('/profile', 'Profile')}
                        className="flex items-center w-full p-3 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span className="ms-3">Profile</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;