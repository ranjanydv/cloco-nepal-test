'use client';
import { IUser } from '@/@types/user';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader, PenIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useState } from 'react';
import AddUserForm from './component/AddUserForm';
import EditUserForm from './component/EditUserForm';

import { IApiResponse } from '@/@types';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const SearchInput = dynamic(() => import('@/components/SearchInput'), { ssr: false });
const PaginationComponent = dynamic(() => import('@/components/PaginationComponent'), { ssr: false });

function UsersPage() {
    const queryClient = useQueryClient();

    const [users, setUsers] = useState<IUser[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<IApiResponse<IUser>>({
        queryKey: ['users', debouncedSearch, page],
        queryFn: async () => {
            const response = await api.get('/user', {
                params: {
                    ...(debouncedSearch && { search: debouncedSearch }),
                    page,
                },
            });
            setUsers(response.data.data);
            return response.data;
        },
    });

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        // setPage(1);
    }, []);

    const { mutate: deleteUserMutation } = useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.delete(`/user/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
            toast.success('User deleted successfully');
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to delete user';
            toast.error(errorMessage);
        },
    });

    const handleDeleteUser = () => {
        if (!selectedUser) return;
        deleteUserMutation(selectedUser.id);
    };

    if (error) return <div>An Error Occurred</div>;

    return (
        <div className="p-8">
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <h1 className="font-bold text-2xl">Artists</h1>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="w-4 h-4" />
                        Add Artist
                    </Button>
                    {isCreateDialogOpen && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add User</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>Add a new user to the system.</DialogDescription>
                                <AddUserForm
                                    onSuccess={() => {
                                        queryClient.invalidateQueries({ queryKey: ['users'] });
                                        setIsCreateDialogOpen(false);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Admin Users Section */}
                <div className="">
                    <div className="py-4">
                        <SearchInput placeholder="Search by name or email" onChange={handleSearchChange} />
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SN</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            {isLoading && (
                                <TableBody>
                                    <TableRow key="loading">
                                        <TableCell colSpan={4} className="flex justify-center items-center w-full min-h-[100px] text-center">
                                            <div className="mx-auto">
                                                <Loader className="w-6 h-6 animate-spin" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                            <TableBody>
                                {users?.map((user, idx) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{page * 10 - 9 + idx}</TableCell>
                                        <TableCell>
                                            {user.first_name} {user.last_name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'} className="font-normal">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    // className="bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-100 ease-in"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditDialogOpen(true);
                                                        queryClient.invalidateQueries({ queryKey: ['users'] });
                                                    }}>
                                                    <PenIcon size={14} />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-100 ease-in"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}>
                                                    <Trash2Icon size={14} /> Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationComponent totalPages={data?.pagination?.pages || 1} onPageChange={handlePageChange} />
                    </div>
                </div>
            </div>

            {selectedUser && (
                <>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <EditUserForm
                                user={selectedUser}
                                onSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ['users'] });
                                    setIsEditDialogOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account and remove their data from our
                                    servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}

export default UsersPage;
