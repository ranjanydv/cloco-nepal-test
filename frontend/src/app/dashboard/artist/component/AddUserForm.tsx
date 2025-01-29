'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { RegisterFormData, registerSchema } from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
        },
    });

    const registerMutation = useMutation({
        mutationFn: (credentials: RegisterFormData) => api.post('/auth/register', credentials),
        onSuccess: () => {
            toast.success('User added successfully');
            onSuccess();
        },
        onError: (error) => {
            toast.error('Registration failed', {
                // @ts-expect-error type issue
                description: error.response?.data?.message || 'An unknown error occurred',
            });
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        registerMutation.mutate(data);
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="gap-4 grid grid-cols-2">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="First Name"
                                        {...field}
                                        className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Last Name"
                                        {...field}
                                        className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                                    />
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
                                <Input
                                    placeholder="Email address"
                                    type="email"
                                    {...field}
                                    className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    {...field}
                                    className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Confirm Password"
                                    type="password"
                                    {...field}
                                    className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all">
                                        <SelectValue placeholder="Select user's role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="artist">Artist</SelectItem>
                                    <SelectItem value="artist_manager">Manager</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 hover:from-purple-700 to-pink-600 hover:to-pink-700 mt-6 py-3 rounded-lg w-full text-white transform transition-all duration-300 hover:scale-[1.02]">
                    {registerMutation.isPending ? (
                        <span className="flex justify-center items-center">
                            <svg
                                className="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding user...
                        </span>
                    ) : (
                        'Add user'
                    )}
                </Button>
            </form>
        </Form>
    );
}

export default AddUserForm;
