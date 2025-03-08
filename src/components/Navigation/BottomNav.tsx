"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { LogOut, MoreHorizontal, ChevronRight, Dot } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "../../../context/AuthContext";

interface NavMenuItem {
    href: string;
    label: string;
    icon?: React.ComponentType<{ size?: number | string }>;
    submenus?: NavMenuItem[];
}

interface MenuGroup {
    menus: NavMenuItem[];
}

const MobileBottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const menuList = getMenuList(pathname);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                localStorage.removeItem('token');
                logout();
                router.push('/login');
            } else {
                console.error('Logout failed:', response.status);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const flatMenu: NavMenuItem[] = menuList.reduce<NavMenuItem[]>((acc, group: MenuGroup) => {
        return acc.concat(group.menus);
    }, []);

    const visibleItems = flatMenu.slice(0, 4);
    const moreItems = flatMenu.slice(4);

    const isActive = (item: NavMenuItem) => {
        if (item.submenus && item.submenus.length > 0) {
            return item.submenus.some(submenu => pathname.startsWith(submenu.href));
        }
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    const renderMenuItem = (item: NavMenuItem, isInMoreMenu = false) => {
        if (!item) {
            console.error('Invalid menu item:', item);
            return null;
        }

        const Icon = item.icon || Dot;
        const active = isActive(item);

        if (item.submenus && item.submenus.length > 0) {
            return (
                <Popover key={item.href} open={openPopover === item.href} onOpenChange={(isOpen) => setOpenPopover(isOpen ? item.href : null)}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                isInMoreMenu ? "w-full justify-between h-10 px-4" : "flex-col h-full rounded-none px-1",
                                active ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" : "text-muted-foreground"
                            )}
                        >
                            {isInMoreMenu ? (
                                <>
                                    <span className="flex items-center">
                                        <Icon size={18} className="mr-2" />
                                        {item.label}
                                    </span>
                                    <ChevronRight size={16} />
                                </>
                            ) : (
                                <>
                                    <Icon size={20} />
                                    <span className="text-xs mt-1">{item.label}</span>
                                </>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-screen max-w-[200px] p-0"
                        side={isInMoreMenu ? "right" : "top"}
                        align={isInMoreMenu ? "start" : "center"}
                    >
                        {item.submenus.map((submenu) => {
                            if (!submenu) {
                                console.error('Invalid submenu item:', submenu);
                                return null;
                            }
                            const SubIcon = submenu.icon || Dot;
                            const submenuActive = pathname === submenu.href || pathname.startsWith(submenu.href + '/');
                            return (
                                <Button
                                    key={submenu.href}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start h-10 px-4",
                                        submenuActive ? "text-primary bg-secondary/50" : "text-muted-foreground "
                                    )}
                                    asChild
                                    onClick={() => setOpenPopover(null)}
                                >
                                    <Link href={submenu.href}>
                                        <SubIcon size={18} className="mr-2" />
                                        <span>{submenu.label}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </PopoverContent>
                </Popover>
            );
        }

        return (
            <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                    isInMoreMenu ? "w-full justify-start h-10 px-4" : "flex-col h-full rounded-none px-1",
                    active ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-primary",
                )}
                asChild
            >
                <Link href={item.href}>
                    {isInMoreMenu ? (
                        <>
                            <Icon size={18} className="mr-2" />
                            <span>{item.label}</span>
                        </>
                    ) : (
                        <>
                            <Icon size={20} />
                            <span className="text-xs mt-1">{item.label}</span>
                        </>
                    )}
                </Link>
            </Button>
        );
    };

    return (
        <>
            <div className="h-16 lg:hidden" />
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:hidden z-50">
                <div className="flex justify-between items-center h-16 px-2 max-w-(--breakpoint-xl) mx-auto">
                    {visibleItems.map((item) => renderMenuItem(item))}

                    <Popover open={openPopover === 'more'} onOpenChange={(isOpen) => setOpenPopover(isOpen ? 'more' : null)}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-col h-full rounded-none px-1 text-muted-foreground">
                                <MoreHorizontal size={20} />
                                <span className="text-xs mt-1 text-muted-foreground hover:text-primary">Daha Fazla</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-screen max-w-[200px] p-0" side="top" align="end">
                            {moreItems.map((item) => renderMenuItem(item, true))}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start h-10 px-4 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                    setOpenPopover(null);
                                    handleLogout();
                                }}
                                disabled={isLoggingOut}
                            >
                                <LogOut size={18} className="mr-2" />
                                <span>{isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}</span>
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
        </>
    );
};

export default MobileBottomNav;