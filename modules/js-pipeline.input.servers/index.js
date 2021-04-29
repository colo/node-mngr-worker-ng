'use strict'

const path = require('path')
			// Push = require('../index')

const debug = require('debug')('js-pipeline:input:servers'),
			debug_internals = require('debug')('js-pipeline:input:servers:Internals'),
			debug_events = require('debug')('js-pipeline:input:servers:Events')

module.exports = new Class({
	Implements: [Options, Events],

	ON_SUSPEND: 'onSuspend',
	ON_RESUME: 'onResume',
	ON_EXIT: 'onExit',

	ON_ONCE: 'onOnce',
	ON_RANGE: 'onRange',


	ON_SERVER_CONNECT: 'onServerConnect',
	ON_SERVER_CONNECT_ERROR: 'onServerConnectError',

	ON_DOC: 'onDoc',
	ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_DOC_SAVED: 'onDocSaved',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
	ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

	ON_RANGE_DOC: 'onRangeDoc',
	ON_RANGE_DOC_ERROR: 'onRangeDocError',

	// ON_ONCE_REQUESTS_UPDATED: 'onOnceRequestsUpdated',
	// ON_RANGE_REQUESTS_UPDATED: 'onRangeRequestsUpdated',
	// ON_PERIODICAL_REQUESTS_UPDATED: 'onPeriodicalRequestsUpdated',


	servers: {},
	//connected servers
	conn_servers: {},

	//servers that couldn't connect
	err_servers: {},

	err_server_count: [],

	//db: null,
	options: {

		id: null,
		conn: undefined,
		servers: [],

		connect_retry_count: 10,
		connect_retry_periodical: 5000,

		//requests: {
			//periodical: 1000,
		//},

		//docs:{
			//buffer_size: 10,
			//timer: 5, //seconds
		//}

	},

	initialize: function(options){

		this.setOptions(options);

		// if(typeof(this.options.conn) != 'array' && this.options.conn instanceof Array && !Array.isArray(this.options.conn)){
		// 	let server = this.options.conn;
		// 	this.options.conn = [];
		// 	this.options.conn.push(server);
		// }

		//console.log(this.options);

		// this.addEvent(this.ON_EXIT, function(){
		// 	//console.log('this.ON_EXIT');
		// 	debug_events('ON_EXIT');
		// 	process.exit(0);
		// }.bind(this));
		this.options.servers = (this.options.conn !== undefined) ? this.options.conn : this.options.servers
		if(!Array.isArray(this.options.servers))
			this.options.servers = [this.options.servers]

		//////console.log(this.options);

		this.addEvent(this.ON_EXIT, this.exit.bind(this));

	},
	exit: function(){
		debug('exit');
		if(process && process.exit && typeof process.exit == 'function')//process.exit works only nodejs, not in browsers
			process.exit(0);
	},
	__extend_server_app: function(server, app){
		server['ON_DOC'] = app.ON_DOC;
		server['ON_DOC_ERROR'] = app.ON_DOC_ERROR;

		server['ON_ONCE'] = app.ON_ONCE;
		server['ON_RANGE'] = app.ON_RANGE;

		server['ON_PERIODICAL_DOC'] = app.ON_PERIODICAL_DOC;
		server['ON_PERIODICAL_DOC_ERROR'] = app.ON_PERIODICAL_DOC_ERROR;

		server['ON_ONCE_DOC'] = app.ON_ONCE_DOC;
		server['ON_ONCE_DOC_ERROR'] = app.ON_ONCE_DOC_ERROR;

		server['ON_DOC_SAVED'] = app.ON_DOC_SAVED;

		server['ON_RANGE_DOC'] = app.ON_RANGE_DOC;
		server['ON_RANGE_DOC_ERROR'] = app.ON_RANGE_DOC_ERROR;

		// server.addEvent(server.ON_DOC, function(doc, options){
		// 	debug_events('server.ON_DOC %o', arguments);
		// 	app.fireEvent(app.ON_DOC, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_DOC, (doc, options) => app.fireEvent(app.ON_DOC, [doc, options]));

		// server.addEvent(server.ON_DOC_ERROR, function(doc, options){
		// 	debug_events('server.ON_DOC_ERROR %o', arguments);
		// 	app.fireEvent(app.ON_DOC_ERROR, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_DOC_ERROR, [doc, options]));

		// server.addEvent(server.ON_ONCE_DOC, function(doc, options){
		// 	debug_events('server.ON_ONCE_DOC %o', arguments);
		// 	app.fireEvent(app.ON_ONCE_DOC, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_ONCE_DOC, (doc, options) => app.fireEvent(app.ON_ONCE_DOC, [doc, options]));

		// server.addEvent(server.ON_ONCE_DOC_ERROR, function(doc, options){
		// 	debug_events('server.ON_ONCE_DOC_ERROR %o', arguments);
		// 	app.fireEvent(app.ON_ONCE_DOC_ERROR, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_ONCE_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_ONCE_DOC_ERROR, [doc, options]));

		// server.addEvent(server.ON_PERIODICAL_DOC, function(doc, options){
		// 	debug_events('server.ON_PERIODICAL_DOC %o', arguments);
		// 	app.fireEvent(app.ON_PERIODICAL_DOC, [doc, options]);
		//
		// }.bind(app));
		server.addEvent(server.ON_PERIODICAL_DOC, (doc, options) => app.fireEvent(app.ON_PERIODICAL_DOC, [doc, options]));

		// server.addEvent(server.ON_PERIODICAL_DOC_ERROR, function(doc, options){
		// 	debug_events('server.ON_PERIODICAL_DOC_ERROR %o', arguments);
		// 	app.fireEvent(app.ON_PERIODICAL_DOC_ERROR, [doc, options]);
		//
		// }.bind(app));
		server.addEvent(server.ON_PERIODICAL_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_PERIODICAL_DOC_ERROR, [doc, options]));


		// server.addEvent(server.ON_RANGE_DOC, function(doc, options){
		// 	debug_events('server.ON_RANGE_DOC %o', arguments);
		// 	app.fireEvent(app.ON_RANGE_DOC, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_RANGE_DOC, (doc, options) => app.fireEvent(app.ON_RANGE_DOC, [doc, options]));

		// server.addEvent(server.ON_RANGE_DOC_ERROR, function(doc, options){
		// 	debug_events('server.ON_RANGE_DOC_ERROR %o', arguments);
		// 	app.fireEvent(app.ON_RANGE_DOC_ERROR, [doc, options]);
		// }.bind(app));
		server.addEvent(server.ON_RANGE_DOC_ERROR, (doc, options) => app.fireEvent(app.ON_RANGE_DOC_ERROR, [doc, options]));

	},
	connect: function(){
		let servers = this.options.conn;

			Array.each(servers, function(server, index){

				if(!this.conn_servers || !this.conn_servers[index]){//to prevent multiples ON_ERROR trying to reconnect

					if(!this.err_server_count[index])
						this.err_server_count[index] = 0;

					// let push = null;

					//checks if the 'server app' already failed, else create a new one
					if(this.err_servers && this.err_servers[index]){

						debug('Connect->err_servers %d', index);

						server = this.err_servers[index];
					}
					else{

						debug('Connect->create server %o', server);

						// server = new Push(server);
						this.__extend_server_app(server, this)

						server.addEvent(server.ON_USE, (mount, app) => this.__extend_server_app(app, server))
						// server.addEvent(server.ON_USE, function(mount, app){
						// 	debug_events('server.ON_USE %o', app);
						//
						// 	app['ON_DOC'] = this.ON_DOC;
						// 	app['ON_DOC_ERROR'] = this.ON_DOC_ERROR;
						//
						// 	app['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
						// 	app['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;
						//
						// 	app['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
						// 	app['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;
						//
						// 	app['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
						// 	app['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;
						//
						//
						// 	app.addEvent(this.ON_DOC, function(doc){
						// 		debug_events('app.ON_DOC %o', doc);
						// 		this.fireEvent(this.ON_DOC, [doc, {type: 'server', input_type: server, app: app}]);
						// 	}.bind(this));
						//
						// 	app.addEvent(this.ON_DOC_ERROR, function(err){
						// 		debug_events('app.ON_DOC_ERROR %o', err);
						// 		this.fireEvent(this.ON_DOC_ERROR, [err, {type: 'server', input_type: server, app: app}]);
						// 	}.bind(this));
						//
						// 	app.addEvent(this.ON_ONCE_DOC, function(doc){
						// 		debug_events('app.ON_ONCE_DOC %o', doc);
						// 		this.fireEvent(this.ON_ONCE_DOC, [doc, {type: 'once', input_type: server, app: app}]);
						// 	}.bind(this));
						//
						// 	app.addEvent(this.ON_PERIODICAL_DOC, function(doc){
						// 		debug_events('app.ON_PERIODICAL_DOC %o', doc);
						// 		this.fireEvent(this.ON_PERIODICAL_DOC, [doc, {type: 'periodical', input_type: server, app: app}]);
						// 	}.bind(this));
						//
						// 	app.addEvent(this.ON_RANGE_DOC, function(doc){
						// 		debug_events('app.ON_RANGE_DOC %o', doc);
						// 		this.fireEvent(this.ON_RANGE_DOC, [doc, {type: 'range', input_type: server, app: app}]);
						// 	}.bind(this));
						//
						// }.bind(this));

						// server.addEvent(server.ON_CONNECT, function(result){
						// 	debug_events('server.ON_CONNECT %o', result);
						//
						// 	this._register_server(index, server);
						// }.bind(this));
						server.addEvent(server.ON_CONNECT, result => this._register_server(index, server));

						// server.addEvent(server.ON_CONNECT_ERROR, function(err){
						// 	debug_events('server.ON_CONNECT_ERROR %o', err);
						// 	this._register_error(index, server);
						// }.bind(this));
						server.addEvent(server.ON_CONNECT_ERROR, err => this._register_error(index, server));

					}

					// try{
					//
					// 	if(this.options.connect_retry_count < 0 || this.err_server_count[index] < this.options.connect_retry_count){
					// 		//server.os.api.get({uri: 'hostname'});
					// 		debug_internals('Trying to connect %o', server);
					// 		server.connect();
					// 	}
					//
					// }
					// catch(e){
					// 	debug_internals('Error connecting: %o', e);
					// }
					try{
						if(server.connected === true){
							debug_events('server CONNECTED %o', server.connected);
							this._register_server(index, server)
						}
						else if(this.options.connect_retry_count < 0 || this.err_server_count[index] < this.options.connect_retry_count){
							//server.os.api.get({uri: 'hostname'});
							server.connect();
						}

					}
					catch(e){
						//////console.log(e);

					}

				}//
			}.bind(this));

		//}.bind(this));
	},
	_register_server: function(index, server){
		//console.log('CONNECTED hostname');
		//console.log(index);
		////console.log(server);

		//this.conn_servers[server_id+'.'+hostname] = server;
		if(!this.conn_servers)
			this.conn_servers = [];

		this.conn_servers[index] = server;

		if(this.err_server_count)
			delete this.err_server_count[index];

		if(this.err_servers)
			delete this.err_servers[index];

		debug_internals('_register_server %o', server);

		this.fireEvent(this.ON_SERVER_CONNECT, server);

	},
	_register_error: function(index, server){
		//console.log('DISCONNECTED hostname');
		//console.log(index);
		//console.log(this.options.conn);

		this.err_server_count[index] += 1;

		let err_server = {};
		err_server = [];
		err_server[index] = this.options.conn[index];
		//err_server.push(server);

		if(!this.err_servers)
			this.err_servers = [];

		if(this.err_servers[index] != server){
			this.err_servers[index] = server;

			let reconnect_timer = null;

			let reconnect = function(err_server){
				//console.log('RE CONNECTING');
				//console.log(err_server);

				reconnect_timer = this.connect.periodical(this.options.connect_retry_periodical, this, err_server);
			}.bind(this);


			let reconnect_stop = function(){clearInterval(reconnect_timer)}.bind(this);

			process.on('exit', (code) => reconnect_stop);

			//this.addEvent(this.ON_SUSPEND, reconnect_stop);

			//server.addEvent(server.ON_CONNECT_ERROR, stop);

			//this.addEvent(this.ON_RESUME, reconnect_start);

			// server.addEvent(server.ON_CONNECT, function(){
			// 	debug_events('server.ON_CONNECT');
			// 	reconnect_stop();
			// });
			server.addEvent(server.ON_CONNECT, reconnect_stop);

			reconnect(err_server);
		}

		if(this.conn_servers)
			delete this.conn_servers[index];

		debug_internals('_register_error %o', server);


		this.fireEvent(this.ON_SERVER_CONNECT_ERROR, err_server);
	},


});
