'use client';
import { IApiResponse, IUser } from '@/@types/user';
import { PaginationComponent } from '@/components/PaginationComponent';
import SearchInput from '@/components/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader, PlusIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import AddUserForm from './component/AddUserForm';

function UsersPage() {
    const queryClient = useQueryClient();

    const [users, setUsers] = useState<IUser[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

    if (error) return <div>An Error Occurred</div>;

    return (
        <div className="p-8">
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <h1 className="font-bold text-2xl">Users</h1>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="w-4 h-4" />
                        Add User
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
                <div className="p-6">
                    <div className="py-4">
                        <SearchInput placeholder="Search by name or email" onChange={handleSearchChange} />
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
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
                                {users?.map((user) => (
                                    <TableRow key={user.id}>
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
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationComponent totalPages={data?.pagination?.pages || 1} onPageChange={handlePageChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
