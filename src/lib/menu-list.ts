import {
  Tag,
  Users,
  Settings,
  DatabaseBackup,
  LayoutGrid,
  Calendar,
  Hospital,
  LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/protected/dashboard",
          label: "Bu Hafta",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/protected/patient-management",
          label: "Hasta Yönetimi",
          icon: Hospital,
        },
        {
          href: "/protected/calendar",
          label: "Takvim",
          icon: Calendar
        },
        {
          href: "/protected/xray-management",
          label: "Röntgen Kayıtları",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Ayarlar",
      menus: [
        {
          href: "/protected/users",
          label: "Kullanıcılar",
          icon: Users
        },
        {
          href: "/protected/profile",
          label: "Ayarlar",
          icon: Settings
        },
        {
          href: "/protected/backup-management",
          label: "Yedek Yönetimi",
          icon: DatabaseBackup
        }
      ]
    }
  ];
}
