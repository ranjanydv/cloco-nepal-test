import * as z from 'zod';
import { EMusicGenre } from '@/@types/music';

export const musicFormSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters'),
	genre: z.nativeEnum(EMusicGenre),
	album_name: z.string().min(2, 'Album name must be at least 2 characters'),
});

export type MusicFormValues = z.infer<typeof musicFormSchema>; 