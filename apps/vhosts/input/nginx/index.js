'use strict'

const debug = require('debug')('Server:Apps:Vhosts:Input:Nginx'),
      debug_internals = require('debug')('Server:Apps:Vhosts:Input:Nginx:Internals')


// // let App = require('node-app-http-client');
// let Client = require('../../../../modules/js-pipeline.input.http-client')
//
// let App = require('../../../../modules/node-app-http-client/load')(Client)
let App = require('../../../../modules/node-app-http-client')

module.exports = new Class({
  Extends: App,

  // ON_CONNECT: 'onConnect',
  // ON_CONNECT_ERROR: 'onConnectError',

  options: {
    // path: 'nginx',
		requests : {
			// once: [
			// 	{ api: { get: {uri: ''} } },
			// ],
			// periodical: [
			// 	{ api: { get: {uri: ''} } },
			// ],

		},

    routes: {
      // path: 'nginx',
      // get: [
      //   {
      //     path: ':prop',
      //     callbacks: ['get'],
      //     //version: '',
      //   },
      //   {
      //     path: '',
      //     callbacks: ['get'],
      //     //version: '',
      //   },
      // ]
    },

		api: {
      // path: 'nginx',

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
    debug('get %o %o', err, body)
    // process.exit(1)

    // if(err !== null){
    //   this.connected = false
		// 	// this.fireEvent(this.ON_CONNECT_ERROR, { host: this.options.host, port: this.options.port, error: err });
    // }
    // else{
    //   this.options.id = JSON.decode(body).id;//set ID
    //   this.connected = true
		// 	// this.fireEvent(this.ON_CONNECT, {host: this.options.host, port: this.options.port });
    // }


		//console.log('OS GET');
		//console.log(this.options.requests.current);

		// if(err){
		// 	//console.log(err);
    //
		// 	if(req.uri != ''){
		// 		this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1)+'Error', err);//capitalize first letter
		// 	}
		// 	else{
		// 		this.fireEvent('onGetError', err);
		// 	}
    //
		// 	this.fireEvent(this.ON_DOC_ERROR, err);
    //
		// 	if(this.options.requests.current.type == 'once'){
		// 		this.fireEvent(this.ON_ONCE_DOC_ERROR, err);
		// 	}
		// 	else{
		// 		this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, err);
		// 	}
		// }
		// else{
		// 	////console.log('success');
    //
    //   try{
    //     let decoded_body = {}
    //     decoded_body = JSON.decode(body)
    //
    //     if(req.uri != ''){
  	// 			this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1), decoded_body);//capitalize first letter
  	// 		}
  	// 		else{
  	// 			this.fireEvent('onGet', decoded_body);
  	// 		}
    //
  	// 		//this.fireEvent(this.ON_DOC, JSON.decode(body));
    //
  	// 		if(this.options.requests.current.type == 'once'){
  	// 			this.fireEvent(this.ON_ONCE_DOC, decoded_body);
  	// 		}
  	// 		else{
  	// 			// let original = JSON.decode(body);
  	// 			let doc = {};
    //
  	// 			doc.loadavg = decoded_body.loadavg;
  	// 			doc.uptime = decoded_body.uptime;
  	// 			doc.freemem = decoded_body.freemem;
  	// 			doc.totalmem = decoded_body.totalmem;
  	// 			doc.cpus = decoded_body.cpus;
  	// 			doc.networkInterfaces = decoded_body.networkInterfaces;
    //
  	// 			this.fireEvent(this.ON_PERIODICAL_DOC, doc);
    //
  	// 			////console.log('STATUS');
  	// 		}
    //
    //   }
    //   catch(e){
    //     console.log(e)
    //   }
    //
    //
    //
    //
		// }

  },
  initialize: function(options){

		this.parent(options);//override default options

    // let test = function(){
    // 	debug('test', this, arguments)
    // 	process.exit(1)
    // }
    // this.addEvent(this.ON_USE, test)
    // this.addEvent(this.ON_CONNECT, test)
    // this.addEvent(this.ON_CONNECT_ERROR, test)


    // if(this.options.load){
		// 	this.load(this.options.load);
		// }

    // debug('initialize', this.options)
    // process.exit(1)
    // if(this.options.load){
    //
		// 	this.load(this.options.load);
    //
		// }

		this.log('nginx', 'info', 'nginx started');
  },
  // connect: function(){
  //   this.parent()
  //   // if(!this.nginx || !this.nginx.vhosts)
  //   //   this.load(this.options.load)
  //
	// 	debug('this.connect');
	// 	try{
	// 		//this.os.api.get({uri: 'hostname'});
	// 		this.api.get({uri: ''});
	// 	}
	// 	catch(e){
	// 		////console.log(e);
	// 	}
	// }

});
