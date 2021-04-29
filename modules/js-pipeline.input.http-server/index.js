'use strict'

const path = require('path'),
			App = require('../node-express-app'),
			http = require('http');

const debug = require('debug')('js-pipeline.input.http-server'),
      debug_events = require('debug')('js-pipeline.input.http-server:Events'),
      debug_internals = require('debug')('js-pipeline.input.http-server:Internals')

module.exports = new Class({
  Extends: App,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

  server: null,

  options: {
		id: undefined,
		path: '',

		// apps_dir: null,
		authentication: null,

		logs: null,
		//logs: {
			//loggers: {
				//error: null,
				//access: null,
				//profiling: null
			//},

			//path: './logs',

			////default: [
				////{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				////{ transport: winston.transports.File, options: {level: 'info', filename: null } }
			////]
		//},

		authorization: null,

		params: null,

		middlewares: null,

		routes: {
			all: [
				{
					path: '',
					callbacks: ['404'],
					version: '',
				},
			]
		},

		api: {
			routes: {
				all: [
					{
						path: '',
						callbacks: ['404'],
						version: '',
					},
				]
			},
		},
	},
  use: function(mount, app){
		debug('use instanceOf(app, ExpressApp) %o', instanceOf(app, App));

		if(instanceOf(app, App) === true)
			this.parent(mount, app);
	},
	//use: function(mount, app){
		//debug('use %o', app);

		//let id = Object.keys(this._flatten_obj(mount))[0];

		//app.options.id = id;

		//app.addEvent(app.ON_CONNECT_ERROR, function(err){
			//debug_events('app.ON_CONNECT_ERROR %o', err);

			//this.fireEvent(this.ON_CONNECT_ERROR);
		//}.bind(this));

		//this.parent(mount, app);
	//},
  initialize: function(options){


		//options = options || {};
		//options = Object.merge(Conf, options);

		this.parent(options);//override default options

		if(this.logs)
			this.profile('InputPusherHttp_init');//start profiling

		let first_connect = function(){
			debug_internals('first_connect', this.options.id, this.server.address());
			// process.exit(1)
			if(!this.options.id || this.options.id === undefined){
				let addr = this.server.address();
				debug_internals('first_connect addr %o', addr);
					let bind = typeof addr === 'string'
					? addr
					: addr.address+':'+addr.port+'['+addr.family+']';

					this.options.id = bind;//set ID
			}

			// if(this.options.apps_dir)
			// 	this.load(this.options.apps_dir)

			//this.load(path.join(__dirname, '../../../../../apps'));
			if(Array.isArray(this.options.load)){
				Array.each(this.options.load, function(app){
					this.load(path.join(process.cwd(), app));
				}.bind(this));
			}
			else if(this.options.load){
				this.load(path.join(process.cwd(), this.options.load));
			}

			this.removeEvent(this.ON_CONNECT, first_connect)
		}.bind(this);

		this.addEvent(this.ON_CONNECT, first_connect);
		// this.addEvent(this.ON_CONNECT, function(result){
		// 	debug_events('this.ON_CONNECT');
		// 	first_connect(result);
		// });

		// this.addEvent(this.ON_CONNECT, function(){this.removeEvent(this.ON_CONNECT, first_connect)});

		// this.app.set('port', this.options.port);
		// this.server = http.createServer(this.app);


		this.app.set('port', this.options.port);
		this.server = http.createServer(this.app);

		//this.os.api.get({uri: 'hostname'});
		//this.api.get({uri: ''});
		// this.server.listen(this.options.port);
		this.server.on('error', err => this.fireEvent(this.ON_CONNECT_ERROR, err))
		// this.server.on('error', function(err){
		// 	debug_internals('httpServer err %o', this);
		// 	// process.exit(1)
		// 	this.fireEvent(this.ON_CONNECT_ERROR, [err]);
		// }.bind(this));


		this.server.on('listening', () => this.fireEvent(this.ON_CONNECT));

		// this.server.on('listening', function(){
		// 	debug_internals('Listening on', this.app, this.server.address());
		// 	process.exit(1)
		// 	let addr = this.server.address();
		// 	let bind = typeof addr === 'string'
		// 		? 'pipe ' + addr
		// 		: 'port ' + addr.port;
		//
		// 	debug_internals('Listening on %s', bind);
		//
		// 	this.fireEvent(this.ON_CONNECT);
		// }.bind(this));


		debug('CONN', this.server)
		// process.exit(1)
		// this.server.listen({
	  //   host: this.options.host,
	  //   port: this.options.port
		// })

		// // this.server.on('error', err => this.fireEvent(this.ON_CONNECT_ERROR, err))
		// this.server.on('error', function(err){
		// 	debug_internals('httpServer err %o', this);
		// 	// process.exit(1)
		// 	this.fireEvent(this.ON_CONNECT_ERROR, [err]);
		// }.bind(this));
		//
		//
		// this.server.on('listening', () => this.fireEvent(this.ON_CONNECT));
		//
		// // this.server.on('listening', function(){
		// // 	debug_internals('Listening on', this.server.address());
		// // 	let addr = this.server.address();
		// // 	let bind = typeof addr === 'string'
		// // 		? 'pipe ' + addr
		// // 		: 'port ' + addr.port;
		// //
		// // 	debug_internals('Listening on %s', bind);
		// //
		// // 	this.fireEvent(this.ON_CONNECT);
		// // }.bind(this));

		if(this.logs){
			this.profile('InputPusherHttp_init');//end profiling
			this.log('InputPusherHttp', 'info', 'InputPusherHttp started');
		}

		debug_internals('this.initialize');
  },
  connect: function(){
		debug_internals('this.connect');
		// process.exit(1)
		try{

			this.server.listen({
		    host: this.options.host,
		    port: this.options.port
			}, function(){
				debug_internals('Server Listen %o', this.app);
			}.bind(this))

		}
		catch(e){
			debug_internals('Server Listen err %o', e);
		}
	}

});
