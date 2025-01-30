"use server"

import { IArtist } from "@/@types/artist";
import api from "@/lib/api";


export const getArtistData = async (id: string): Promise<IArtist> => {
	const response = await api.get(`/artist/${id}`);
	return response.data.data;
}