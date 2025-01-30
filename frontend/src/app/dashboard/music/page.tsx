'use client';

import { IApiResponse } from '@/@types';
import { EMusicGenre, IMusic } from '@/@types/music';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { musicFormSchema, MusicFormValues } from '@/schemas/music';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function MusicPage() {
    const { user, artist } = useAuthStore((state) => state);
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery<IApiResponse<IMusic>>({
        queryKey: ['music'],
        queryFn: async () => {
            let ApiUrl = '/music';
            if (user?.role === 'artist') {
                ApiUrl = `/music/byArtist/${artist?.id}`;
            }
            const response = await api.get(ApiUrl);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
    const [open, setOpen] = useState<boolean>(false);
    const [editingMusic, setEditingMusic] = useState<IMusic | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<MusicFormValues>({
        resolver: zodResolver(musicFormSchema),
        defaultValues: {
            title: '',
            genre: EMusicGenre.MB,
            album_name: '',
        },
    });

    const { mutate: createOrEditMutation, isPending: isSubmitting } = useMutation({
        mutationFn: async (formData: Partial<IMusic> & MusicFormValues) => {
            if (editingMusic) {
                return api.patch(`/music/${editingMusic.id}`, formData);
            }
            return api.post('/music', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['music'] });
            setOpen(false);
            reset();
            setEditingMusic(null);
            toast.success(editingMusic ? 'Music updated successfully' : 'Music created successfully');
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to save music';
            toast.error(errorMessage);
        },
    });

    const { mutate: deleteMusicMutation } = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/music/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['music'] });
            toast.success('Music deleted successfully');
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to delete music';
            toast.error(errorMessage);
        },
    });

    const handleEdit = (music: IMusic) => {
        setEditingMusic(music);
        setValue('title', music.title);
        setValue('genre', music.genre);
        setValue('album_name', music.album_name);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        deleteMusicMutation(id);
    };

    const onSubmit = (data: MusicFormValues) => {
        const formData = {
            ...data,
            ...(editingMusic && { id: editingMusic.id }),
        };
        createOrEditMutation(formData);
    };

    const musicData = data?.data || [];

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error fetching music</p>;

    return (
        <div className="mx-auto p-6 container">
            <div className="flex justify-between items-center">
                <h1 className="font-semibold text-3xl">Music</h1>
                {user?.role === 'artist' && (
                    <Button
                        onClick={() => {
                            setEditingMusic(null);
                            reset();
                            setOpen(true);
                        }}>
                        Add Music
                    </Button>
                )}
            </div>
            <Card className="mt-6">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead>Album</TableHead>
                                <TableHead>Artist</TableHead>
                                {user?.role === 'artist' && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {musicData.map((music) => (
                                <TableRow key={music.id}>
                                    <TableCell>{music.title}</TableCell>
                                    <TableCell>{music.genre}</TableCell>
                                    <TableCell>{music.album_name}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/artist/${music.artist.id}`}>{music.artist.name}</Link>
                                    </TableCell>
                                    {user?.role === 'artist' && (
                                        <TableCell className="flex items-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(music)}>
                                                <PencilIcon />
                                                Edit
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2Icon />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription className="space-y-3">
                                                            <p>This will permanently delete '{music.title}' from your library.</p>
                                                            <small className="text-rose-500 text-xs">This action cannot be undone.</small>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(music.id)}
                                                            className="bg-rose-500 hover:bg-red-600">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMusic ? 'Edit Music' : 'Add Music'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <Input {...register('title')} />
                            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
                        </div>
                        <div>
                            <Label>Genre</Label>
                            <Select
                                onValueChange={(value) => setValue('genre', value as EMusicGenre)}
                                defaultValue={editingMusic?.genre || EMusicGenre.MB}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a genre" />
                                    <SelectContent>
                                        {Object.values(EMusicGenre).map((genre) => (
                                            <SelectItem key={genre} value={genre} className="capitalize">
                                                {genre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectTrigger>
                            </Select>
                            {errors.genre && <span className="text-red-500 text-sm">{errors.genre.message}</span>}
                        </div>
                        <div>
                            <Label>Album</Label>
                            <Input {...register('album_name')} aria-label="Album Name" />
                            {errors.album_name && <span className="text-red-500 text-sm">{errors.album_name.message}</span>}
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {editingMusic ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
