'use strict'


module.exports = {

  scheme: 'http',
  host:'127.0.0.1',
  port: 9080,

	requests : {
		once: [],
		periodical: [],
		range: [],
		//monitor: [],
		//config: [],
	},

	// id: '',
	// path: '',

	logs: null,

	// jar: true,

	/*authentication: {
		username: 'lbueno',
		password: '123',
		sendImmediately: true,
	},*/

  // authentication: {
	// 	username: 'test',
	// 	password: '123',
	// 	sendImmediately: false,
	// },
  authentication: {
    /** server **/
    init: true,
    users : [
        { id: 1, username: 'mngr' , role: 'mngr', password: '1234'}
    ],

    /** client **/
    username: 'mngr',
  	password: '1234',
  	sendImmediately: true,
  	// bearer: 'bearer',
  	basic: true
  },

  // authorization: {
	// 	config: {
	// 		"permissions":[],
	// 	},
	// },

	// logs: {
	// 	loggers: {
	// 		error: null,
	// 		access: null,
	// 		profiling: null
	// 	},
  //
	// 	path: './logs',
  //
	// 	//default: [
	// 		//{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
	// 		//{ transport: winston.transports.File, options: {level: 'info', filename: null } }
	// 	//]
	// },


	//authorization: {
		//config: path.join(__dirname,'../../rbac.json'),
	//},

	// api: {
	// 	version: '1.0.0',
  //
	// 	routes: {
	// 		get: [
	// 			{
	// 			path: '',
	// 			callbacks: ['404'],
	// 			version: '',
	// 			},
	// 		]
	// 	},
	// },
}
