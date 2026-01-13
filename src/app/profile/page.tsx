import { Metadata } from 'next';
import ProfileClient from './client';

export const metadata: Metadata = {
    title: 'My Profile | NeighbourFriendly Rentals',
    description: 'Manage your profile, view account status, and settings.',
};

export default function ProfilePage() {
    return <ProfileClient />;
}
