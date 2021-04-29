'use strict'

var debug = require('debug')('Server:Apps:Web-APIS:Pipeline');
var debug_internals = require('debug')('Server:Apps:Web-APIS:Pipeline:Internals');

const path = require('path');

let cron = require('node-cron');

let sanitize_filter = require(path.join(process.cwd(), '/devel/etc/snippets/filter.sanitize.rethinkdb.template'))

let PollHttp = require('js-pipeline.input.httpclient')
let body = JSON.encode({id: 'abuseipdb'})
let PollHttpExt = new Class({
  Extends: PollHttp,

  connect: function(){
		debug('this.connect');
		this.fireEvent(this.ON_CONNECT, { body: body });
	}
})

let AbuseIPDBHttp = require('node-app-http-client/load')(PollHttpExt)
// let ProcsPollHttp = require('node-app-http-client/load')(PollHttp)

let JSPipelineOutput = require('js-pipeline.output.rethinkdb')
// let HttpReceiverOutput = require('../http-receiver/output')

const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  return d.getTime()
}

// const CONF = process.env.NODE_ENV === 'production'
//       ? require('./etc/http/prod.conf')
//       : require('./etc/http/dev.conf');

module.exports = function(http, out){
  // const os_output_opts = {
  //   id: "output.os.rethinkdb",
  //   conn: [
  //     Object.merge(
  //       Object.clone(out),
  //       {table: 'os'}
  //     )
  //   ],
  //   module: JSPipelineOutput,
  //   buffer:{
  //     // // size: 1, //-1
  //     // expire: 1001,
  //     size: -1, //-1
  //     // expire: 0 //ms
  //     expire: 1000, //ms
  //     periodical: 500 //how often will check if buffer timestamp has expire
  //   }
  // }
  //
  // const os_output = new JSPipelineOutput(os_output_opts)
  //
  // const hosts_output_opts = {
  //   id: "output.host.rethinkdb",
  //   conn: [
  //     Object.merge(
  //       Object.clone(out),
  //       {table: 'hosts'}
  //     )
  //   ],
  //   module: JSPipelineOutput,
  //   buffer:{
  //     // // size: 1, //-1
  //     // expire: 1001,
  //     size: -1, //-1
  //     // expire: 0 //ms
  //     expire: 1000, //ms
  //     periodical: 500 //how often will check if buffer timestamp has expire
  //   }
  // }
  //
  // const hosts_output = new JSPipelineOutput(hosts_output_opts)

  let conf = {
   input: [
  	{
  		poll: {
  			id: "input.localhost.os.http",
  			conn: [
          Object.merge(
            Object.clone(http),
            {
              module: AbuseIPDBHttp,
              load: ['apps/web-apis/input/abuseipdb']
            },
          )
  				// {
  				// 	scheme: 'http',
  				// 	host:'elk',
  				// 	port: 8081,
  				// 	module: AbuseIPDBHttp,
  				// 	// load: ['apps/info/os/']
          //   load: ['apps/os/input/os']
  				// },
          // {
  				// 	scheme: 'http',
  				// 	host:'dev',
  				// 	port: 8081,
  				// 	module: AbuseIPDBHttp,
  				// 	// load: ['apps/info/os/']
          //   load: ['apps/os/input/os']
  				// }
  			],
        connect_retry_count: -1,
        connect_retry_periodical: 1000,
  			requests: {
  				periodical: 1000,
          // periodical: function(dispatch){
          //   // return cron.schedule('14,29,44,59 * * * * *', dispatch);//every 15 secs
          //   return cron.schedule('* * * * * *', dispatch);//every 20 secs
          // },
  			},
  		},
  	},

   ],
   filters: [
  		// require('./snippets/filter.sanitize.template'),
      function(doc, opts, next, pipeline){
        let { type, input, input_type, app } = opts

        // // debug('1st filter %o', doc, opts)
        // // if(opts.type === 'once')
        // //   process.exit(1)
        //
        // let host = input_type.options.id
        // let module = app.options.id
        //
        // // console.log('os filter',doc)
        // // debug(app.options.id)
        //
        // // if(app.options.id == 'os.procs'){
        //
        // if(app.options.id == 'procs'){
        //
        //   procs_filter(
        //     doc,
        //     opts,
        //     next,
        //     pipeline
        //   )
        // }
        // else{
        //   if(doc && doc.uptime)
        //     pipeline.current_uptime = doc.uptime
        //
        //   // if(doc && doc.networkInterfaces && opts.type !== 'once'){//create an extra doc for networkInterfaces
        //   //   networkInterfaces_filter(
        //   //     doc.networkInterfaces,
        //   //     opts,
        //   //     next,
        //   //     pipeline
        //   //   )
        //   //
        //   //   delete doc.networkInterfaces
        //   //
        //   // }
        //
        //   debug('app.options.id %s', app.options.id)
        //   if(app.options.id === 'os.mounts'){
        //     debug('MOUNTS %O', doc)
        //
        //     mounts_filter(
        //       doc,
        //       opts,
        //       next,
        //       pipeline
        //     )
        //
        //     // doc = {data: doc, metadata: {host: host, path: module, tag: ['os'].combine(Object.keys(doc[0]))}}
        //     //
        //     // next(doc)
        //   }
        //   else if(app.options.id === 'os.blockdevices'){
        //     blockdevices_filter(
        //       doc,
        //       opts,
        //       next,
        //       pipeline
        //     )
        //
        //     // debug('blockdevices %O', Object.keys(doc[Object.keys(doc)[0]]))
        //     // // process.exit(1)
        //     // Object.each(doc, function(_doc, device){
        //     //   next({data: _doc, metadata: {host: host, path: module+'.'+device, tag: ['os', 'blockdevices', device].combine(Object.keys(_doc))}})
        //     // })
        //     // // doc = {data: doc, metadata: {host: host, path: module, tag: ['os'].combine(Object.keys(doc[Object.keys(doc)[0]]))}}
        //     // //
        //     // // next(doc)
        //   }
        //   else{
        //     if(doc && doc.networkInterfaces && opts.type !== 'once'){//create an extra doc for networkInterfaces
        //       networkInterfaces_filter(
        //         doc.networkInterfaces,
        //         opts,
        //         next,
        //         pipeline
        //       )
        //
        //       delete doc.networkInterfaces
        //
        //     }
        //
        //     if(opts.type === 'once'){
        //       // debug('HOST %s', JSON.stringify(doc), opts)
        //     	// process.exit(1)
        //       host_filter(doc, opts, next, pipeline)
        //     }
        //     else{
        //       let memdoc = {data: {}, metadata: {host: host, path: module+'.memory', tag: ['os']}}
        //       Object.each(doc, function(_doc, key){
        //         if(/mem/.test(key)){
        //           memdoc.metadata.tag.push(key)
        //           memdoc.data[key] = _doc
        //         }
        //         else if(key === 'cpus'){
        //           cpus_filter(
        //             _doc,
        //             opts,
        //             next,
        //             pipeline
        //           )
        //         }
        //         else if(key === 'loadavg'){
        //           let _tmp = Array.clone(_doc)
        //           _doc = {
        //             '1_min': _tmp[0],
        //             '5_min': _tmp[1],
        //             '15_min': _tmp[2]
        //           }
        //
        //           next( {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}} )
        //         }
        //         else if(key === 'uptime'){
        //           let _tmp = _doc
        //           _doc = {
        //             seconds: _tmp
        //           }
        //
        //           next( {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}} )
        //         }
        //         else{
        //           next( {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}} )
        //         }
        //       })
        //
        //       if(Object.getLength(memdoc.data) > 0){
        //         next(memdoc)
        //       }
        //     }
        //   }
        //
        //   // next(doc)
        //
        // }
        //
        // // debug_internals(input_type.options.id)

      },

      // function(doc, opts, next, pipeline){
      //   let { type, input, input_type, app } = opts
      //
      //   let timestamp = roundMilliseconds(Date.now())
      //
      //   if(opts.type === 'once'){
      //     // debug('1st filter %s', JSON.stringify(doc), opts)
      //     // process.exit(1)
      //     doc.id = doc.metadata.host+'.'+doc.metadata.path
      //   }
      //   else{
      //     doc.id = doc.metadata.host+'.'+doc.metadata.path+'@'+timestamp
      //   }
      //
      //   // let timestamp = roundMilliseconds(Date.now())
      //   // doc.id = doc.metadata.host+'.'+doc.metadata.path+'@'+timestamp
      //   doc.metadata.timestamp = timestamp
      //
      //   sanitize_filter(
      //     doc,
      //     opts,
      //     pipeline.output.bind(pipeline),
      //     pipeline
      //   )
      //
      // },


  	],
  	output: [
      require(path.join(process.cwd(), '/devel/etc/snippets/output.stdout.template')),
  		//require('./snippets/output.stdout.template'),

      // function(doc, opts){
      //   // debug('1st filter %s', JSON.stringify(doc), opts, hosts_output, os_output)
      //   // process.exit(1)
      //
      //   if(doc.metadata.path === 'host'){
      //     hosts_output.fireEvent(hosts_output.ON_SAVE_DOC, doc)
      //   }
      //   else{
      //     os_output.fireEvent(hosts_output.ON_SAVE_DOC, doc)
      //   }
      // }
      // // {
  		// // 	rethinkdb: {
  		// // 		id: "output.os.rethinkdb",
  		// // 		conn: [
      // //       Object.merge(
      // //         Object.clone(out),
      // //         {table: 'os'}
      // //       )
  		// // 		],
  		// // 		module: require('js-pipeline.output.rethinkdb'),
      // //     buffer:{
  		// // 			// // size: 1, //-1
  		// // 			// expire: 1001,
      // //       size: -1, //-1
  		// // 			// expire: 0 //ms
      // //       expire: 1000, //ms
      // //       periodical: 500 //how often will check if buffer timestamp has expire
  		// // 		}
  		// // 	}
  		// // }
      //
      // // {
  		// // 	rethinkdb: {
  		// // 		id: "output.os.http-client",
  		// // 		conn: [
      // //       Object.merge(
      // //         Object.clone(out),
      // //         {
      // //           path: 'os',
      // //           authentication: {
      // //       			username: 'mngr',
      // //       			password: '1234',
      // //       			sendImmediately: true,
      // //       			// bearer: 'bearer',
      // //       			basic: true
      // //       		},
      // //         }
      // //       )
  		// // 		],
  		// // 		module: HttpReceiverOutput,
      // //     buffer:{
  		// // 			// // size: 1, //-1
  		// // 			// expire: 1001,
      // //       size: -1, //-1
  		// // 			// expire: 0 //ms
      // //       expire: 1000, //ms
      // //       periodical: 500 //how often will check if buffer timestamp has expire
  		// // 		}
  		// // 	}
  		// // }
  	]
  }

  return conf
}
