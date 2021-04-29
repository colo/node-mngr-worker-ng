'use strict'

const debug = require('debug')('Server:Apps:HttpReceiver:Input'),
      debug_internals = require('debug')('Server:Apps:HttpReceiver:Input:Internals')

require('http').globalAgent.maxSockets = Infinity
require('https').globalAgent.maxSockets = Infinity

// let HttpServer = require('js-pipeline.input.http-server')
const App = require('../../../modules/js-pipeline.input.http-server')

// const bodyParser = require('body-parser'),
const express = require('express'),
      session = require('express-session'),
      compression = require('compression'),
      MemoryStore = require('memorystore')(session), //https://www.npmjs.com/package/memorystore
			cors = require('cors'),
			os = require('os')

const Authentication = require('../../../modules/node-express-authentication'),
      AuthMemoryStore = new require('../../../modules/node-authentication').MemoryStore,
      MemoryAuth = require('../../../modules/node-authentication').MemoryAuth

module.exports = new Class({
  Extends: App,

  options: {
    // host: '127.0.0.1',
    // port: 8080,
		id: 'HttpReceiver',
		path: '',

    logs: {
			loggers: {
				error: null,
				access: null,
				profiling: null
			},

			path: './logs',

		},

		// // authentication: {
		// // 	users : [
		// // 			{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
		// // 	],
		// // },
    //
		// logs: null,
    //
		// //authorization: {
		// 	//config: path.join(__dirname,'./rbac.json'),
		// //},
    //
		// // params: {
		// // 	event: /exit|resume|suspend|once|range/
		// // },

		middlewares: [
      compression(),
			express.json({limit: '50mb'}),
			express.urlencoded({ limit: '50mb', extended: true }),
			cors({
				'exposedHeaders': ['Link', 'Content-Range']
			})
	  ],

    routes: {},
	  api: {

			version: '1.0.0',

			routes: {
				get: [
					{
						path: '',
						callbacks: ['get'],
            // roles: ['mngr']
					}
				],
				post: [
					// {
					// 	path: ':prop',
					// 	callbacks: ['404'],
					// 	//version: '',
					// },
					// {
					// 	path: ':path',
					// 	callbacks: ['post'],
          //   // roles: ['mngr']
					// },
          {
						path: '',
						callbacks: ['post'],
            // roles: ['mngr']
					},
				],
        all: [

				]
			},

		},
  },
	get: function (req, resp, next){
    debug('GET %o', req.params, req.body, req.query)
		resp.json({id: this.options.id+':'+os.hostname()})
	},
  post: function (req, resp, next){
		debug('POST %o', req.params, req.body, req.query)
    resp.json({status: 'accepted'})

    this.fireEvent(
      this.ON_DOC,
      [
        // {
        //   'log' : line,
        //   'domain': this.options.domain,
        //   'counter':this.lines_counter,
        //   'input': 'tail'
        // },
        req.body,
        {id: this.id, type: 'periodical', input_type: this, app: this}
      ]
    )

    // debug('POST %o', req.params, req.body, req.query)
    // process.exit(1)
    // next()
  },
  initialize: function(options){
    debug('initialize', options)
    // process.exit(1)
    this.addEvent(this.ON_INIT_AUTHENTICATION, function(authentication){
      /**
  		 * add 'check_authentication' & 'check_authorization' to each route
  		 * */
  		Object.each(this.options.api.routes, function(routes, verb){

  			// if(verb != 'all'){
  				Array.each(routes, function(route){
  					// debug('route: ', verb, route);
  					// route.callbacks.unshift('check_authorization');
  					route.callbacks.unshift('check_authentication');
            debug('route: ', verb, route);

  					// if(verb == 'get')//users can "read" info
  					// 	route.roles = ['user']
  				}.bind(this));
  			// }

  		}.bind(this));

    }.bind(this));

    options.session = session({
				store: new MemoryStore({
					checkPeriod: 3600000 // prune expired entries every hour
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: '19qX9cZ3yvjsMWRiZqOn',
				resave: true,
				saveUninitialized: false,
				name: 'mngr',
				unset: 'destroy'
		});

    let store, auth
    store = new AuthMemoryStore(options.authentication.users)
  	auth = new MemoryAuth(options.authentication.users)

    options.authentication = new Authentication({
			store: store,
			auth: auth,
			passport: {session: (options.session) ? true : false}
		})
    // options.authentication = {
    //   module: Authentication,
		// 	store: store,
		// 	auth: auth,
		// 	passport: {session: (options.session) ? true : false}
		// }
    this.parent(options)

  }
})
