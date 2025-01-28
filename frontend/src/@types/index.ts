export interface IPagination {
	total: number;
	page: number;
	size: number;
	pages: number;
}

export interface IApiResponse<T> {
	success: boolean;
	message: string;
	data: T[];
	pagination?: IPagination;
}