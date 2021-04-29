'use strict'

const debug = require('debug')('Server:Apps:Educativa:Input:Imap'),
      debug_internals = require('debug')('Server:Apps:Educativa:Input:Imap:Internals')


let Client = require('../../../modules/js-pipeline.input.imap')

// let App = require('../../../modules/node-app-http-client/load')(Client)



module.exports = new Class({
  Extends: Client,


  options: {
		requests : {
			once: [
			]
		},

    routes: {
			search: [
				{
					path: ':path?',
					callbacks: ['search'],
				},

			],
			fetch: [
				{
					path: ':path?',
					callbacks: ['fetch'],
				},
				
			]
    },
		//
		// api: {
		//
		// 	version: '1.0.0',
		//
		// 	routes: {
		// 		get: [
		// 			{
		// 				path: ':prop',
		// 				callbacks: ['get'],
		// 				//version: '',
		// 			},
		// 			{
		// 				path: '',
		// 				callbacks: ['get'],
		// 				//version: '',
		// 			},
		// 		]
		// 	},
		//
		// },
  },
	fetch: function (err, resp, req){
    debug('fetch', resp, req)
		// process.exit(1)

		req.type = 'fetch'

		if(err){
			//console.log(err);

			if(req.uri != ''){
				this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

			if(this.options.requests.current.type == 'once'){
				this.fireEvent(this.ON_ONCE_DOC_ERROR, err);
			}
			else{
				this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, err);
			}
		}
		else if(resp.length > 0){
			////console.log('success');

      try{

				if(this.options.requests.current.type == 'once'){
  				this.fireEvent(this.ON_ONCE_DOC, [resp, { id: this.options.id, req: req, type: 'once' }]);
  			}
  			else{
  				this.fireEvent(this.ON_PERIODICAL_DOC, [resp, { id: this.options.id, req: req, type: 'periodical' }]);
  			}
      }
      catch(e){
        // console.log(e)
      }

		}

	},
  search: function (err, resp, req){
    debug('search %o', resp, req)
		// process.exit(1)

		if(err){
			//console.log(err);

			if(req.uri != ''){
				this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

			if(this.options.requests.current.type == 'once'){
				this.fireEvent(this.ON_ONCE_DOC_ERROR, err);
			}
			else{
				this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, err);
			}
		}
		else if(resp.length > 0){
			////console.log('success');

      try{
  			Array.each(resp, function(msg){
					this.fetch(Object.merge(Object.clone(req), { uri: req.uri, opts: [msg, {
						markSeen: true,
						envelope: true,
						// bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
						bodies: '',
	      		// struct: true
					}] }))
				}.bind(this))

				if(this.options.requests.current.type == 'once'){
  				this.fireEvent(this.ON_ONCE_DOC, [resp, { id: this.options.id, req: req, type: 'once' }]);
  			}
  			else{
  				this.fireEvent(this.ON_PERIODICAL_DOC, [resp, { id: this.options.id, req: req, type: 'periodical' }]);
  			}
      }
      catch(e){
				debug('search ERR', e)
				process.exit(1)
        // console.log(e)
      }

		}

  },
  initialize: function(options){
		this.parent(options);//override default options
		this.log('imap', 'info', 'imap started');

		// this.addEvent(this.ON_CONNECT, function(){
		// 	this.search({ uri: 'ncasalegno', opts: ['UNSEEN', ['SUBJECT', 'BACKUP:']] })
		// 	// this.search({ uri: 'ncasalegno', opts: ['UNSEEN'] })
		// }.bind(this))

  },
  connect: function(){
    this.parent()

    // this.addEvent(this.ON_USE_APP, function(mount, app){
    //   debug('ON_USE_APP', mount, app, this.options)
    //   // process.exit(1)
    //   app.host = this.options.id
    //   app.periodical = this.options.periodical
    // }.bind(this))
    // // debug('this.imap %o', this.imap)
    // // process.exit(1)
		//
		// try{
		// 	this.api.get({uri: ''});
		// }
		// catch(e){
		// 	////console.log(e);
		// }
	}

});
