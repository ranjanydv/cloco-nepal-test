const adminRoutes = {
	super_admin: {
		dashboard: '/dashboard',
		users: '/dashboard/users',
		artists: '/dashboard/artist',
		music: '/dashboard/music',
	},
	artist_manager: {
		dashboard: '/dashboard',
		artists: '/dashboard/artist',
	},
	artist: {
		dashboard: '/dashboard',
		music: '/dashboard/music',
	}
};

export default adminRoutes;