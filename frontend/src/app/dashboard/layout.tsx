'use client';

import { IUser } from '@/@types/user';
import { AppSidebar } from '@/components/AppSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Geist, Geist_Mono } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React from 'react';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const {
        data: user,
        isLoading,
        isError,
    } = useQuery<IUser>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await api.get('/auth/me');
            return response.data;
        },
    });

    const getInitials = (first_name: string, last_name: string) => {
        return first_name[0].toUpperCase() + last_name[0].toUpperCase();
    };

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

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;
    if (!user) return <div>User not found</div>;

    return (
        <main className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <SidebarProvider>
                <AppSidebar userRole={user.role} />
                <main className="w-full">
                    <header className="flex justify-between items-center px-4 py-2 min-h-12">
                        <SidebarTrigger />
                        <div className="flex items-center gap-4 hover:bg-neutral-100 mr-2 p-2 rounded-md">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-4 cursor-pointer">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>
                                                {user?.first_name && user?.last_name ? getInitials(user.first_name, user.last_name) : '...'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col pr-2">
                                            {user ? (
                                                <>
                                                    <p className="font-semibold">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                                </>
                                            ) : (
                                                <span className="flex flex-col gap-1">
                                                    <Skeleton className="w-24 h-4" />
                                                    <Skeleton className="w-24 h-4" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    {children}
                </main>
            </SidebarProvider>
        </main>
    );
};

export default AdminLayout;
