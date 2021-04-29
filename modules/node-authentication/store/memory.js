var Store = require('./store');

module.exports =  new Class({
  Extends: Store,

  users: [],

  options: {
  },

  initialize: function(users, callback){
		if(callback){
			this.load(users, callback);
		}
		else{
			this.load(users, function(failed){
				console.log(failed);
			});
		}
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  //serialize: function(user, done) {
		//done(null, user.id);
  //},
  /**
   * needed for node-express-authentication->passport intregration
   * */
  deserialize: function(id, done) {
		var notFound = true;
		this.users.each(function(user){
			if (user['id'] == id) {
				notFound = false;
				done(null, user);
			}
		});

		if(notFound === true)
			done(new Error('User ' + id + ' does not exist'));

  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  findByUserName: function(username, callback){
		//var user = new Error('user not found');
		var user = false;
		//user.username = username;

		this.users.each(function(u){
			if (u.username == username) {
				user = u;
			}
		});

		callback( user );
  },

  findByID: function(id, callback){
		var user = new Error('user not found');
		user.id = id;

		this.users.each(function(u){
			if (u.id == id) {
				user = u;
			}
		});

		callback( user );
  },
  findByToken: function(token, callback){
		var user = new Error('user not found');
		user.token = token;

		this.users.each(function(u){
			if (u.token) {
				/**
				 * may add other tokken formats in the future, now just uuid
				 *
				 * */
				if(u.token.uuid == token){
					user = u;
				}
			}
		});

		callback( user );
  },
  //load: function(users){
		//users.each(function(u){
			//this.add(u);
		//}.bind(this));
	//},

	add: function(user, callback){

		if(user.id && user.username){
			this.users.push(user);
			this.parent(user, callback);
		}
		else{
			 //throw new Error('Invalid id|username format');
			 var err = new Error('Invalid id|username format');
			 err.user = user;
			 this.parent(err, callback);
		}
	},
	remove: function(user, callback){
		try{
			this.users.each(function(u, index){
				if(u.id == user.id && u.username == user.username){
					 this.users.splice(index, 1);
					 throw new Error('user found');
				}
			}.bind(this));

			var err = new Error('user not found');
			err.user = user;
			this.parent(err, callback);
		}
		catch(e){
			//console.log(e);

			this.parent(user, callback);
		}


	},
	update: function(user, callback){
		try{
			this.users.each(function(u, index){
				if(u.id == user.id && u.username == user.username){
					 //this.users.splice(index, 1);
					 this.users[index] = user;
					 throw new Error('user found');
				}
			}.bind(this));

			var err = new Error('user not found');
			err.user = user;

			this.parent(err, callback);
		}
		catch(e){
			//console.log(e);

			this.parent(user, callback);
		}


	},
	save: function(callback){
		callback(null, true);
	}
});
