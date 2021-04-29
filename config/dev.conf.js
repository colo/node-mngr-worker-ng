'use strict'

const Moo = require("mootools"),
		fs = require('fs'),
		path = require('path'),
		BaseApp = require ('./base.conf');

//let winston = require('winston');
let debug = require('debug')('Server:App:Config:Dev');
let debug_internals = require('debug')('Server:App:Config:Dev:Internals');

let Logger = require('../modules/node-express-logger'),
		Authentication = require('../modules/node-express-authentication'),
		Authorization = require('../modules/node-express-authorization');


/**
* Authenticationn
**/
let users = [
		{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
		{ id: 2, username: 'test' , role: 'user', password: '123'}
]

let store, auth

let MemoryStore = new require('node-authentication').MemoryStore;
store = new MemoryStore(users)
let MemoryAuth = require('node-authentication').MemoryAuth;
auth = new MemoryAuth(users)

/**
* Authorization
**/
// let rbac = JSON.decode(fs.readFileSync('./rbac.json' , 'ascii'))
let rbac = require(path.join(process.cwd(), 'config/rbac.js'))
// let authorization = new Authorization(rbac)

// authorization.processRules(
// 	rules
// )

module.exports = new Class({
  Extends: BaseApp,

  options: {

		// pipelines: require('../devel/etc/pipelines'),

		authentication: {
			module: Authentication,
			store: store,
			auth: auth,
			passport: {session: true }
		},

		authorization: {
			module: Authorization,
			...rbac
		},
		operations_routes: true,

		logs: new Logger({
			loggers: {
				error: null,
				access: null,
				profiling: null
			},

			path: './logs',

			//default: [
				//{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				//{ transport: winston.transports.File, options: {level: 'info', filename: null } }
			//]
		}),



	},

});
