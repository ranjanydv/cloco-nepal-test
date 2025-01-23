export const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiConfig = {
	auth: {
		login: `${baseUrl}/v1/auth/login`,
		register: `${baseUrl}/v1/auth/register`,
	},
	dashboard: {
		get: `${baseUrl}/v1/dashboard/data`,
	},

};
