import { IArtist } from '@/@types/artist';
import { IUser } from '@/@types/user';
import { create } from 'zustand';

interface AuthState {
	accessToken: string | null;
	user: IUser | null;
	artist: IArtist | null;
	setAccessToken: (token: string) => void;
	clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: null,
	user: null,
	artist: null,
	setAccessToken: (token) => set({ accessToken: token }),
	clearAccessToken: () => set({ accessToken: null }),
}));
