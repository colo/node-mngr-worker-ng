//?format=uid,ppid,etimes,pcpu,pmem,command

'use strict'

let App = require('../../../../modules/node-app-http-client')

const debug = require('debug')('Server:Apps:OS:Input:procs')

module.exports = new Class({
  Extends: App,

  options: {
    id: 'os.procs',
    path: '/os/procs/',

    requests : {
			// once: [
			// 	{ api: { get: {uri: '?format=uid,ppid,etimes,cputime,stat,rss,vsz,pcpu,pmem,ucmd,command'} } },
      //   // { api: { get: {uri: '?stat=["ppid","state", "comm", "starttime", "utime", "stime", "rss", "vsize"]&status=["Uid", "Gid"]&argv'} } },
			// ],
			periodical: [
				{ api: { get: {uri: '?format=uid,ppid,etimes,cputime,stat,rss,vsz,pcpu,pmem,ucmd,command'} } },
        // { api: { get: {uri: '?stat=["ppid","state", "comm", "starttime", "utime", "stime", "rss", "vsize"]&status=["Uid", "Gid"]&argv'} } },
			],

		},

		routes: {
		},

		api: {

      // path: '/os/procs',

			version: '1.0.0',

			routes: {
				get: [
					//{
						//path: ':proc',
						//callbacks: ['get_proc'],
						//version: '',
					//},
					//{
						//path: ':proc/:prop',
						//callbacks: ['get_proc'],
						//version: '',
					//},
					{
						path: ':format',
						callbacks: ['get'],
						version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				]
			},

		},
  },
  //get_proc: function (err, resp, body, req){
		////console.log('OS PROCS get_proc');
		////console.log(req);

		////console.log('error');
		////console.log(err);

		//////console.log('resp');
		//////console.log(resp);

		////console.log('body');
		////console.log(body);

  //},
  get: function (err, resp, body, req){
    // debug('get', req, this)
    // process.exit(1)
		//console.log('OS PROCS get');
		////console.log(req);
		////console.log(JSON.decode(body));

		//throw new Error();

		////console.log('error');
		////console.log(err);

		//////console.log('resp');
		//////console.log(resp);

		////console.log('body');
		////console.log(body);
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
			 //console.log('success', body);

			// if(req.uri != ''){
			// 	this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1), JSON.decode(body));//capitalize first letter
			// }
			// else{
			// 	this.fireEvent('onGet', JSON.decode(body));
			// }

			//this.fireEvent(this.ON_DOC, JSON.decode(body));

      let doc = { data: JSON.decode(body), host: this.host, module: this.options.id }
      // if(this.periodical)
      //   doc.periodical = this.periodical

			if(this.options.requests.current.type == 'once'){
				this.fireEvent(this.ON_ONCE_DOC, doc);
			}
			else{
				this.fireEvent(this.ON_PERIODICAL_DOC, doc);
			}


		}
  },
  initialize: function(options){
    // debug('initialize')
    // process.exit(1)

		this.parent(options);//override default options

    this.connect()

		this.log('os-procs', 'info', 'os-procs started');
  },

});
