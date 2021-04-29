'use strict'

var debug = require('debug')('Server:Apps:Web-Apis:Input:AbuseIPDB:Check');
var debug_internals = require('debug')('Server:Apps:Web-Apis:Input:AbuseIPDB:Check:Internals');
let qs = require('qs')

var App = require('node-app-http-client');

module.exports = new Class({
  Extends: App,

  //ON_CONNECT: 'onConnect',
  //ON_CONNECT_ERROR: 'onConnectError',

  options: {
    path: '/api/v2/check',

    requests : {
			once: [
				{ api: { get: {uri: '?' + qs.stringify({'ipAddress' : '174.142.200.104'})} } },
			],
      // periodical: [
			// 	{ api: { get: {uri: qs.stringify({'ipAddress' : '174.142.200.104'})} } },
			// ],
			// periodical: [
			// 	{ api: { get: {uri: ''} } },
			// ],

		},

    routes: {
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

			// version: '2.0.0',
      versioned_path: false,
      path: '',

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
		//console.log('OS GET');
		//console.log(this.options.requests.current);

    debug('check result', body)
    process.exit(1)
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
    //       // delete decoded_body.loadavg
    //       // delete decoded_body.uptime
    //       // delete decoded_body.freemem
    //       // if(decoded_body.networkInterfaces){
    //       //   Object.each(decoded_body.networkInterfaces, function(data, iface){
    //       //     delete data.recived
    //       //     delete data.transmited
    //       //   })
    //       // }
  	// 			this.fireEvent(this.ON_ONCE_DOC, decoded_body);
  	// 		}
  	// 		else{
  	// 			// var original = JSON.decode(body);
  	// 			var doc = {};
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
    //     // console.log(e)
    //   }
    //
    //
    //
    //
		// }

  },
  initialize: function(options){

		this.parent(options);//override default options

		this.log('abuseipdb', 'info', 'abuseipdb started');
  },


});
