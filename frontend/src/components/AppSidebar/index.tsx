'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@/components/ui/sidebar';
import adminRoutes from '@/config/adminRoutes';
import api from '@/lib/api';
import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AppSidebar({ userRole = 'super_admin' }: { userRole: string }) {
    const router = useRouter();
    const availableRoutes = adminRoutes[userRole as keyof typeof adminRoutes];

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            router.push('/login');
            router.refresh();
        } catch (error) {
            toast.error('Logout failed');
            console.error('Logout error:', error);
        }
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="px-1 py-2 font-bold text-2xl">Artist Studio</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {Object.entries(availableRoutes).map(([key, path]) => (
                        <Link key={key} href={path} className="block hover:bg-gray-100 px-4 py-2 capitalize">
                            {key.replace(/_/g, ' ')}
                        </Link>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <button
                    className="flex justify-start items-center gap-2 hover:bg-red-100 mb-1 px-4 py-2 rounded-md text-red-500"
                    onClick={handleLogout}>
                    <LogOutIcon size={16} />
                    Logout
                </button>
            </SidebarFooter>
        </Sidebar>
    );
}
