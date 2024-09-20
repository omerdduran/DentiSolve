'use client';

import Image from "next/image";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {

    // TODO: DentiSolve Logo ekle
    return (
        <div className="flex flex-col items-center min-h-screen bg-ilhanblue">
            <Image
                src="/Ilhan-Clinic.png"
                alt="Dentisolve Logo"
                width={250}
                height={80}
                className="pt-8 sm:pt-16 md:pt-24 lg:pt-32"
            />
            <LoginScreen></LoginScreen>
        </div>
    );
}