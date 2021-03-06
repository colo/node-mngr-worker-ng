'use strict'

const Moo = require("mootools"),
		path = require("path"),
		BaseApp = require ('./base.conf');

var session = require('express-session'),
		MemoryStore = require('memorystore')(session), //https://www.npmjs.com/package/memorystore
		helmet = require('helmet');
		//winston = require('winston');

/**
 * Requiring `winston-logstash` will expose
 * `winston.transports.Logstash`
 * */
//require('winston-logstash');

/*
var common = require('winston/lib/winston/common');


var trasnform = function (level, msg, meta, self) {
    return common.log({
        level: level,
        message: msg,
        node_name: self.node_name,
        meta: meta,
        timestamp: self.timestamp,
        json: true,
        label: self.label,
    });
};*/

module.exports = new Class({
  Extends: BaseApp,

  options: {

		pipelines: require('../etc/pipelines'),

		// input: {
		// 	poll: {
		// 		"localhost" : [
		// 			{scheme: 'http', host:'127.0.0.1', port: 8081},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8082},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8083},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8084},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8085},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8086},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8087},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8088},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8089},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8090},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8091},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8092},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8093},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8094},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8095},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8096},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8097},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8098},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8099},
		// 			//{scheme: 'http', url:'127.0.0.1', port: 8100},
		// 		],
		// 	}
		// },

		logs: {
			loggers: {
				error: null,
				access: null,
				profiling: null
			},

			path: './logs',

			//default: [
				//{ transport: '//console', options: { colorize: 'true', level: 'warning' } },
				//{ transport: 'logstash', options: {level: 'info', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' } }
			//]
			//default: [
				//{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				//{ transport: winston.transports.Logstash, options: {transform: trasnform, level: 'info', port: 28777, node_name: 'mngr-api', host: '192.168.0.40' } }
			//]
		},

		authentication: {
			users : [
				{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
				//{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
				/**
				 * *curl -H "Content-Type:application/json" -H "Accept:application/json" -H "Authorization: Basic bGJ1ZW5vOjEyMw==" http://localhost:8081/
				 * */
				{ id: 2, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
				{ id: 3, username: 'test' , role: 'user', password: '123'}
			],
		},

	},
	initialize: function(options){

		//this.options.middlewares.unshift(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
		this.options.middlewares.unshift(helmet());

		this.options.session = session({
				store: new MemoryStore({
					checkPeriod: 3600000 // prune expired entries every hour
				}),
				cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
				secret: 'jtDy5mbXaYIUAXaDjdf6',
				resave: true,
				saveUninitialized: false,
				name: 'mngr.poller',
				unset: 'destroy'
		});

		// if(process.env.NODE_ENV === 'production'){
		// 	/**
		// 	 * add 'check_authentication' & 'check_authorization' to each route
		// 	 * */
		// 	Object.each(this.options.api.routes, function(routes, verb){
    //
		// 		if(verb != 'all'){
		// 			Array.each(routes, function(route){
		// 				//debug('route: ' + verb);
		// 				route.callbacks.unshift('check_authorization');
		// 				route.callbacks.unshift('check_authentication');
    //
		// 				if(verb == 'get')//users can "read" info
		// 					route.roles = ['user']
		// 			});
		// 		}
    //
		// 	});
		// }

		this.parent(options);//override default options


	}

});
