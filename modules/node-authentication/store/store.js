var moootools = require('mootools');

module.exports =  new Class({
  Implements: [Options, Events],

  ON_ADD: 'onAdd',
  ON_REMOVE: 'onRemove',
  ON_UPDATE: 'onUpdate',

  options: {
  },


  initialize: function(options){
		this.setOptions(options);
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  serialize: function(user, done) {
		done(null, user.id);
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  deserialize: function(id, done) {
		done(new Error('User ' + id + ' does not exist'));
  },
  /**
   * needed for node-express-authentication->passport intregration
   * */
  findByUserName: function(username, callback){
		callback( null );
  },

  findByID: function(id, callback){
		callback( null );
  },
  findByToken: function(token, callback){
		callback( null );
  },

  load: function(users, callback){
		var failed = [];


		users.each(function(u){
			this.add(u, function(err, user){
				failed.push([err, user]);
			});
		}.bind(this));

		callback(failed);
	},
	list: function(callback){
		callback(this.users);
	},
	add: function(user, callback){

		if(user instanceof Error){
			callback(user.message, user.user);
		}
		else{
			this.fireEvent(this.ON_ADD, user);
			callback(null, user);
		}

	},
	remove: function(user, callback){
		if(user instanceof Error){
			callback(user.message, user.user);
		}
		else{
			this.fireEvent(this.ON_REMOVE, user);
			callback(null, user);
		}

	},
	update: function(user, callback){

		if(user instanceof Error){
			callback(user.message, user.user);
		}
		else{
			this.fireEvent(this.ON_UPDATE, user);
			callback(null, user);
		}

	},
	//removeByUserName: function(username, callback){
		//var user = this.findByUserName(username);
		//if(user != null)
			//user = this.remove(user);

		//callback(null, user);
	//},
	//removeByID: function(id, callback){
		//var user = this.findByID(id);
		//if(user != null)
			//user = this.remove(user);

		//callback(null, user);
	//},
	//updateByUserName: function(username, callback){
		//var user = this.findByUserName(username);
		//if(user != null)
			//user = this.update(user);

		//callback(null, user);
	//},
	//updateByID: function(id, callback){
		//var user = this.findByID(id);

		//if(user != null)
			//user = this.update(user);

		//callback(null, user);
	//},
	save: function(callback){
		callback(null, false);
	}
});
