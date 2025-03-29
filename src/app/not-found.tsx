import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8 bg-card rounded-lg border border-border max-w-md w-full mx-4 shadow-lg">
                <h2 className="text-4xl font-bold text-foreground mb-4">Sayfa Bulunamadı</h2>
                <p className="text-xl text-muted-foreground mb-8">İstenen kaynak bulunamadı</p>
                <Button asChild>
                    <Link href="/protected/dashboard">
                        Ana Sayfaya Dön
                    </Link>
                </Button>
            </div>
        </div>
    )
}