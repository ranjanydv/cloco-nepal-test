'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function Login() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginFormData) => api.post('/auth/login', credentials),
        onSuccess: () => {
            toast.success('Login successful');
            router.push('/dashboard');
        },
        onError: (error) => {
            toast.error('Login failed', {
                // @ts-expect-error asd
                description: error.response?.data?.message || 'An unknown error occurred',
            });
        },
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 min-h-screen">
            <div className="space-y-6 border-purple-100 bg-white/90 shadow-2xl backdrop-blur-sm p-10 border rounded-2xl w-full max-w-md">
                <div className="space-y-3 text-center">
                    <h1 className="bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-4xl text-transparent">Artist Portal</h1>
                    <p className="mt-2 text-gray-600 italic">Where creativity meets management</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Input
                            placeholder="Email address"
                            {...register('email')}
                            className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Input
                            placeholder="Password"
                            type="password"
                            {...register('password')}
                            className="border-2 bg-white/50 backdrop-blur-sm px-4 py-3 focus:border-none rounded-lg focus:ring-2 focus:ring-purple-400 w-full transition-all"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 hover:from-purple-700 to-pink-600 hover:to-pink-700 py-3 rounded-lg w-full text-white transform transition-all duration-300 hover:scale-[1.02]">
                        {loginMutation.isPending ? (
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
                                Entering Studio...
                            </span>
                        ) : (
                            'Enter Studio'
                        )}
                    </Button>
                </form>
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="font-semibold text-purple-600 hover:text-purple-800">
                            Join the Artist Community
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
