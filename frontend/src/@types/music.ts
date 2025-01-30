import { IArtist } from "./artist";

export enum EMusicGenre {
	MB = 'mb',
	COUNTRY = 'country',
	CLASSIC = 'classic',
	ROCK = 'rock',
	JAZZ = 'jazz',
}

export interface IMusic {
	id: string;
	title: string;
	genre: EMusicGenre;
	album_name: string;
	artist_id: string;
	artist: IArtist;
	created_at: string;
}


