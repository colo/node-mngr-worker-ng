'use strict'

// var App = require('node-app-http-client');
let App = require('../../../../modules/node-app-http-client')

const debug = require('debug')('Server:Apps:OS:Input:OS:index')

module.exports = new Class({
  Extends: App,

  //ON_CONNECT: 'onConnect',
  //ON_CONNECT_ERROR: 'onConnectError',

  options: {

		requests : {
			once: [
				{ api: { get: {uri: ''} } },
			],
			periodical: [
				{ api: { get: {uri: ''} } },
			],

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
  //get_prop: function (err, resp, body, req){

		//if(err){
			//this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1)+'Error', err);//capitalize first letter
		//}
		//else{
			//this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1), body);//capitalize first letter
		//}

	//},
  get: function (err, resp, body, req){
		debug('OS GET', body, this.host)
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
		else{
			////console.log('success');

      try{
        let decoded_body = {}
        decoded_body = JSON.decode(body)

        // if(req.uri != ''){
  			// 	this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1), decoded_body);//capitalize first letter
  			// }
  			// else{
  			// 	this.fireEvent('onGet', decoded_body);
  			// }

  			//this.fireEvent(this.ON_DOC, JSON.decode(body));

  			if(this.options.requests.current.type == 'once'){

  				this.fireEvent(this.ON_ONCE_DOC, { data: decoded_body, host: this.host, module: this.options.id, type: 'once' });
  			}
  			else{
  				// var original = JSON.decode(body);
  				var doc = {};

  				doc.loadavg = decoded_body.loadavg;
  				doc.uptime = decoded_body.uptime;
  				doc.freemem = decoded_body.freemem;
  				doc.totalmem = decoded_body.totalmem;
  				doc.cpus = decoded_body.cpus;
  				doc.networkInterfaces = decoded_body.networkInterfaces;

  				this.fireEvent(this.ON_PERIODICAL_DOC, { data: doc, host: this.host, module: this.options.id, type: 'periodical' });

  				////console.log('STATUS');
  			}

      }
      catch(e){
        // console.log(e)
      }




		}

  },
  initialize: function(options){
    // debug('initialize')
    // process.exit(1)

		this.parent(options);//override default options

    this.connect()

    // try{
		// 	this.api.get({uri: ''});
		// }
		// catch(e){
		// 	////console.log(e);
		// }

		this.log('os', 'info', 'os started');
  },


});
