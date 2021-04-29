var Store = require('./store');

let debug = require('debug')('node-authentication:auth:rethinkdb'),
    debug_events = require('debug')('node-authentication:auth:rethinkdb:Events'),
    debug_internals = require('debug')('node-authentication:auth:rethinkdb:Internals');



module.exports =  new Class({
  Extends: Store,

  // users: [],
  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

  //request: null,
	conn: undefined,
	connected: false,

  options: {
    host: '127.0.0.1',
    port: '28015',
    db: '',
    table: 'users',
    rethinkdb: {
			// 'user': undefined, //the user account to connect as (default admin).
			// 'password': undefined, // the password for the user account to connect as (default '', empty).
			// 'timeout': undefined, //timeout period in seconds for the connection to be opened (default 20).
			// /**
			// *  a hash of options to support SSL connections (default null).
			// * Currently, there is only one option available,
			// * and if the ssl option is specified, this key is required:
			// * ca: a list of Node.js Buffer objects containing SSL CA certificates.
			// **/
			// 'ssl': undefined,
		},

	},

  connect(err, conn){
		debug_events('connect %o %o', err, conn)
		if(err){
			this.connected = false
			this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, db: this.options.db, error: err });
			throw err
		}
		else if(conn){
			this.conn = conn
			this.connected = true
			this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port, db: this.options.db, conn: conn });
		}
	},
  initialize: function(options, connect_cb){
		// if(callback){
		// 	this.load(users, callback);
		// }
		// else{
		// 	this.load(users, function(failed){
		// 		console.log(failed);
		// 	});
		// }
    this.parent(options);//override default options

		connect_cb = (typeOf(connect_cb) ==  "function") ? connect_cb.bind(this) : this.connect.bind(this)
		this.r = require('rethinkdb')

		if(this.options.conn){
			connect_cb(undefined, this.options.conn)
		}
		else{
			let opts = {
				host: this.options.host,
				port: this.options.port,
				db: this.options.db
			};

			debug_internals('to connect %o ', Object.merge(opts, this.options.rethinkdb))

			this.r.connect(Object.merge(opts, this.options.rethinkdb), connect_cb)
    }
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  serialize: function(user, done) {
    debug('serialize', user)
    // process.exit(1)
		done(null, user.id);
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  deserialize: function(id, done) {
    debug('deserialize', id)
    // process.exit(1)

    this.findByID(id, function(u){
      if (u && u.id == id) {

				done(null, u);
			}
      else{
        done(new Error('User ' + id + ' does not exist'))
      }

    })



  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  findByUserName: function(username, callback){
    this.findByID(username, callback)
		// //var user = new Error('user not found');
		// var user = false;
		// //user.username = username;
    //
		// this.users.each(function(u){
		// 	if (u.username == username) {
		// 		user = u;
		// 	}
		// });
    //
		// return user;
  },

  findByID: function(id, callback){
    debug('findByID', id)
		var user = new Error('user not found');
		user.id = id;

		this.r.table(this.options.table).get(id).run(this.conn, function(err, u){
      if (u && u.id == id) {
  				user = u;
			}
      debug('findByID', err, u)
      callback(user)
    });

  },
  findByToken: function(token, callback){
    var user = new Error('user not found');

    this.r.table(this.options.table).filter(r.row("token").eq(token)).run(this.conn, function(err, u){
      if (u.token) {
				/**
				 * may add other tokken formats in the future, now just uuid
				 *
				 * */
				if(u.token.uuid == token){
					user = u;
				}
			}

      callback(user)
    });

  },

	// add: function(user, callback){
  //
	// 	if(user.id && user.username){
	// 		this.users.push(user);
	// 		this.parent(user, callback);
	// 	}
	// 	else{
	// 		 //throw new Error('Invalid id|username format');
	// 		 var err = new Error('Invalid id|username format');
	// 		 err.user = user;
	// 		 this.parent(err, callback);
	// 	}
	// },
	// remove: function(user, callback){
	// 	try{
	// 		this.users.each(function(u, index){
	// 			if(u.id == user.id && u.username == user.username){
	// 				 this.users.splice(index, 1);
	// 				 throw new Error('user found');
	// 			}
	// 		}.bind(this));
  //
	// 		var err = new Error('user not found');
	// 		err.user = user;
	// 		this.parent(err, callback);
	// 	}
	// 	catch(e){
	// 		//console.log(e);
  //
	// 		this.parent(user, callback);
	// 	}
  //
  //
	// },
	// update: function(user, callback){
	// 	try{
	// 		this.users.each(function(u, index){
	// 			if(u.id == user.id && u.username == user.username){
	// 				 //this.users.splice(index, 1);
	// 				 this.users[index] = user;
	// 				 throw new Error('user found');
	// 			}
	// 		}.bind(this));
  //
	// 		var err = new Error('user not found');
	// 		err.user = user;
  //
	// 		this.parent(err, callback);
	// 	}
	// 	catch(e){
	// 		//console.log(e);
  //
	// 		this.parent(user, callback);
	// 	}
  //
  //
	// },
	// save: function(callback){
	// 	callback(null, true);
	// }
});
