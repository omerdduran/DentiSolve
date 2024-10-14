import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8  rounded-xl max-w-md w-full mx-4">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h2>
                <p className="text-xl text-gray-600 mb-8">İstenen kaynak bulunamadı</p>
                <Link href="/protected/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    )
}