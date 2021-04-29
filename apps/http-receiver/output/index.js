'use strict'

const debug = require('debug')('Server:Apps:HttpReceiver:Output'),
      debug_internals = require('debug')('Server:Apps:HttpReceiver:Output:Internals'),
      debug_events = require('debug')('Server:Apps:HttpReceiver:Output:Events')

// const	mootools = require('mootools')
// let HttpClient = require('js-pipeline.input.httpclient')
let conn = undefined

const HttpClient = require('../../../modules/node-app-http-client'),
      Output = require('../../../modules/js-pipeline.output')

let HttpClientReceiver = new Class({
  Extends: HttpClient,

  options: {

		// requests : {
		// 	// once: [
		// 	// 	{ api: { get: {uri: ''} } },
		// 	// ],
		// 	periodical: [
		// 		{ api: { get: {uri: ''} } },
		// 	],
    //
		// },

		routes: {
		},

		api: {

			version: '1.0.0',

			routes: {
        post: [
					{
						// path: ':prop',
            path: '',
						callbacks: ['post'],
						//version: '',
					},
				],
				get: [
					{
						path: '',
						callbacks: ['get'],
						//version: '',
					}
				]
			},

		},
  },

  post: function (err, resp, body, req){
    debug('HttpClientReceiver post %o', err, resp, body, req.options.uri, this.connected)
    // let index = req.options.qs.index
    //
    if(resp) debug('HttpClientReceiver post %o', resp.statusCode)
    //
    // if(resp && resp.statusCode !== 200){
    //   conn.connected = false
    //   this.connected = false
    //   // this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, error: err })
    // }
      // process.exit(1)

  },
  get: function (err, resp, body, req){
    // let index = req.options.qs.index
    //
    // if(!conn[index]) conn[index] = {}
    //
    if(resp && resp.statusCode === 200){
      conn.connected = true
      this.connected = true
    }
    // else{
    //   conn.connected = false
    //   this.connected = false
    //   // this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, error: err })
    // }
    // //   conn[index].accept = true
    // //   // this.fireEvent(this.ON_ACCEPT, index)
    // // }
    // // else{
    // //   conn[index].accept = false
    // // }

    debug('HttpClientReceiver get', resp)
    // process.exit(1)
  },
  connect: function(){
    this.parent()
    this.api.get({
      uri:'',
      // qs: {
      //   index: index
      // },
      gzip: true
    })
  }
})

/**
 *
 * */
module.exports = new Class({
  // Implements: [Options, Events],
  Extends: Output,
  //
  // // dbs: [],
  // accept: false,
  // conns: [],
  // buffer: [],
  // buffer_expire: 0,
  //
  // ON_CONNECT: 'onConnect',
  // ON_CONNECT_ERROR: 'onConnectError',
  // ON_ACCEPT: 'onAccept',
  //
  // ON_DOC: 'onDoc',
	// //ON_DOC_ERROR: 'onDocError',
  //
	// ON_ONCE_DOC: 'onOnceDoc',
	// //ON_ONCE_DOC_ERROR: 'onOnceDocError',
  //
	// ON_PERIODICAL_DOC: 'onPeriodicalDoc',
  // //ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',
  //
  // ON_SAVE_DOC: 'onSaveDoc',
  // ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',
  //
  // ON_DOC_SAVED: 'onDocSaved',
  __connect_cb: undefined,
  conn: undefined,
  connected: false,

  options: {
		id: null,
    host: '127.0.0.1',
    port: 9080,
    conn: undefined,
    // http:{},
		// conn: [
		// 	{
    //     host: '127.0.0.1',
		// 		port: 9080,
    //     http:{},
		// 		// db: undefined,
    //     // table: undefined,
    //     // rethinkdb: {
    // 		// 	// 'user': undefined, //the user account to connect as (default admin).
    // 		// 	// 'password': undefined, // the password for the user account to connect as (default '', empty).
    // 		// 	// 'timeout': undefined, //timeout period in seconds for the connection to be opened (default 20).
    // 		// 	// /**
    // 		// 	// *  a hash of options to support SSL connections (default null).
    // 		// 	// * Currently, there is only one option available,
    // 		// 	// * and if the ssl option is specified, this key is required:
    // 		// 	// * ca: a list of Node.js Buffer objects containing SSL CA certificates.
    // 		// 	// **/
    // 		// 	// 'ssl': undefined,
    // 		// },
		// 	},
		// ],
    //
		// buffer:{
    //   size: 5,//-1 =will add until expire | 0 = no buffer | N > 0 = limit buffer no more than N
		// 	expire: 5000, //miliseconds until saving
		// 	periodical: 1000 //how often will check if buffer timestamp has expire
		// },

    // insert: {durability: 'soft', returnChanges: false, conflict: 'replace'},
	},
  initialize: function(options, connect_cb){

    if(options.conn)
      this.conn = options.conn

    this.parent(options);
	  // this.r = require('rethinkdb')

    this.__connect_cb = connect_cb

	},
  __connect: function(err, conn){
		debug_events('__connect %o %o', err, conn)
		// process.exit(1)
		if(err){
			// process.exit(1)
			this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, error: err });
			// throw err
		}
		else if(conn){
			this.conn = conn
			this.connected = true
			this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port, conn: conn });
		}
		else if (this.conn && this.connected === true) {
			this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port, conn: conn });
		}
		else{
      this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, error: err });
			// throw err
		}
	},
  connect: function(){
    debug('connect', this.options)
    // process.exit(1)

    let connect_cb = (this.__connect_cb !== undefined && typeOf(this.__connect_cb) ===  "function") ? this.__connect_cb.bind(this) : this.__connect.bind(this)
		debug_events('connect')

    if(this.conn){
			connect_cb(undefined, this.conn)
		}
		else{
			// let opts = {
			// 	host: this.options.host,
			// 	port: this.options.port,
			// 	// db: this.options.db
			// };

      // let conn = new HttpClientReceiver(Object.merge(Object.clone(opts), {path: ''}))
      /**
      * use global conn
      **/
      conn = new HttpClientReceiver(Object.merge(Object.clone(this.options), {path: ''}))
      conn.addEvent(conn.ON_CONNECT, result => connect_cb(undefined, conn))
      /**
      * don't register connect errors, so it will keep trying to post
      **/
      // conn.addEvent(conn.ON_CONNECT_ERROR, err => connect_cb(err, conn))

      conn.connect()
      // debug('INITIALIZE %o', httpconn, conn)
      // process.exit(1)
      // this.conn.api.get({
      //   uri:'',
      //   // qs: {
      //   //   index: index
      //   // },
      //   gzip: true
      // })


		}

  },
  _save_to_output: function(doc){
    debug_internals('_save_to_output', doc, this.connected);
    // process.exit(1)
    this._save_docs(doc);
    // if(this.connected === true){
    //   this._save_docs(doc);
    // }
    // else{
    //   let _save = function(){
    //     this._save_docs(doc);
    //     this.removeEvent(this.ON_CONNECT, _save)
    //   }.bind(this)
    //   this.addEvent(this.ON_CONNECT, _save)
    // }

  },
  _save_docs: function(doc){
		debug_internals('_save_docs %o %s %o', doc);
    // process.exit(1)
    // process.exit(1)
    // let db = this.options.conn[index].db
    // let table = this.options.conn[index].table
    // let conn = this.conns[index]

    /**
    * use global conn
    **/
    // let conn = this.conn

    conn.api.post({
      // uri: this.conn.options.path,
      uri: '/',
      // qs: {
      //   index: index
      // },
      body: doc,
      json: true,
      gzip: true
    })


	},

});
