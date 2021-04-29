'use strict'

const App = require('../node-app'),
		path = require('path'),
		fs = require('fs'),
		Munin = require('../node-munin-client'),
		pathToRegexp = require('path-to-regexp')


//let Logger = require('node-express-logger'),
// let Authorization = require('node-express-authorization');
	//Authentication = require('node-express-authentication');

const debug = require('debug')('app-munin-client'),
			debug_events = require('debug')('app-munin-client:Events'),
			debug_internals = require('debug')('app-munin-client:Internals')


let AppMuninClient = new Class({
  //Implements: [Options, Events],
  Extends: App,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

  request: null,
	connected: false,

  api: {},

  methods: [
		//Lists the capabilities of the node, e.g. multigraph dirtyconfig
		'cap',
		// list [node] - Simply lists items available for gathering for this host. E.g. load, cpu, memory, df, et alia. If no host is given, default to host that runs the munin-node.
		'list',
		//Lists hosts available on this node.
		'nodes',
		//config <query-item> - Shows the plugins configuration items. See the config protocol for a full description.
		'config',
		//fetch <query-item> - Fetches values
		'fetch',
		//Print version string
		'version',
		//Close the connection. Also possible to use a point “.”.
		'quit'
	],

  authorization:null,
  //authentication: null,
  _merged_apps: {},

  options: {

		host: '127.0.0.1',
		port: 4949,
		//db: '',

		//cradle: {
			//cache: true,
			//raw: false,
			//forceSave: true,
		//},


		logs: null,

		authentication: null,

		//authentication: {
			//username: 'user',
			//password: 'pass',
			//sendImmediately: true,
			//bearer: 'bearer,
			//basic: false
		//},

		authorization: null,

		routes: {
		},
		/*routes: {

			get: [
				{
					path: '/:param',
					callbacks: ['check_authentication', 'get'],
					content_type: /text\/plain/,
				},
			],
			post: [
				{
				path: '',
				callbacks: ['', 'post']
				},
			],
			all: [
				{
				path: '',
				callbacks: ['', 'get']
				},
			]

		},*/

		//api: {

			//content_type: 'application/json',

			//path: '',

			//version: '0.0.0',

			//versioned_path: false, //default false

			////accept_header: 'accept-version', //implement?

			///*routes: {
				//get: [
					//{
					//path: '',
					//callbacks: ['get_api'],
					//content_type: 'application/x-www-form-urlencoded',
					////version: '1.0.1',
					//},
					//{
					//path: ':service_action',
					//callbacks: ['get_api'],
					//version: '2.0.0',
					//},
					//{
					//path: ':service_action',
					//callbacks: ['get_api'],
					//version: '1.0.1',
					//},
				//],
				//post: [
					//{
					//path: '',
					//callbacks: ['check_authentication', 'post'],
					//},
				//],
				//all: [
					//{
					//path: '',
					//callbacks: ['get'],
					//version: '',
					//},
				//]

			//},*/


			///*doc: {
				//'/': {
					//type: 'function',
					//returns: 'array',
					//description: 'Return an array of registered servers',
					//example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

				//}
			//},*/
		//},
  },
  initialize: function(options){
		//throw new Error('Maybe implement with https://www.npmjs.com/package/node-munin-client');

		this.parent(options);//override default options

		/**
		 * munin
		 *  - start
		 * **/

		this.request = new Munin({ host: this.options.host, port: this.options.port });

		debug_internals('this.request %o', this.request);

		/**
		 * munin
		 *  - end
		 * **/



		//if(this.options.db);
			//this.request.database(this.options.db);

		// if(this.logger)
		// 	this.logger.extend_app(this);

		/**
		 * logger
		 *  - end
		 * **/

		/**
		 * authorization
		 * - start
		 * */
		//  if(this.options.authorization && this.options.authorization.init !== false){
		// 	 let authorization = null;
		//
		// 	 if(typeof(this.options.authorization) == 'class'){
		// 		 authorization = new this.options.authorization({});
		// 		 this.options.authorization = {};
		// 	 }
		// 	 else if(typeof(this.options.authorization) == 'function'){
		// 		authorization = this.options.authorization;
		// 		this.options.authorization = {};
		// 	}
		// 	else if(this.options.authorization.config){
		// 		let rbac = this.options.authorization.config;
		//
		// 		if(typeof(this.options.authorization.config) == 'string'){
		// 			//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
		// 			rbac = fs.readFileSync(this.options.authorization.config , 'ascii');
		// 			this.options.authorization.config = rbac;
		// 		}
		//
		// 		authorization = new Authorization(this,
		// 			JSON.decode(
		// 				rbac
		// 			)
		// 		);
		// 	}
		//
		// 	if(authorization){
		// 		this.authorization = authorization;
		// 		//app.use(this.authorization.session());
		// 	}
		// }
		if(this.options.authorization){
			let authorization = null;

			////console.log('----typeof(his.options.authorization)---');
			////console.log(typeof(this.options.authorization));
			////console.log(this.options.authorization);

		 if(typeof(this.options.authorization) == 'class'){
			 authorization = new this.options.authorization({});
			 this.options.authorization = {};
		 }
		 else if(this.options.authorization.module){
			 authorization = new this.options.authorization.module(this.options.authorization)
		 }
		 // else if(typeof(this.options.authorization) == 'function'){
		 else{
			 authorization = this.options.authorization;
			 this.options.authorization = {};
		 }
		 // else if(this.options.authorization.config){
		 // 	let rbac = this.options.authorization.config;
		 //
		 // 	if(typeof(this.options.authorization.config) == 'string'){
		 // 		//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
		 // 		rbac = JSON.decode(fs.readFileSync(this.options.authorization.config , 'ascii'));
		 // 		this.options.authorization.config = rbac;
		 // 	}
		 //
		 // 	authorization = new Authorization(this,
		 // 		rbac
		 // 	);
		 // }

		 if(authorization){
			 //if(this.options.authorization.init !== false){

				 // if(this.options.authorization.process){
				 // 	////console.log('----this.options.authorization.process---');
				 // 	authorization.processRules(
				 // 		this.options.authorization.process
				 // 	);
				 // }

				 this.authorization = authorization;
				 // app.use(this.authorization.session());
				 if(this.authorization && typeof(this.authorization.extend_app) === 'function')
					 this.authorization.extend_app(this)
				 //
				 // middlewares.push(this.authorization.session())



			 this.fireEvent(this.ON_INIT_AUTHORIZATION, authorization);
		 }
	 }
 	/**
	 * authorization
	 * - end
	 * */

		//if(this.options.routes && this.options.api.routes)
			//this.__apply_routes(this.options.routes, true);

		// this.__apply_routes(this.options.routes, false);


  },
	connect: function(){
		this.__apply_routes(this.options.routes, false);
	},
  __apply_routes: function(routes, is_api){
		let uri = '';

		let instance = this;
		//let conn = this.request;


		Array.each(this.methods, function(verb){

			//debug('VERB %s', verb);
			//console.log(verb);
			/**
			 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
			 * */
			instance[verb] = function(verb, original_func, options, callback_alt){
				debug_internals('instance[verb] %o', arguments);

				let request;//the request object to return

				let path = '';

				path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';

				options = options || {};


				debug_internals('instance[verb] routes %o', routes);

				if(routes[verb]){
					let uri_matched = false;

					Array.each(routes[verb], function(route){
						debug_internals('instance[verb] route.path %s', route.path);

						route.path = route.path || '';
						options.uri = options.uri || '';

						let keys = []
						let re = pathToRegexp(route.path, keys);

						//console.log('route path: '+route.path);
						//console.log(re.exec(options.uri));
						//console.log('options.uri: '+options.uri);
						//console.log(path);
						//console.log(keys);
						//console.log('--------');

						if(options.uri != null && re.test(options.uri) == true){
							uri_matched = true;

							let callbacks = [];

							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									//console.log('route function: ' + fn);

									//if the callback function, has the same name as the verb, we had it already copied as "original_func"
									if(fn == verb){
										callbacks.push({ func: original_func.bind(this), name: fn });
									}
									else{
										callbacks.push({ func: this[fn].bind(this), name: fn });
									}

								}.bind(this));
							}

							let merged = {};

							let response = function(err, resp){

								debug_internals('response verb %s', verb);

								////console.log('---req_func.cache.has(options.doc)---')
								////console.log(resp._id);
								////console.log(this.request.database('dashboard').cache.has(resp._id));

								//console.log('--response callback---');
								//console.log(arguments);

								//if(resp == false){
									//debug_internals('response connection closed');
									////this.request.disconnect();
									////this.fireEvent(this.ON_CONNECT_ERROR, { error: resp });
								//}
								//else
								if(err && this.connected === true){
									debug_internals('response err %o', err);
									// process.exit(1)
									//////this.fireEvent(this.ON_CONNECT_ERROR, {options: merged, uri: options.uri, route: route.path, error: err });
									this.connected = false
									this.fireEvent(this.ON_CONNECT_ERROR, {uri: options.uri, route: route.path, error: err });
								}
								else if(err === null && this.connected === false){
									debug_internals('response %o', resp);
									// process.exit(1)
									//this.request.disconnect();
									this.connected = true
									this.fireEvent(this.ON_CONNECT, {uri: options.uri, route: route.path, response: resp} );
									//this.fireEvent(this.ON_CONNECT, resp);
								}


								if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
									let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK[*callback_alt*]';

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									callback_alt(err, resp, {uri: options.uri, route: route.path });

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
								}
								else{
									//console.log(callbacks);
									Array.each(callbacks, function(fn){
										let callback = fn.func;
										let name = fn.name;

										let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK['+name+']';

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

										//callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });
										callback(err, resp, {uri: options.uri, route: route.path });

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									}.bind(this))
								}



							}.bind(this);

							let args = [];

							if(options.uri != '')
								args.push(options.uri);

							//if(options.id)
								//args.push(options.id);

							//if(options.rev)
								//args.push(options.rev);

							//if(options.data)
								//args.push(options.data);


							//let req_func = null;
							//let db = keys[0];
							//let cache = keys[1];
							//let cache_result;

							//if(db){
								//let name = re.exec(options.uri)[1];
								//req_func = this.request['database'](name);
								////console.log('---DB----');
								////console.log(name);
								//////console.log(req_func['info'](response));
							//}
							//else{
								//////console.log(this.request);
								//let req_func = new Munin(this.options.host, this.options.port);
								let req_func = this.request;

							//}



							//if(!cache || (!cache_result && cache.optional)){
								//console.log('---NO CACHE----');

								args.push(response);

								//////console.log(req_func[verb](args[0]))



								if(args.length == 0)
									args = null;

								if(args.length == 1)
									args = args[0];

								debug_internals('verb %s', verb);
								debug_internals('arguments %o', args);
								//console.log(args);
								////console.log(verb);
								////console.log(conn);

								//req_func['connect'](function(client){
									//console.log(client);
									//console.log(typeOf(client));
									//if(typeOf(client) != 'object' || client == false){
										//debug_internals('connect error %o', client);
										//this.fireEvent(this.ON_CONNECT_ERROR, {error: client });
									//}
									//else{

										//req_func[verb].attempt(response, req_func);

										req_func[verb].attempt(args, req_func);
										//try{

										//debug_internals('%o', req_func[ver]);

											//req_func[verb](response);
										//}
										//catch(e){
											//console.log(e);
										//}
									//}

								//}.bind(this));



							//}

						}

					}.bind(this));

					if(!uri_matched)
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
				}
				else{
					////console.log(routes);
					throw new Error('No routes defined for method: '+verb.toUpperCase());

				}

				////console.log('returning...', request);

				//return request;

			}.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc

		}.bind(this));

	},
	use: function(mount, app){
		//debug('use %o', app);
		debug('use instanceOf(app, AppMuninClient) %o', instanceOf(app, AppMuninClient));
		//console.log(instanceOf(app, AppMuninClient));

		if(instanceOf(app, AppMuninClient) === true)
			this.parent(mount, app);


	}



});

module.exports = AppMuninClient;
