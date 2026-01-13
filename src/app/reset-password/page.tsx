import { Metadata } from 'next';
import ResetPasswordClient from './client';

export const metadata: Metadata = {
    title: 'Reset Password | NeighbourFriendly Rentals',
    description: 'Reset your account password securely.',
};

export default function ResetPasswordPage() {
    return <ResetPasswordClient />;
}
