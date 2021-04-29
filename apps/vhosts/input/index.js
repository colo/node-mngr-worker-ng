'use strict'

const debug = require('debug')('Server:Apps:Vhosts:Input:Nginx'),
      debug_internals = require('debug')('Server:Apps:Vhosts:Input:Nginx:Internals')


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

  },
  initialize: function(options){

		this.parent(options);//override default options
		this.log('nginx', 'info', 'nginx started');
  },
  connect: function(){
    this.parent()
    if(!this.nginx || !this.nginx.vhosts)
      this.load(this.options.load)

		try{
			this.api.get({uri: ''});
		}
		catch(e){
			////console.log(e);
		}
	}

});
