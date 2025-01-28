export enum UserRole {
	SUPER_ADMIN = 'super_admin',
	ARTIST_MANAGER = 'artist_manager',
	ARTIST = 'artist',
}

export interface IUser {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	role: UserRole;
	createdAt: string;
}


