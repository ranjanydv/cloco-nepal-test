const adminRoutes = {
	super_admin: {
		dashboard: '/dashboard',
		settings: '/dashboard/settings',
		users: '/dashboard/users',
		artists: '/dashboard/artist',
		songs: '/dashboard/songs',
		albums: '/dashboard/albums',
		playlists: '/dashboard/playlists'
	},
	artist_manager: {
		dashboard: '/dashboard',
		artists: '/dashboard/artist',
		songs: '/dashboard/songs',
		albums: '/dashboard/albums',
		playlists: '/dashboard/playlists'
	},
	content_manager: {
		dashboard: '/dashboard',
		artists: '/dashboard/artist',
		songs: '/dashboard/songs',
		albums: '/dashboard/albums'
	},
	viewer: {
		dashboard: '/dashboard'
	}
};

export default adminRoutes;