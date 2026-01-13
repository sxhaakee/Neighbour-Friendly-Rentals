import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg">
                <h1 className="text-9xl font-bold text-amber-500">404</h1>
                <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
                <p className="text-gray-600">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 transition-colors duration-200"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
