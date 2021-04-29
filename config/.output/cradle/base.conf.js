module.exports = {
	id: null,
	conn: [
		{
			host: '127.0.0.1',
			port: 5984,
			db: '',
			opts: {
				cache: false,
				raw: false,
				forceSave: true,
			},
		},
	],

	buffer:{
		size: 5,
		expire: 5000, //miliseconds
	}
};
