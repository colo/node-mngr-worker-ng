'use strict'

let debug = require('debug')('Server:Apps:Vhosts:Filters:00_apply_type_filter');
let debug_internals = require('debug')('Server:Apps:Vhosts:Filters:00_apply_type_filter:Internals');

const path = require('path'),
      ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

const sanitize_filter = require(path.join(ETC, 'snippets/filter.sanitize.rethinkdb.template')),
      procs_filter = require('./proc'),
      networkInterfaces_filter = require('./networkInterfaces'),
      blockdevices_filter = require('./blockdevices'),
      cpus_filter = require('./cpus'),
      mounts_filter = require('./mounts'),
      host_filter = require('./host')
      // data_formater_filter = require(path.join(ETC, 'snippets/filter.data_formater')),
      // compress_filter = require(path.join(ETC, 'snippets/filter.zlib.compress'))

const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  return d.getTime()
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


    // let host = input_type.options.id
    type = doc.type || type
    let host = doc.host
    let module = doc.module
    let val = doc.data

    debug('1st filter %o', doc, type)
    // if(type !== 'once')
    // process.exit(1)

    // console.log('os filter',doc)
    // debug(module)

    // if(module == 'os.procs'){

    if(module == 'procs'){

      procs_filter(
        doc,
        opts,
        next,
        pipeline
      )
    }
    else{
      if(val && val.uptime)
        pipeline.current_uptime = val.uptime

      if(module === 'os.mounts'){
        debug('MOUNTS %O', val)

        mounts_filter(
          doc,
          opts,
          next,
          pipeline
        )

        // doc = {data: doc, metadata: {host: host, path: module, tag: ['os'].combine(Object.keys(doc[0]))}}
        //
        // next(doc)
      }
      else if(module === 'os.blockdevices'){
        blockdevices_filter(
          doc,
          opts,
          next,
          pipeline
        )

      }
      else{

        if(val && val.networkInterfaces && type !== 'once'){//create an extra doc for networkInterfaces
          networkInterfaces_filter(
            // val.networkInterfaces,
            doc,
            opts,
            next,
            pipeline
          )

          delete doc.data.networkInterfaces

        }

        if(type === 'once'){
          // debug('HOST %s', JSON.stringify(doc), opts)
          // process.exit(1)
          host_filter(doc, opts, next, pipeline)
        }
        else{


          let memdoc = {data: {}, metadata: {host: host, path: module+'.memory', tag: ['os']}}
          // debug('DOC', doc)
          // process.exit(1)

          Object.each(val, function(_doc, key){
            // debug('DOC', _doc, key)
            // try{
            if(/mem/.test(key)){
              memdoc.metadata.tag.push(key)
              memdoc.data[key] = _doc
            }
            else if(key === 'cpus'){
              cpus_filter(
                { data: _doc, host: host, module: module},
                opts,
                next,
                pipeline
              )
            }
            else if(key === 'loadavg'){
              let _tmp = Array.clone(_doc)
              _doc = {
                '1_min': _tmp[0],
                '5_min': _tmp[1],
                '15_min': _tmp[2]
              }

              next(
                {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}},
                opts,
                next,
                pipeline
              )
            }
            else if(key === 'uptime'){
              let _tmp = _doc
              _doc = {
                seconds: _tmp
              }

              next(
                {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}},
                opts,
                next,
                pipeline
              )
            }
            else{
              next(
                {data: _doc, metadata: {host: host, path: module+'.'+key, tag: ['os', key]}},
                opts,
                next,
                pipeline
              )
            }

          })


          if(Object.getLength(memdoc.data) > 0){
            next(
              memdoc,
              opts,
              next,
              pipeline
            )
          }
        }
      }

      // next(doc)

    }

    // debug_internals(input_type.options.id)

  }


  return filter
}
