var moootools = require('mootools');

module.exports =  new Class({
  Implements: [Options, Events],
  
  options: {
  },
  
  initialize: function(options){
		this.setOptions(options);
  },
  authenticate: function (username, password, fn) {
		return fn('Invalid user or password', null);
  },
});
