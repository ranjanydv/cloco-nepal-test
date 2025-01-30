import { IUser } from "./user";

export enum ArtistGender {
	MALE = 'm',
	FEMALE = 'f',
	OTHER = 'o',
}

export interface IArtist {
	id: string;
	name: string;
	dob: string;
	gender: ArtistGender;
	address: string;
	first_release_year: string;
	no_of_albums_released: string;
	created_at: string;
	user_id: string;
	user: IUser;
	manager_id: string;
	manager: IUser;
}


