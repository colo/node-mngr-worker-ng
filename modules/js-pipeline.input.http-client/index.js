'use strict'

const path = require('path'),
			App = require('../node-app-http-client');

const debug = require('debug')('js-pipeline.input.http-client'),
      debug_events = require('debug')('js-pipeline.input.http-client:Events'),
      debug_internals = require('debug')('js-pipeline.input.http-client:Internals')

module.exports = new Class({
  Extends: App,

	ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

	options: {

		requests : {
      once: [
      ],

      /**
      * periodical data always comes from 'periodical' table
      **/
      periodical: [
      ],

      range: [
      ]

		},

		// routes: {
		// },


  },

  /**
   * http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
   *
   * */
  _flatten_obj: function(data) {
		let result = {};
		function recurse (cur, prop) {
			if (Object(cur) !== cur) {
					result[prop] = cur;
			} else if (Array.isArray(cur)) {
					 for(let i=0, l=cur.length; i<l; i++)
							 recurse(cur[i], prop + "[" + i + "]");
					if (l == 0)
							result[prop] = [];
			} else {
					let isEmpty = true;
					for (let p in cur) {
							isEmpty = false;
							recurse(cur[p], prop ? prop+"."+p : p);
					}
					if (isEmpty && prop)
							result[prop] = {};
			}
		}

		recurse(data, "");
		// debug_internals('_flatten_obj %o', data, result);
		// process.exit(1)

		return result;
	},
	use: function(mount, app){

		let id = Object.keys(this._flatten_obj(mount))[0];
		
		app.options.id = id;

		app.addEvent(app.ON_CONNECT, result => this.fireEvent(this.ON_CONNECT, result))

		// app.addEvent(app.ON_CONNECT_ERROR, function(err){
		// 	debug_events('app.ON_CONNECT_ERROR %o', err);
		//
		// 	this.fireEvent(this.ON_CONNECT_ERROR);
		// }.bind(this));
		app.addEvent(app.ON_CONNECT_ERROR, err => this.fireEvent(this.ON_CONNECT_ERROR, err))

		//throw new Error();
		this.parent(mount, app);
	},
  initialize: function(options){
		options = options || {};
		// options = Object.merge(Conf, options);

		this.parent(options);//override default options

		this.profile('root_init');//start profiling

		// let first_connect = function(result){
		// 	debug_internals('first_connect %o', result);
		// 	// process.exit(1)
		// 	/**
		// 	 * test for a P|CouchDB
		// 	 *
		// 	 * */
		// 	//let db = new RegExp(/(p|c)ouchdb/g);
		// 	//if(db.test(result.body)){
		// 		//options.id = JSON.decode(result.body).uuid;
		// 		//return new CradlePoll(options);
		// 	//}
		// 	///**
		// 	 //* test for a P|CouchDB
		// 	 //*
		// 	 //* */
		// 	//else{
		// 		// this.options.id = JSON.decode(result.body).id;//set ID
		//
		// 		if(Array.isArray(this.options.load)){
		// 			Array.each(this.options.load, function(app){
		// 				// this.load(path.join(process.cwd(), app));
		// 				this.load(app);
		// 			}.bind(this));
		// 		}
		// 		else if(this.options.load){
		// 			// this.load(path.join(process.cwd(), this.options.load));
		// 			this.load(this.options.load);
		// 		}
		//
		// 		//this.load(path.join(__dirname, '../../../../../apps'));
		// 	//}
		// 	this.removeEvent(this.ON_CONNECT, first_connect)
		// }.bind(this);

		// this.addEvent(this.ON_CONNECT, first_connect);

		// this.addEvent(this.ON_CONNECT, function(){this.removeEvent(this.ON_CONNECT, first_connect)});

		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
  },

});
