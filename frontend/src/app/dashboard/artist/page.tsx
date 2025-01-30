'use client';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader, PenIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useState } from 'react';
import AddArtistForm from './component/AddArtistForm';

import { IApiResponse } from '@/@types';
import { IArtist } from '@/@types/artist';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import EditArtistForm from './component/EditArtistForm';
import Link from 'next/link';

const SearchInput = dynamic(() => import('@/components/SearchInput'), { ssr: false });
const PaginationComponent = dynamic(() => import('@/components/PaginationComponent'), { ssr: false });

function ArtistsPage() {
    const queryClient = useQueryClient();

    const [artists, setArtists] = useState<IArtist[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<IArtist | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<IApiResponse<IArtist>>({
        queryKey: ['artists', debouncedSearch, page],
        queryFn: async () => {
            let url = '/artist';
            if (useAuthStore.getState().user?.role === 'artist_manager') {
                url = '/artist/manager';
            }
            const response = await api.get(url, {
                params: {
                    ...(debouncedSearch && { search: debouncedSearch }),
                    page,
                },
            });
            setArtists(response.data.data);
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

    const { mutate: deleteArtistMutation } = useMutation({
        mutationFn: async (artistId: string) => {
            const response = await api.delete(`/artist/${artistId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artists'] });
            setIsDeleteDialogOpen(false);
            setSelectedArtist(null);
            toast.success('Artist deleted successfully');
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to delete user';
            toast.error(errorMessage);
        },
    });

    const handleDeleteArtist = () => {
        if (!selectedArtist) return;
        deleteArtistMutation(selectedArtist.id);
    };

    if (error) return <div>An Error Occurred</div>;

    const getGender = (gender: string) => {
        if (gender === 'm') return 'Male';
        if (gender === 'f') return 'Female';
        return 'Other';
    };

    return (
        <div className="p-8">
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <h1 className="font-bold text-2xl">Artists</h1>
                    {useAuthStore.getState().user?.role === 'artist_manager' && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <PlusIcon className="w-4 h-4" />
                            Add Artist
                        </Button>
                    )}
                    {isCreateDialogOpen && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Artist</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>Add a new artist to the system.</DialogDescription>
                                <AddArtistForm
                                    onSuccess={() => {
                                        queryClient.invalidateQueries({ queryKey: ['artists'] });
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
                                    <TableHead>DOB</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>First Release Year</TableHead>
                                    <TableHead>No of Albums Released</TableHead>
                                    <TableHead>Manager</TableHead>
                                    {useAuthStore.getState().user?.role === 'artist_manager' && <TableHead>Actions</TableHead>}
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
                                {artists?.map((artist, idx) => (
                                    <TableRow key={artist.id}>
                                        <TableCell>{page * 10 - 9 + idx}</TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/artist/${artist.id}`}>{artist.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(artist.dob).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>{getGender(artist.gender)}</TableCell>
                                        <TableCell>{artist.address}</TableCell>
                                        <TableCell>{artist.first_release_year}</TableCell>
                                        <TableCell>{artist.no_of_albums_released}</TableCell>
                                        <TableCell>
                                            {artist.manager.first_name} {artist.manager.last_name}
                                        </TableCell>
                                        {useAuthStore.getState().user?.role === 'artist_manager' && (
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedArtist(artist);
                                                            setIsEditDialogOpen(true);
                                                            queryClient.invalidateQueries({ queryKey: ['artists'] });
                                                        }}>
                                                        <PenIcon size={14} />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        className="bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-100 ease-in"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedArtist(artist);
                                                            setIsDeleteDialogOpen(true);
                                                        }}>
                                                        <Trash2Icon size={14} /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationComponent totalPages={data?.pagination?.pages || 1} onPageChange={handlePageChange} />
                    </div>
                </div>
            </div>

            {selectedArtist && (
                <>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Artist</DialogTitle>
                            </DialogHeader>
                            <EditArtistForm
                                artist={selectedArtist}
                                onSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ['artists'] });
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
                                    This action cannot be undone. This will permanently delete the artist account and remove their data from our
                                    servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteArtist}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}

export default ArtistsPage;
