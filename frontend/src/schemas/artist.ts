import { z } from 'zod';


export const artistSchema = z.object({
	first_name: z.string().min(2, 'First name must be at least 2 characters'),
	last_name: z.string().min(2, 'Last name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	dob: z.string().min(1, 'Date of birth is required'),
	gender: z.string().min(1, 'Gender is required'),
	address: z.string().min(2, 'Address is required'),
	first_release_year: z.preprocess((val) => Number(val), z.number().min(1900, 'Enter a valid year')), // Ensures number conversion
	no_of_albums_released: z.preprocess((val) => Number(val), z.number().min(0, 'Must be at least 0')),
	manager_id: z.string().optional(),
});




export type ArtistFormData = z.infer<typeof artistSchema>;
