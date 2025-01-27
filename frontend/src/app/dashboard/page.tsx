'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

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

    return (
        <div className="p-6">
            <h1 className="mb-4 font-bold text-2xl">Dashboard</h1>
            <p>{data?.message}</p>
            <pre>{JSON.stringify(data?.user, null, 2)}</pre>
            <Link className={buttonVariants({ variant: 'outline' })} href="/dashboard/users">
                Click me
            </Link>
        </div>
    );
}
