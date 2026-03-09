import { redirect } from 'next/navigation';

// This page no longer exists — redirect to home
// The real admin panel is at a secret URL
export default function OldAdminPage() {
    redirect('/');
}
