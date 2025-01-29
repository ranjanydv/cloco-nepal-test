'use client';
import { IUser } from '@/@types/user';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
});

interface EditUserFormProps {
    user: IUser;
    onSuccess: () => void;
}

export default function EditUserForm({ user, onSuccess }: EditUserFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
    });

    const { mutate: updateUser, isPending } = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => {
            return api.patch(`/user/${user.id}`, values);
        },
        onSuccess: () => {
            toast.success('User updated successfully');
            onSuccess();
        },
        onError: (error) => {
            // @ts-expect-error type error
            const errorMessage = error?.response?.data?.message || 'Failed to update user';
            toast.error(errorMessage);
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        updateUser(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Updating...' : 'Update User'}
                </Button>
            </form>
        </Form>
    );
}
