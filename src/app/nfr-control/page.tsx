import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AdminClient = dynamic(() => import('./client'), { ssr: false });

// No admin keywords in metadata — keep it invisible to search engines
export const metadata: Metadata = {
    title: 'Control Panel | NFR',
    description: 'Internal management dashboard.',
    robots: 'noindex, nofollow', // Prevent search engines from indexing
};

export default function SecretAdminPage() {
    return <AdminClient />;
}
