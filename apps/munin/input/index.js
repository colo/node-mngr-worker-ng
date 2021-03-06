'use strict'

let App = require('../../../modules/node-app-munin-client');

let debug = require('debug')('Server:Apps:Munin:Input');
let debug_internals = require('debug')('Server:Apps:Munin:Input:Internals');

let __white_black_lists_filter = function(whitelist, blacklist, str){
  let filtered = false
  if(!blacklist && !whitelist){
    filtered = true
  }
  else if(blacklist && !blacklist.test(str)){
    filtered = true
  }
  else if(blacklist && blacklist.test(str) && (whitelist && whitelist.test(str))){
    filtered = true
  }
  else if(!blacklist && (whitelist && whitelist.test(str))){
    filtered = true
  }

  return filtered
}

const async = require('async')

module.exports = new Class({
  Extends: App,

  //ON_CONNECT: 'onConnect',
  //ON_CONNECT_ERROR: 'onConnectError',
  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',
  ON_DOC_ERROR: 'onDocError',

  modules: [],
  modules_config: {},

  node: undefined,//munin host

  options: {

    // whitelist: /^(users|vmstat|nginx.*)/g,
    // blacklist: /^.*/g, //blacklist all modules
    whitelist: undefined,
    // blacklist: /^[.]/g,
    // blacklist: /^cpu|^if|^load|^netstat|^ntp|^uptime|^df|^irq|^uptime|^users|^interrupts/g,
    blacklist: undefined,

    requests : {
			once: [
        // { nodes: { uri: '' } },
				// // { list: { uri: '' } },
			],
			periodical: [
        {
          list: function(req, next, app){
            if(app.options.id && app.modules.length === 0){
              debug('periodical list %o', app.options.id)

              app.list({uri: ''})
            }
          },
        },
        // {
        //   config: function(req, next, app){
        //     if(app.modules.length > 0){
        //       debug('periodical config %o', app.modules)
        //
        //       async.eachLimit(
        //         app.modules,
        //         1,
        //         function(module, callback){
        //           // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        //           // callback()
        //           let wrapped = async.timeout(function(module){
        //             app.config({uri: module})
        //           }, 100)
        //
        //           // try{
        //           wrapped(module, function(err, data) {
        //             if(err){
        //               // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        //               callback()
        //             }
        //           })
        //           // }
        //           // catch(e){
        //           //   callback()
        //           // }
        //         }
        //       )
        //     }
        //   },
        // },
        {
          fetch: function(req, next, app){
            // if(app.modules.length > 0 && Object.getLength(app.modules_config) > 0){
            if(app.modules.length > 0){
              debug('periodical fetch %o', app.modules)

              async.eachLimit(
                app.modules,
                1,
                function(module, callback){
                  // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
                  // callback()

                  let wrapped = async.timeout(function(module){
                    if(!app.modules_config[module]){
                      app.config({uri: module})
                      // callback()
                    }
                    else{
                      app.fetch({uri: module})
                    }
                  }, 100)

                  // try{
                  wrapped(module, function(err, data) {
                    if(err){
                      // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
                      callback()
                    }
                  })


                  // }
                  // catch(e){
                  //   callback()
                  // }
                }, function(err) {
                  debug('FINISH!!')
                  // app.modules_config = {}
                }
              )
            }
          },
        }
				//{ list: { uri: '' } },
				//{ fetch: { uri: 'cpu' } },
				//{ fetch: { uri: 'if_eth0' } },
				//{ config: { uri: 'if_eth0' } },
				//{ nodes: { uri: '' } },
				//{ quit: { uri: '' } },
			],
			//range: [
				////{ get: {uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'} },
			//],

		},

		routes: {
			fetch: [
				{
					path: ':module',
					callbacks: ['fetch']

				},
			],
      config: [
				{
					path: ':module',
					callbacks: ['config']

				},
			],
			list: [
				{
					path: '',
					callbacks: ['list']

				},
			],
      nodes: [
        {
          path: '',
          callbacks: ['nodes']
        },
      ],
			//quit: [
				//{
					//path: '',
					//callbacks: ['quit']

				//},
			//],
			//config: [
				//{
					//path: ':module',
					//callbacks: ['config']

				//},
			//],
		},

  },
  config: function (err, resp, params){
		// debug('config %o', resp);
		// debug('config params %o', params);

		if(err){
			debug('save err %o', err);

      if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

      if(this.options.requests.current && this.options.requests.current.type)
  			this.fireEvent(
  				this[
  					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
  				],
  				err
  			);
		}
		else{
			////console.log('success');

			if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1), [JSON.decode(resp), {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]);//capitalize first letter
			}
			else{
				this.fireEvent('onGet', [JSON.decode(resp), {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]);
			}


      //if(typeof(resp) == 'array' || resp instanceof Array || Array.isArray(resp))
				//resp = [resp];
      let new_data = {}
      // let mem = /memory/

      if(resp && resp !== null)
        Object.each(resp, function(data, key){
          let new_key = key.replace(/\_/, '')

          // if(mem.test(params.uri))
          //   data = (data / 1024 / 1024).toFixed(2) * 1

          new_data[new_key] = data
          // delete resp[key]
        })

      // debug('modified data %o', new_data);

			let doc = {};
			doc.data = new_data
			doc.id = params.uri
      // doc.host = this.options.host
      doc.host = this.node

      this.modules_config[doc.id] = doc.data

      // this.fireEvent(
      //   this[
      //     'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC'
      //   ],
      //   [doc, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
      // )

    }
	},
	fetch: function (err, resp, params){
		debug('save %o', resp);
		debug('save params %o', params);

		if(err){
			debug('save err %o', err);

      if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

			this.fireEvent(
				this[
					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
				],
				err
			);
		}
		else{

			if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1), [JSON.decode(resp), {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]);//capitalize first letter
			}
			else{
				this.fireEvent('onGet', [JSON.decode(resp), {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]);
			}

      resp = resp || {}

      if(resp && resp.multigraph){
        Object.each(resp.multigraph, function(resp, key){
          this.create_emit_doc(resp, params.uri, key)
          // let new_data = {}
          // // let mem = /memory/
          //
          // // if(resp && resp !== null)
          // Object.each(resp, function(data, key){
          //   let new_key = key.replace(/\_/, '')
          //   new_data[new_key] = data
          // })
          //
          // debug('modified data %o', new_data);
          //
    			// let doc = {};
    			// doc.data = new_data
          // doc.id = params.uri+'.'+key
          // doc.config = this.modules_config[params.uri].multigraph[key]
          // // doc.host = this.options.host
          // doc.host = this.node
          //
          //
          // this.fireEvent(
          //   this[
          //     'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC'
          //   ],
          //   [doc, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
          // )
        }.bind(this))
      }
      else{
        this.create_emit_doc(resp, params.uri)
        // let new_data = {}
        // // let mem = /memory/
        //
        // // if(resp && resp !== null)
        // Object.each(resp, function(data, key){
        //   let new_key = key.replace(/\_/, '')
        //   new_data[new_key] = data
        // })
        //
        // debug('modified data %o', new_data);
        //
  			// let doc = {};
  			// doc.data = new_data
        // doc.id = params.uri
        // doc.config = this.modules_config[doc.id]
        // // doc.host = this.options.host
        // doc.host = this.node
        //
        //
        // this.fireEvent(
        //   this[
        //     'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC'
        //   ],
        //   [doc, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
        // )
      }


		}
	},
  create_emit_doc: function(resp, id, key){
    resp = resp || {}
    let new_data = {}
    // let mem = /memory/

    // if(resp && resp !== null)
    Object.each(resp, function(data, key){
      let new_key = key.replace(/\_/, '')
      new_data[new_key] = data
    })

    debug('modified data %o', new_data);

    let doc = {};
    doc.data = new_data
    doc.id = (key) ? id+'.'+key : id
    doc.config = (key) ? this.modules_config[id].multigraph[key] : this.modules_config[id]
    // doc.host = this.options.host
    doc.host = this.node


    this.fireEvent(
      this[
        'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC'
      ],
      [doc, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
    )
  },

	list: function (err, resp, params){
		debug_internals('list %o', resp);
		debug_internals('list params %o', params);

		if(err){
			debug_internals('list err %o', err);

      if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

			this.fireEvent(
				this[
					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
				],
				err
			);
		}
		else{
      let whitelist = this.options.whitelist
      let blacklist = this.options.blacklist
      this.modules = []

			Array.each(resp, function(module, index){
        // module = module.trim()

        // debug_internals('module %o', module, blacklist.test(module), whitelist.test(module));

        // blacklist.lastIndex = 0
        // whitelist.lastIndex = 0


        // if(blacklist == null || blacklist.test(module) == false)//not in blacklist
        //   if(whitelist == null || whitelist.test(module) == true)//if no whitelist, or in whitelist
        // debug_internals('pre __white_black_lists_filter module %o %o %s', whitelist, blacklist, module);
        if(__white_black_lists_filter(whitelist, blacklist, module)){
			      // this.options.requests.periodical.push( { fetch: { uri: module } });

            debug_internals('module %s', module);
            this.modules.push(module)
        }

				if(index == resp.length - 1){
					// this.fireEvent(this.ON_PERIODICAL_REQUESTS_UPDATED);

          this.fireEvent(
            this[
              'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC'
            ],
            [{modules: this.modules, host: this.node}, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
          )

          // this.fireEvent(
          //   this['ON_PERIODICAL_REQUESTS_UPDATED'],
          //   [resp, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
          // )


        }

        // blacklist.lastIndex = 0
        // whitelist.lastIndex = 0


			}.bind(this));


		}
	},
  nodes: function (err, resp, params){
		debug_internals('nodes %o', resp);
		debug_internals('nodes params %o', params);
    // process.exit(1)

		if(err){
			debug_internals('nodes err %o', err);

      if(params.uri != ''){
				this.fireEvent('on'+params.uri.charAt(0).toUpperCase() + params.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}

			this.fireEvent(this.ON_DOC_ERROR, err);

      if(this.options.requests.current && this.options.requests.current.type)
  			this.fireEvent(
  				this[
  					'ON_'+this.options.requests.current.type.toUpperCase()+'_DOC_ERROR'
  				],
  				err
  			);
		}
		else{
      // this.node = resp[0]
      /**
      * @hack: system (as a whole) doens't support fqdn yet, so we try to remove domains
      **/
      /**if(resp[0].indexOf('.') > -1){
        this.node = resp[0].substring(0, resp[0].indexOf('.'))
      }
      else{
        this.node = resp[0]
      }**/
      this.node = resp[0]

      this.options.id = this.node

      // this.list({uri: ''})

      // Array.each(resp, function(module, index){
      //   // module = module.trim()
      //
      //   // debug_internals('module %o', module, blacklist.test(module), whitelist.test(module));
      //
      //   blacklist.lastIndex = 0
      //   whitelist.lastIndex = 0
      //
      //
      //   // if(blacklist == null || blacklist.test(module) == false)//not in blacklist
      //   //   if(whitelist == null || whitelist.test(module) == true)//if no whitelist, or in whitelist
      //   if(__white_black_lists_filter(whitelist, blacklist, module)){
			//       this.options.requests.periodical.push( { fetch: { uri: module } });
      //
      //       debug_internals('module %s', module);
      //   }
      //
			// 	if(index == resp.length - 1){
			// 		// this.fireEvent(this.ON_PERIODICAL_REQUESTS_UPDATED);
      //     this.fireEvent(
      //       this['ON_PERIODICAL_REQUESTS_UPDATED'],
      //       [resp, {id: this.id, type: this.options.requests.current.type, input_type: this, app: this}]
      //     )
      //   }
      //
      //   // blacklist.lastIndex = 0
      //   // whitelist.lastIndex = 0
      //
      //
			// }.bind(this));

		}
	},
	//nodes: function (err, resp, options){
		//debug_internals('nodes %o', resp);
		//debug_internals('nodes options %o', options);
	//},
	//quit: function (err, resp, options){
		//debug_internals('quit %o', resp);
		//debug_internals('quit options %o', options);
	//},
	//config: function (err, resp, options){
		//debug_internals('config err %o', err);
		//debug_internals('config %o', resp);
		//debug_internals('config options %o', options);
	//},
  initialize: function(options){


		this.parent(options);//override default options

    // let test = function(){
    //   debug('test', this.connected)
    //   process.exit(1)
    // }
    // this.addEvent(this.ON_CONNECT, test)
    // this.addEvent(this.ON_CONNECT_ERROR, test)
    //
		this.log('munin', 'info', 'munin started');

		debug_internals('initialized %o', options);

  },
  connect: function(){
    this.parent()
    this.modules = []
    this.modules_config = {}
		// this.fireEvent(this.ON_ONCE);
    this.nodes({ uri: ''})
	},

});
