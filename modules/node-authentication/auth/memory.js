var Auth = require('./auth');

const debug = require('debug')('node-authentication:auth:memory');

module.exports =  new Class({
  Extends: Auth,

  users: [],

  initialize: function(users){
		this.users = users;
  },

  authenticate: function (username, password, fn) {
		var user = null;
		var error = 'Invalid credentials';

		//try{
    // debug('authenticate', this.users, username, password)

			this.users.each(function(item){

				if(username.token && item.token){
					/**
					 * may add other tokken formats in the future, now just uuid
					 *
					 * */
					if(username.token === item.token.uuid){
						user = username;
						error = null;
						//throw new Error('user found');
					}
				}
				else if(item.username == username && item.password == password){
					//console.log(username)
					//console.log(item)
					user = username;
					error = null;
					//throw new Error('user found');
				}
			});

			//error = 'Invalid user or password';

		//}
		//catch(e){//user found
			////console.log('user found', user);
			////return fn(error, user);
		//}
		debug('user found', error, user);
    // process.exit(1)
		return fn(error, user);
  },
});
