'use strict'

const debug = require('debug')('Server:Apps:OS:Input:OS'),
      debug_internals = require('debug')('Server:Apps:OS:Input:OS:Internals')


let Client = require('../../../modules/js-pipeline.input.http-client')

let App = require('../../../modules/node-app-http-client/load')(Client)
// let App = require('../../../modules/node-app-http-client')

module.exports = new Class({
  Extends: App,


  options: {
		requests : {
		},

    routes: {
    },

		api: {

			version: '1.0.0',

			routes: {
				get: [
					{
						path: ':prop',
						callbacks: ['get'],
						//version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						//version: '',
					},
				]
			},

		},
  },

  get: function (err, resp, body, req){
    debug('get %o %o', err, body)

    if(err === null)
      this.options.id = JSON.decode(body).id;//set ID

    if(!this.os){
      for(let i = 0; i < this.options.load.length; i++){
        let app = this.options.load[i]
        this.load(app)
      }

    }
  },
  initialize: function(options){
		this.parent(options);//override default options
		this.log('os', 'info', 'os started');

  },
  connect: function(){
    this.parent()

    this.addEvent(this.ON_USE_APP, function(mount, app){
      debug('ON_USE_APP', mount, app, this.options)
      // process.exit(1)
      app.host = this.options.id
      app.periodical = this.options.periodical
    }.bind(this))
    // debug('this.os %o', this.os)
    // process.exit(1)

		try{
			this.api.get({uri: ''});
		}
		catch(e){
			////console.log(e);
		}
	}

});
