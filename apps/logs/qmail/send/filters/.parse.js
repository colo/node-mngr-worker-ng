'use strict'

const debug = require('debug')('Server:Apps:Logs:Qmail:Send:Filter:Parse'),
      debug_internals = require('debug')('Server:Apps:Logs:Qmail:Send:Filter:Parse:Internals')


const fs = require('fs');

const path = require('path')

const PREFIX =  process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), './')
      : path.resolve(process.cwd(), './devel/')

const time = function(tai64n) {
  const seconds = parseInt(tai64n.slice(2, 17), 16) - 10
  const milliseconds = (parseInt(tai64n.slice(17, 25), 16) * 0.000000001).toFixed(3).toString().split('.')[1]

  // const timestamp = new Date(Number(`${seconds}${milliseconds}`)).toISOString()
  const timestamp = Number(`${seconds}${milliseconds}`)
  return timestamp
}

const getTimestamp = function (log) {
  const tai64n = log.match(/^(@.+?)(\s)/)

  if (!tai64n || !tai64n[1]) {
    return null
  }

  const timestamp = time(tai64n[1])
  return timestamp
}

// const schema = 'cgi|start|end|user|course|type|action'

module.exports = function(doc, opts, next, pipeline){
  // debug('parse', doc)
  // process.exit(1)
  /**
  * to test different type of tags
  **/
  // tag_type = (tag_type === 'nginx') ? 'apache' : 'nginx'
  // debug_internals('filters to apply...', doc, opts.input.options.id )


  // try  {
    // const parser = new Parser(pipeline.schema)
    // if(parser === undefined) parser = new Parser(pipeline.options.schema)

    // doc.log = schema + '\n' + doc.log
    // debug('parse %s', doc.log)
    // process.exit(1)

    // let timestamp = getTimestamp(doc.log)
    let arr = doc.log.split(' ')
    debug('parse %o', arr)

    let type = undefined
    let data = {
      log: doc.log
    }

    switch (arr[1]) {
      case 'status:':
        type = 'status'
        data = Object.merge(data, {
          local: {
            used: arr[3].split('/')[0] * 1,
            max: arr[3].split('/')[1] * 1,
          },
          remote: {
            used: arr[5].split('/')[0] * 1,
            max: arr[5].split('/')[1] * 1,
          },
        })

        break;

      case 'new':
        type = 'msg.new'
        data = Object.merge(data, {
          msg: arr[3] * 1
        })

        break;

      case 'end':
        type = 'msg.end'
        data = Object.merge(data, {
          msg: arr[3] * 1
        })

        break;

      case 'bounce':
        type = 'msg.bounce'
        data = Object.merge(data, {
          msg: arr[3] * 1,
          qp: arr[5] * 1,
        })

        break;

      case 'info':
        type = 'msg.info'
        data = Object.merge(data, {
          msg: arr[3].replace(':', '') * 1,
          bytes: arr[5] * 1,
          from: arr[7],
          qp: arr[9] * 1,
          uid: arr[11] * 1
        })

        break;

      case 'starting':
        type = 'delivery.starting'
        data = Object.merge(data, {
          id: arr[3].replace(':', '') * 1,
          msg: arr[5] * 1,
          type: arr[7],
          to: arr[8]
        })

        break;

      case 'delivery':
        type = 'delivery.status'
        data = Object.merge(data, {
          id: arr[2].replace(':', '') * 1,
          status: arr[3].replace(':', ''),
          response: arr[4],
        })

        break;

    }

    if(type !== undefined){
      debug('LOG', type, data)
      data.tai64 = arr[0]

      // data.log = doc.log

      /**
      * BUGGY, for now use Date.now
      *
      let timestamp = getTimestamp(doc.log)
      let doc_ts = (isNaN(timestamp)) ?  Date.now() : timestamp
      **/
      let doc_ts = Date.now()

      let ts = Date.now()
      ts += (doc.counter) ? '-'+doc.counter : ''

      // Object.each(result, function(value, key){
      //   if(value === null || value === undefined)
      //     delete result[key]
      // })

      let new_doc = {
        id: doc.hostname+'.'+opts.input.options.id+'.'+doc.log_type+'.'+type+'@'+ts,
        data: data,
        metadata: {
          host: doc.hostname,
          // path: 'logs.nginx.'+doc.domain,
          path: 'logs.'+doc.log_type,
          domain: type,
          timestamp: doc_ts,
          _timestamp: Date.now(), //doc creation
          tag: [doc.log_type, type, doc.input],
          type: 'periodical'
        }
      }

      // if(type !== 'status' && type !== 'delivery.starting' && type !== 'msg.new' && type !== 'msg.info'){
      //   debug('parsed line', new_doc)
      //   process.exit(1)
      // }

      next(new_doc)
    }


}
