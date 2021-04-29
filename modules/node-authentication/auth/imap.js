var Auth = require('./auth');

var Imap = require('imap');

module.exports =  new Class({
  Extends: Auth,

  options: {
		host: 'localhost',
		port: 143,
    autotls: 'always',
		tls: false,
    // tlsOptions: {
    //   maxVersion: 'TLSv1.2',
    //   minVersion: 'TLSv1.2',
    // },
    // debug: function(debug){
    //   console.log(debug)
    // }
  },

  initialize: function(options){
		this.parent(options);
  },
  authenticate: function (username, password, fn) {

		var imap = new Imap(Object.merge({
			user: username,
			password: password
		}, this.options));

    imap.once('ready', function() {
      imap.end()
      return fn(null, username);
    })
    imap.once('error', function(err) {
      return fn(err, null)
    });

    imap.once('end', function() {
      // console.log('Connection ended');
    });

    imap.connect();//connect


  },
});
