'use strict'


module.exports = {

  scheme: 'http',
  host:'127.0.0.1',
  port: 8081,

	requests : {
		once: [],
		periodical: [],
		range: [],
		//monitor: [],
		//config: [],
	},

	id: '',
	path: '',

	logs: null,

	jar: true,

  logs: {
		loggers: {
			error: null,
			access: null,
			profiling: null
		},

		path: './logs',

	},

	authentication: {
		username: 'username',
		password: 'xxx',
		sendImmediately: true,
	},


	//authorization: {
		//config: path.join(__dirname,'../../rbac.json'),
	//},

	api: {
		version: '1.0.0',

		routes: {
			get: [
				{
				path: '',
				callbacks: ['get'],
				version: '',
				},
			]
		},
	},
}
