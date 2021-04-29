module.exports = {
	cradle: {
		id: "localhost.cradle",
		conn: [
			{
				host: '127.0.0.1',
				port: 5984,
				db: 'dashboard',
				opts: {
					cache: true,
					raw: false,
					forceSave: true,
				}
			},
		]
	}
};
