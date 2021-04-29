'use strict'

//let Moo = require("mootools"),
const App = require('../node-app'),
		path = require('path'),
		fs = require('fs'),
		request = require('request'),
		pathToRegexp = require('path-to-regexp'),
		semver = require('semver');

const debug = require('debug')('app-http-client'),
			debug_events = require('debug')('app-http-client:Events'),
			debug_internals = require('debug')('app-http-client:Internals')
////let Logger = require('node-express-logger'),
//let Authorization = require('node-express-authorization');
	////Authentication = require('node-express-authentication');



let AppHttpClient = new Class({
  //Implements: [Options, Events],
  Extends: App,

	__routes_applied: false,
	__api_routes_applied: false,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',
	connected: false,

  request: null,

  api: {},

  methods: ['put', 'patch', 'post', 'head', 'del', 'delete', 'get'],
  //methods: require('methods'),

  //logger: null,
  authorization:null,
  //authentication: null,
  _merged_apps: {},

  options: {

		//id: '',
		//path: '',

		scheme: 'http',
		host: '127.0.0.1',
		port: 8080,

		headers: {},

		jar: false,

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


		content_type: 'text/plain',
		gzip: true,

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

		api: {

			content_type: 'application/json',

			path: '',

			version: '0.0.0',

			versioned_path: false, //default false

			//accept_header: 'accept-version', //implement?

			/*routes: {
				get: [
					{
					path: '',
					callbacks: ['get_api'],
					content_type: 'application/x-www-form-urlencoded',
					//version: '1.0.1',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '2.0.0',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '1.0.1',
					},
				],
				post: [
					{
					path: '',
					callbacks: ['check_authentication', 'post'],
					},
				],
				all: [
					{
					path: '',
					callbacks: ['get'],
					version: '',
					},
				]

			},*/


			/*doc: {
				'/': {
					type: 'function',
					returns: 'array',
					description: 'Return an array of registered servers',
					example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

				}
			},*/
		},
  },
  initialize: function(options, _request){
		// debug('initialize', options)
		// process.exit(1)
		if(
			this.options.api
			&& this.options.api.path
			&& this.options.api.path.indexOf('/') == 0
		)
			delete options.api.path

		this.parent(options);//override default options
		if(_request){
			this.request = _request;
		}
		else{
			this.request = request;
		}


		/**
		 * authorization
		 * - start
		 * */
		 //if(this.options.authorization && this.options.authorization.init !== false){
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

	 // debug('initialize', this)
	 // process.exit(1)

		// if(this.options.api && this.options.api.routes)
		// 	this.__apply_routes(this.options.api.routes, true);
		//
		// this.__apply_routes(this.options.routes, false);


  },
	connect: function(){
		if(this.options.api && this.options.api.routes)
			this.__apply_routes(this.options.api.routes, true);

		this.__apply_routes(this.options.routes, false);
	},
  __apply_routes: function(routes, is_api){
		if( (is_api === true && this.__api_routes_applied === false ) || is_api === false && this.__routes_applied === false){
			if(is_api === true) this.__api_routes_applied = true
			else this.__routes_applied

			let uri = '';

			/**
			* @Review
			*
			**/
			if(this.options.authentication &&
				this.options.authentication.basic &&
				(this.options.authentication.user || this.options.authentication.username) &&
				(this.options.authentication.pass || this.options.authentication.password))
			{
				let user = this.options.authentication.user || this.options.authentication.username;
				let passwd = this.options.authentication.pass || this.options.authentication.password;
				uri = this.options.scheme+'://'+user+':'+passwd+'@'+this.options.host+':'+this.options.port;
			}
			else{
				uri = this.options.scheme+'://'+this.options.host+':'+this.options.port;
			}

			// uri = this.options.scheme+'://'+this.options.host+':'+this.options.port;

			let instance
			let api = this.options.api;

			// if(is_api){
			// 	//path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
			// 	instance = this.api;
			// }
			// else{
			// 	//path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
			// 	instance = this;
			// }
			let self = this

			let __callback = function(verb, original_func, options, callback_alt){
				// debug('instance[verb]', self, verb, original_func, options, callback_alt)
				// process.exit(1)
				//console.log('---gets called??---')
				//console.log(arguments);

				let request;//the request object to return

				let path = '';
				if(is_api){
					path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
				}
				else{
					path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
				}


				options = options || {};

				if(options.auth === false || options.auth === null){
					delete options.auth;
				}
				else if(!options.auth &&
					this.options.authentication &&
					(this.options.authentication.user || this.options.authentication.username) &&
					(this.options.authentication.pass || this.options.authentication.password))
				{
					options.auth = this.options.authentication;
				}

				let content_type = '';
				let version = '';

				if(is_api){
					content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
					version = (typeof(api.version) !== "undefined") ? api.version : '';
				}
				else{
					content_type = (typeof(this.options.content_type) !== "undefined") ? this.options.content_type : '';
				}

				let gzip = this.options.gzip || false;

				//console.log('---ROUTES---');
				//console.log(routes);

				if(routes[verb]){
					let uri_matched = false;

					Array.each(routes[verb], function(route){

						content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
						gzip = route.gzip || false;

						let keys = []
						let re = pathToRegexp(route.path, keys);

						////console.log('route path: '+route.path);
						//////console.log(re.exec(options.uri));
						////console.log('options.uri: '+options.uri);
						////console.log(path);
						////console.log('--------');

						if(options.uri != null && re.test(options.uri) == true){
							uri_matched = true;

							let callbacks = [];

							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									////console.log('route function: ' + fn);

									//if the callback function, has the same name as the verb, we had it already copied as "original_func"
									if(fn == verb){
										callbacks.push({ func: original_func.bind(this), name: fn });
									}
									else{
										callbacks.push({ func: this[fn].bind(this), name: fn });
									}

								}.bind(this));
							}

							if(is_api){
								//let versioned_path = '';
								if(api.versioned_path === true && version != ''){
									path = path + '/v'+semver.major(version);
									//path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								}
								else{
									//path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								}
							}

							//if(!is_api){
								path += '/'+options.uri;
							//}

							path = path.replace('//', '/');

							if(path == '/')
								path = '';



							////console.log(path+options.uri);
							////console.log('PATH');
							////console.log(options.uri);
							////console.log(options.uri);

							let merged = {};
							Object.merge(
								merged,
								options,
								{ headers: this.options.headers },
								{
									baseUrl: uri,
									//uri: path+options.uri,
									uri: path,
									gzip: gzip,
									headers: {
										'Content-Type': content_type
									},
									jar: this.options.jar
								}
							);

							request = this.request[verb](
								merged,
								function(err, resp, body){
									////console.log('--default callback---');
									////console.log(arguments);

									// debug('instance[verb]', self, verb, original_func, options, callback_alt)
									// process.exit(1)
									if(err && this.connected === true){
										this.connected = false
										this.fireEvent(this.ON_CONNECT_ERROR, {options: merged, uri: options.uri, route: route.path, error: err });
									}
									else if(err === null && this.connected === false){
										// debug('ON_CONNECT', {options: merged, uri: options.uri, route: route.path, response: resp, body: body })
										// process.exit(1)
										this.connected = true
										this.fireEvent(this.ON_CONNECT, {options: merged, uri: options.uri, route: route.path, response: resp, body: body });
									}


									if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
										let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK[*callback_alt*]';

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

										callback_alt(err, resp, body, {options: merged, uri: options.uri, route: route.path });

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
									}
									else{
										Array.each(callbacks, function(fn){
											let callback = fn.func;
											let name = fn.name;

											let profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK['+name+']';

											if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

											callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });

											if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

										}.bind(this))
									}


								}.bind(this)
							);
						}

					}.bind(this));

					if(!uri_matched)
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
				}
				else{
					////console.log(routes);
					throw new Error('No routes defined for method: '+verb.toUpperCase());

				}

				return request;

			}

			//Array.each(this.available_methods, function(verb){
			Array.each(this.methods, function(verb){

				//console.log('---VERB---');
				//console.log(verb);
				/**
				 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
				 * */
			 	if(is_api) this.api[verb] = __callback.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc
	 			else this[verb] = __callback.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc

			}.bind(this));


		}

	},
	use: function(mount, app){

		if(instanceOf(app, AppHttpClient) === true)
			this.parent(mount, app);
	},



});


module.exports = AppHttpClient;
