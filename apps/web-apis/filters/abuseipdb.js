'use strict'

const debug = require('debug')('Server:Apps:Web-Apis:filters:abuseipdb'),
      debug_internals = require('debug')('Server:Apps:Web-Apis:filters:abuseipdb:Internals');

const async = require('async'),
      qs = require('qs'),
      request = require('request'),
      path = require('path')

const ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

let abuseipdb = require(ETC+'http.abuseipdb.js')

module.exports = function(host, ipv4s, cb){//sanitize + metadata
  // cb({host, vhosts})
  debug('fork', host, ipv4s)


  let docs = []

  async.eachLimit(ipv4s, 1, function(ipv4, callback){//current nginx limit 5r/s

    let options = Object.clone(abuseipdb)
    options.uri = options.uri+ 'check?'+qs.stringify({'ipAddress' : ipv4})

    debug('request %O ', options)

    request.get(options, function(error, response, body){
        debug('request result %O',body)
        // process.exit(1)
      // if(response && response.statusCode)
      //   debug('request result %s %s %O ', host, ipv4, response.statusCode)

      let doc = {
        id: undefined,
        data: {},
        metadata: {
          path: 'web-apis.abuseipdb',
          type: 'check',
          host: host,
          tag: ['abuseipdb', 'check', 'ipv4'],
          timestamp: Date.now()
        }
      }

      // let id = ipv4.replace('://', '.').replace(':', '.')
      // let id = '['+ipv4+']'
      let id = ipv4
      doc.id = doc.metadata.host+'.'+doc.metadata.path+'.'+doc.metadata.type+'/'+id+'@'+doc.metadata.timestamp
      doc.metadata.id = doc.id

      if(response){
        doc.data = JSON.parse(body).data
        // doc.data = JSON.parse(body)
        doc.metadata.tag.push(response.statusCode)

        if(response.statusCode !== 200)
          doc.metadata.tag.push('error')

      }
      else{
        Object.each(error, function(value, key){
          if(value && value !== null)
            error[key] = value.toString()
        })
        doc.data = error
        doc.data.ipv4 = ipv4

        error.code = (error.code) ? error.code : (error.reason) ? error.reason : 'unknown'
        if(error.code) doc.metadata.tag.push(error.code)

        doc.metadata.tag.push('error')
      }

      docs.push(doc)
      callback()
    })
  }, function(err) {

      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        debug('request ERROR %o', err)
      } else {
        // debug('request SAVE %O', docs)

        //resume if every host has been checked
        // if(Object.every(hosts_checks, function(value, host){ return value })){
        //   pipeline.get_input_by_id('input.vhosts').fireEvent('onResume')
        // }
        // debug('2nd filter groups %O', docs)
        // process.exit(1)

        // pipeline.get_input_by_id('input.vhosts').fireEvent('onResume')

        // next(docs, opts, next, pipeline)
        cb(docs)
        setTimeout(function(){
          process.exit(0)
        }, abuseipdb.timeout + 200)

        // console.log('All files have been processed successfully');
      }
  });


}
