'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { menuItems } from "@/shared/utils";

const BottomNav = () => {
    const router = useRouter();
    const [activeItem, setActiveItem] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = (path: string, name: string) => {
        router.push(path);
        setActiveItem(name);
    };

    return (
        <>
            <div className="h-16 lg:hidden" /> {/* Spacer to prevent content from being hidden behind the nav */}
            <footer className={`fixed bottom-0 left-0 right-0 transition-all duration-300 lg:hidden z-50
                ${isScrolled
                ? 'bg-white dark:bg-gray-900 shadow-md'
                : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="max-w-screen-xl mx-auto px-4">
                    <nav className="flex justify-around items-center py-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleClick(item.path, item.name)}
                                className={`p-2 rounded-full transition-all duration-200 ${
                                    activeItem === item.name
                                        ? 'bg-blue-100 dark:bg-blue-900'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                aria-label={item.name}
                            >
                                <Image
                                    src={item.icon}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                    className={`transition duration-75 ${
                                        activeItem === item.name
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            </button>
                        ))}
                    </nav>
                </div>
            </footer>
        </>
    );
};

export default BottomNav;