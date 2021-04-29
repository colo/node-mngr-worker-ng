'use strict'

let debug = require('debug')('Server:Apps:Web-Apis:Filters:01_from_networkInterfaces_get_ipv4');
let debug_internals = require('debug')('Server:Apps:Web-Apis:Filters:01_from_networkInterfaces_get_ipv4:Internals');

const async = require('async'),
      ipaddr = require('ipaddr.js')
      // { fork } = require('child_process'),
      // path = require('path')

// let forks = {}



let ifaces_blacklist = undefined
// let ifaces_whitelist = /^(?!.*(lo|:|vnet|bond|vlan3308|tun0)).*$/
let ifaces_whitelist = undefined

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

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    let { type, input, input_type, app } = opts
    debug('2nd filter %O', doc)
    // process.exit(1)

    if(doc && doc.data && doc.metadata && doc.metadata.from === 'hosts'){

      // pipeline.get_input_by_id('input.periodical').fireEvent('onSuspend')
      // pipeline.fireEvent('onSuspend')

      let hosts_ipv4 = {}
      let hosts= []
      Array.each(doc.data, function(row){
        if(!hosts_ipv4[row.metadata.host]) hosts_ipv4[row.metadata.host] = []

        // if(row.metadata.host === 'draco'){
        //   debug('2nd filter %O', row.data)
        //   process.exit(1)
        // }

        // hosts_ipv4[row.metadata.host].push(row.data.schema+'://'+row.data.uri+':'+row.data.port)
        // hosts.combine([row.metadata.host])
        debug('row.data', row.data)
        // process.exit(1)
        Object.each(row.data.networkInterfaces, function(iface_data, iface){
          let ipv4
          if(iface !== undefined && __white_black_lists_filter(ifaces_whitelist, ifaces_blacklist, iface) === true){
            Array.each(iface_data.if, function(addr){
              if(addr.family === 'IPv4')
                ipv4 = addr.address
            })
            let range = 'loopback'
            try {
              debug('RANGE', ipaddr.parse(ipv4).range())
              range = ipaddr.parse(ipv4).range()
            }
            catch(e){}
            // if(ipaddr.parse(ipv4).range() !== 'unicast' && ipaddr.parse(ipv4).range() !== 'private' && ipaddr.parse(ipv4).range() !== 'loopback')
            //   process.exit(1)
            if(range !== 'private' && range !== 'loopback'){
              // process.exit(1)
              hosts_ipv4[row.metadata.host].push(ipv4)
              hosts.combine([row.metadata.host])
            }
          }
        })
      })


      debug('2nd filter groups %O', hosts, hosts_ipv4)
      // process.exit(1)

      Array.each(hosts, function(host){
        debug('2nd filter groups %O', host, hosts_ipv4[host])
        next([host, hosts_ipv4[host]], opts, next, pipeline)
      })
      // async.eachLimit(hosts, 1, function(host, callback){//max forks => 1
      // // async.eachOf(hosts, function(host, index, callback){//max forks => 5
      //   debug('2nd filter groups %O', host, hosts_ipv4[host])
      //   next([host, hosts_ipv4[host]], opts, next, pipeline)
      //   callback()
      //
      //   // try{
      //   //   if(!forks[host]){
      //   //     forks[host] = fork(process.cwd()+'/apps/web-apis/libs/fork_filter', [
      //   //       path.join(process.cwd(), '/apps/web-apis/filters/abuseipdb'),
      //   //     ])
      //   //
      //   //     forks[host].on('message', function(msg){
      //   //       let data = msg.result
      //   //       let doc = msg.doc
      //   //       // debug('result %o %o', msg)
      //   //       // process.exit(1)
      //   //       // delete forks[host]
      //   //
      //   //       next(data, opts, next, pipeline)
      //   //       try{
      //   //         callback()
      //   //       }
      //   //       catch(e){
      //   //         debug('callback err', e)
      //   //       }
      //   //
      //   //     })
      //   //
      //   //   }
      //   //
      //   //   forks[host].send({
      //   //     params: [host, hosts_ipv4[host]],
      //   //     // doc:  Object.clone(real_data)
      //   //   })
      //   // }
      //   // catch(e){
      //   //   debug('ERROR', e)
      //   //   // process.exit(1)
      //   //   callback()
      //   // }
      // }, function(err) {
      //     // if any of the file processing produced an error, err would equal that error
      //     if( err ) {
      //       debug('request ERROR %o', err)
      //     } else {
      //       // forks = {}
      //       pipeline.fireEvent('onResume')
      //
      //     }
      // });
    }
  }

  return filter
}
