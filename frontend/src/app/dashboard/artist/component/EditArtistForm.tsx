'use client';

import { IUser } from '@/@types/user';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IArtist } from '@/@types/artist';
import { ArtistFormData, artistSchema } from '@/schemas/artist';

interface EditArtistFormProps {
    artist: IArtist;
    onSuccess: () => void;
}

export default function EditArtistForm({ artist, onSuccess }: EditArtistFormProps) {
    const inputStyles =
        'border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all';
    const numberInputStyles = `${inputStyles} [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

    const form = useForm<ArtistFormData>({
        resolver: zodResolver(artistSchema),
        defaultValues: {
            first_name: artist.user.first_name,
            last_name: artist.user.last_name,
            email: artist.user.email,
            dob: artist.dob || '',
            gender: artist.gender || '',
            address: artist.address || '',
            first_release_year: Number(artist.first_release_year) || 0,
            no_of_albums_released: Number(artist.no_of_albums_released) || 0,
            manager_id: artist.manager_id || '',
        },
    });

    const { mutate: updateArtist, isPending } = useMutation({
        mutationFn: (values: ArtistFormData) => {
            return api.patch(`/artist/${artist.id}`, values);
        },
        onSuccess: () => {
            toast.success('Artist updated successfully');
            onSuccess();
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to update artist';
            toast.error(errorMessage);
        },
    });

    function onSubmit(values: ArtistFormData) {
        updateArtist(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Enter artist's first name" {...field} className={inputStyles} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Enter artist's last name" {...field} className={inputStyles} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Enter artist's email address" type="email" {...field} className={inputStyles} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Select date of birth" type="date" {...field} className={inputStyles} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={inputStyles}>
                                            <SelectValue placeholder="Select artist's gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="m">Male</SelectItem>
                                        <SelectItem value="f">Female</SelectItem>
                                        <SelectItem value="o">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Enter artist's full address" {...field} className={inputStyles} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="first_release_year"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Enter year of first release"
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                                    className={numberInputStyles}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="no_of_albums_released"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Enter total number of albums released"
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                                    className={numberInputStyles}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-purple-600 hover:from-purple-700 to-pink-600 hover:to-pink-700 mt-6 py-3 rounded-lg w-full text-white transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending ? 'Updating...' : 'Update Artist'}
                </Button>
            </form>
        </Form>
    );
}
