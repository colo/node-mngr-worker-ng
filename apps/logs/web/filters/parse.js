'use strict'

let debug = require('debug')('Server:Apps:Logs:Web:Filters:parse');
let debug_internals = require('debug')('Server:Apps:Logs:Web:Filters:parse:Internals');

const path = require('path')

const PREFIX =  process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), './')
      : path.resolve(process.cwd(), './devel/')

// const path = require('path'),
//       ETC =  process.env.NODE_ENV === 'production'
//       ? path.join(process.cwd(), '/etc/')
//       : path.join(process.cwd(), '/devel/etc/')


const URL = require('url').URL

const Parser =require('@robojones/nginx-log-parser').Parser

const moment = require ('moment')

const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;

const cityBuffer = fs.readFileSync(PREFIX+'/var/lib/geoip/GeoLite2-City.mmdb');
const cityReader = Reader.openBuffer(cityBuffer);

// const countryBuffer = fs.readFileSync(PREFIX+'/geoip/GeoLite2-Country.mmdb');
// const countryReader = Reader.openBuffer(countryBuffer);

const uaParser = require('ua-parser2')()
const ip = require('ip')
const qs = require('qs')
const referer = require('referer-parser')

let parser

const whitelist = require('../etc/whitelist')
const blacklist = require('../etc/blacklist')

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
    // debug('parse', doc)
    // process.exit(1)
    /**
    * to test different type of tags
    **/
    // tag_type = (tag_type === 'nginx') ? 'apache' : 'nginx'
    // debug_internals('filters to apply...', doc, opts.input.options.id )
    // process.exit(1)
    /**
    * https://github.com/chriso/nginx-parser
    * -> https://github.com/robojones/nginx-log-parser
    * https://www.npmjs.com/package/log-analyzer
    * https://github.com/nickolanack/node-apache-log
    * https://github.com/blarsen/node-alpine
    **/
    // parser.parseLine(doc.line, function(line){
    //   debug('parsed line', line)
    // })

    try  {
      // const parser = new Parser(pipeline.schema)
      if(parser === undefined) parser = new Parser(pipeline.options.schema)

      doc.log = doc.log.trim().replace(/(\r\n. |\n. |\r)/g,"")
      if(doc.log.length > 0){
        let result = parser.parseLine(doc.log)
        // debug('parse', doc.log, pipeline.options.schema)
        // process.exit(1)

        result.log = doc.log

        let blacklisted = false
        Object.each(result, function(value, property){
          if(blacklisted === false && __white_black_lists_filter(whitelist[property], blacklist[property], value) === false)
            blacklisted = true
        })

        if(blacklisted === false){
          // if(result.time_local)
          //   result.timestamp = moment(result.time_local, 'DD/MMM/YYYY:HH:mm:ss Z').valueOf()

          result.status *=1
          result.body_bytes_sent *=1

          result.method = result.request.split(' ')[0]
          result.path = result.request.split(' ')[1]
          result.version = result.request.split(' ')[2]
          delete result.request


          if(result.http_referer){
            let r = new referer(result.http_referer, 'http://'+doc.domain)
            // Object.each(r, function(data, key){
            //   debug('referer %s %s', key, data )
            // })
            let uri = r.uri
            result.referer = {
              known: r.known,
              referer: r.referer,
              medium: r.medium,
              search_parameter: r.search_parameter,
              search_term: r.search_term,
              uri: {
                protocol: uri.protocol,
                slashes: uri.slashes,
                auth: uri.auth,
                host: uri.host,
                port: uri.port,
                hostname: uri.hostname,
                hash: uri.hash,
                search: uri.search,
                query: uri.query,
                pathname: uri.pathname,
                path: uri.path,
                href: uri.href
              },
            }
            debug('referer %o', result.referer )
          }
          // process.exit(1)

          let url = new URL(result.path, 'http://'+doc.domain)
          result.pathname = url.pathname
          result.qs = qs.parse(url.search, { ignoreQueryPrefix: true })

          // result.qs = qs.parse(result.query)

          if(result.remote_addr && !ip.isPrivate(result.remote_addr) )
            result.geoip = cityReader.city(result.remote_addr)

          // if(result.http_user_agent && result.http_user_agent)
          // debug('ua', )
          let ua = JSON.parse(JSON.stringify(uaParser.parse(result.http_user_agent)))
          delete ua.string
          // result = Object.merge(result, ua)
          result.user_agent = ua

          // result.country = countryReader.country(result.remote_addr)

          let doc_ts = (result.time_local) ? moment(result.time_local, 'DD/MMM/YYYY:HH:mm:ss Z').valueOf() : Date.now()
          // let ts = doc_ts
          let ts = Date.now()
          ts += (doc.counter) ? '-'+doc.counter : ''
          // result.timestamp = doc_ts
          delete result.timestamp

          Object.each(result, function(value, key){
            if(value === null || value === undefined)
              delete result[key]
          })

          let new_doc = {
            id: doc.hostname+'.'+opts.input.options.id+'.'+doc.log_type+'.'+doc.domain+'@'+ts,
            data: result,
            metadata: {
              host: doc.hostname,
              // path: 'logs.nginx.'+doc.domain,
              path: 'logs.'+doc.log_type,
              domain: doc.domain,
              timestamp: doc_ts,
              _timestamp: Date.now(), //doc creation
              // tag: [tag_type, 'web', doc.input],
              tag: [doc.log_type, 'web', 'protocol', 'url', 'uri', 'schema', doc.input],
              type: 'periodical'
            }
          }

          // debug('parsed line', new_doc)
          // process.exit(1)
          next(new_doc)
      }


      }

    }
    catch(e){
      debug_internals('error parsing line', e)
      process.exit(1)
    }
  }


  return filter
}
