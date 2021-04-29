'use strict'

//var App = require('node-app-http-client'),
const path = require('path');

const App = require('../node-app-imap-client');

var debug = require('debug')('js-pipeline.input.Imap');
var debug_events = require('debug')('js-pipeline.input.Imap:Events');
var debug_internals = require('debug')('js-pipeline.input.Imap:Internals');

module.exports = new Class({
	Extends: App,

	options: {

	  requests : {
			once: [],
			periodical: [],
			range: [],
			//monitor: [],
			//config: [],
		},

		id: '',
		path: '',

		// authentication: {
		// 	username: 'username',
		// 	password: 'username',
		// 	sendImmediately: false,
		// },

		logs: {
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
		},

		// authorization: {
		// 	config: path.join(__dirname,'../../../../../config/rbac.json'),
		// },

		routes: {
			//connect: [
				//{
					//callbacks: ['connect'],
				//}
			//],

		},


  },

  initialize: function(options){
		debug('init %o', options);

		this.parent(options);//override default options

		debug('init %o', options);

		this.profile('imap_init');//start profiling

		var first_connect = function(resp){
			debug_internals('first_connect %o', resp);
			// process.exit(1)
			let path = (!resp.path || resp.path === '') ? '/' : resp.path
			this.options.id = resp.host+'.'+resp.user+'.'+resp.mailbox+path;

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

		// this.addEvent(this.ON_CONNECT_ERROR, function(err){
		// 	debug('ON_CONNECT_ERROR', this.ON_CONNECT_ERROR, err)
		// 	// process.exit(1)
		// });


		this.profile('imap_init');//end profiling

		this.log('imap', 'info', 'imap started');
  },
  //connect: function(){
		//debug('this.connect');

		//try{
			//this.connect();
		//}
		//catch(e){
			////console.log(e);
		//}
	//}
});
