import { StaticImageData } from 'next/image';


export const getAgeFromDateOfBirth = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const turkishMonths = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = turkishMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export const treatmentOptions = [
    'Diş Muayenesi',
    'Diş Dolgusu',
    'Kanal Tedavisi',
    'Diş Çekimi',
    'Diş İmplantı',
    'Diş Beyazlatma',
    'Ortodontik Tedavi (Diş Teli)',
    'Diş Eti Tedavisi',
    'Protez Diş',
    'Diş Kaplama',
    'Diş Taşı Temizliği',
    'Çocuk Diş Tedavisi',
    'Gülüş Tasarımı',
    'Ağız Cerrahisi',
    'Diş Hassasiyeti Tedavisi',
    'Bruksizm (Diş Gıcırdatma) Tedavisi',
    'Temporomandibular Eklem (TME) Tedavisi',
    'Diğer Diş Tedavileri'
];

export const PRESET_COLORS = [
    { name: 'Kırmızı', value: '#FF0000' },
    { name: 'Mavi', value: '#0000FF' },
    { name: 'Yeşil', value: '#015C55' },
    { name: 'Sarı', value: '#F6AE2D' },
    { name: 'Mor', value: '#800080' },
];

export interface MenuItem {
    name: string;
    path: string;
    icon: StaticImageData;
    whiteIcon: StaticImageData;
}
import ThisWeekIcon from '../../../public/icons/this_week_icon.svg';
import ThisWeekIconWhite from '../../../public/icons/this_week_icon_white.svg';
import CalendarIcon from '../../../public/icons/calendar_icon.svg';
import CalendarIconWhite from '../../../public/icons/calendar_icon_white.svg';
import AllPatientsIcon from '../../../public/icons/all_patients_icon.svg';
import AllPatientsIconWhite from '../../../public/icons/all_patients_icon_white.svg';
import XrayIcon from '../../../public/icons/xray_icon.svg';
import XrayIconWhite from '../../../public/icons/xray_icon_white.svg';

export const menuItems: MenuItem[] = [
    { name: 'Bu Hafta', path: '/dashboard', icon: ThisWeekIcon, whiteIcon: ThisWeekIconWhite },
    { name: 'Takvim', path: '/calendar', icon: CalendarIcon, whiteIcon: CalendarIconWhite },
    { name: 'Tüm Hastalar', path: '/patient-management', icon: AllPatientsIcon, whiteIcon: AllPatientsIconWhite },
    { name: 'Xray', path: '/xray-management', icon: XrayIcon, whiteIcon: XrayIconWhite }
];
