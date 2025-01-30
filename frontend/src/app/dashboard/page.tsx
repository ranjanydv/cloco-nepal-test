'use client';

import { buttonVariants } from '@/components/ui/button';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IUser, UserRole } from '@/@types/user';
import { Card } from '@/components/ui/card';

export default function Dashboard() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['dashboardData'],
        queryFn: async () => {
            const response = await api.get('/dashboard/data');
            return response.data;
        },
        retry: false,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const user: IUser = data?.user;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="mb-2 font-bold text-3xl">Welcome, {user.first_name}!</h1>
                <p className="text-muted-foreground">{getRoleGreeting(user.role)}</p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Common Cards for all users */}
                <Card className="p-6">
                    <h2 className="mb-4 font-semibold text-xl">Profile Overview</h2>
                    <div className="space-y-2">
                        <p>
                            Name: {user.first_name} {user.last_name}
                        </p>
                        <p>Email: {user.email}</p>
                        <p>Role: {formatRole(user.role)}</p>
                    </div>
                </Card>

                {/* Role-specific cards */}
                {getRoleSpecificCards(user.role)}
            </div>
        </div>
    );
}

function getRoleGreeting(role: UserRole): string {
    switch (role) {
        case UserRole.SUPER_ADMIN:
            return 'Manage your platform and oversee all operations';
        case UserRole.ARTIST_MANAGER:
            return 'Manage your artists and their content';
        case UserRole.ARTIST:
            return 'Manage your music and profile';
        default:
            return 'Welcome to your dashboard';
    }
}

function formatRole(role: UserRole): string {
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getRoleSpecificCards(role: UserRole) {
    switch (role) {
        case UserRole.SUPER_ADMIN:
            return (
                <>
                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-xl">Platform Stats</h2>
                        <Link href="/dashboard/users" className={buttonVariants({ variant: 'secondary' })}>
                            Manage Users
                        </Link>
                    </Card>
                </>
            );

        case UserRole.ARTIST_MANAGER:
            return (
                <>
                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-xl">Artist Management</h2>
                        <div className="space-y-4">
                            <Link href="/dashboard/artist/add" className={buttonVariants({ variant: 'secondary' })}>
                                Add New Artist
                            </Link>
                        </div>
                    </Card>
                </>
            );

        case UserRole.ARTIST:
            return (
                <>
                    <Card className="p-6">
                        <h2 className="mb-4 font-semibold text-xl">Music Management</h2>
                        <div className="space-y-4">
                            <Link href="/dashboard/music" className={buttonVariants({ variant: 'secondary' })}>
                                Manage Music
                            </Link>
                        </div>
                    </Card>
                </>
            );

        default:
            return null;
    }
}
