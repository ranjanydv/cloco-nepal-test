'use client';

import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, MapPinIcon, UserIcon, DiscIcon, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { IArtist } from '@/@types/artist';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { IMusic } from '@/@types/music';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IApiResponse } from '@/@types';

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: artist, isLoading } = useQuery<IArtist>({
        queryKey: ['artist', id],
        queryFn: async () => {
            const response = await api.get(`/artist/${id}`);
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: artistMusic, isLoading: artistMusicLoading } = useQuery<IApiResponse<IMusic>>({
        queryKey: ['artist-music', id],
        queryFn: async () => {
            const response = await api.get(`/music/byArtist/${id}`, {
                params: {
                    page: 1,
                    size: 100,
                },
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="w-[250px] h-12" />
                <Skeleton className="w-full h-[300px]" />
            </div>
        );
    }
    if (!artist) {
        return <div>Artist not found</div>;
    }

    return (
        <div className="space-y-6 mx-auto p-6 container">
            {/* Header Section */}
            <div className="space-y-2">
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft size={16} /> Back
                </Button>
                <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                        <AvatarFallback className="text-2xl">
                            {artist?.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold text-3xl">{artist?.name}</h1>
                        <Badge variant="secondary" className="mt-2">
                            {artist?.gender === 'm' ? 'Male' : artist?.gender === 'f' ? 'Female' : 'Other'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Details Cards */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-xl">Personal Information</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>Date of Birth: {format(new Date(artist?.dob), 'MMMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                            <span>Address: {artist?.address}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Career Information */}
                <Card>
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-xl">Career Details</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>First Release: {artist?.first_release_year}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DiscIcon className="w-4 h-4 text-muted-foreground" />
                            <span>Albums Released: {artist?.no_of_albums_released}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Management Information */}
                <Card>
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-xl">Management</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span>
                                Manager: {artist?.manager?.first_name} {artist?.manager?.last_name}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>Joined: {format(new Date(artist.created_at), 'MMMM dd, yyyy')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Music Section */}
            <div>
                <Card className="px-2 py-6">
                    <CardContent>
                        {artistMusicLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <h2 className="mb-2 font-semibold text-2xl">
                                    Music by {artist?.name}
                                    <small className="ml-2 text-muted-foreground">({artistMusic?.pagination?.total} songs)</small>
                                </h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Genre</TableHead>
                                            <TableHead>Album</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {artistMusic?.data.map((music) => (
                                            <TableRow key={music.id}>
                                                <TableCell>{music.title}</TableCell>
                                                <TableCell>{music.genre}</TableCell>
                                                <TableCell>{music.album_name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
