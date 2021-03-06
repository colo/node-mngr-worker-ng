'use strict'

const App = require('../../../modules/js-pipeline.input.rethinkdb-rest')

// const App = require ( 'node-app-rethinkdb-client/index' )

let debug = require('debug')('Server:Apps:Purge:Input'),
    debug_internals = require('debug')('Server:Apps:Purge:Input:Internals');


const pluralize = require('pluralize')

// const uuidv5 = require('uuid/v5')
//
const async = require('async')
//
// const sleep = (milliseconds) => {
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }

const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  return d.getTime()
}

const roundSeconds = function(timestamp){
  timestamp = roundMilliseconds(timestamp)
  let d = new Date(timestamp)
  d.setSeconds(0)

  return d.getTime()
}

const roundHours = function(timestamp){
  timestamp = roundMinutes(timestamp)
  let d = new Date(timestamp)
  d.setHours(0)

  return d.getTime()
}
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = HOUR * 24
const WEEK = DAY * 7


module.exports = new Class({
  Extends: App,

  ID: '11ef2d6f-44fd-5277-8dc0-06e72b96cc17',
  // registered: {},
  // registered_ids: {},
  // feeds: {},
  // close_feeds: {},
  // changes_buffer: {},
  // changes_buffer_expire: {},
  // periodicals: {},
  //
  // // FROM: 'periodical',
  // RANGES: {
  //   'periodical': 10000,
  //   'historical': 60000,
  //
  // },
  options: {
    changes: {includeTypes: true, squash: false},

    db: undefined,
    table: undefined,
    type: undefined,

		requests : {
      once: [

      ],

      /**
      * periodical data always comes from 'periodical' table
      **/
      periodical: [
        // {
        //   /**
        //   * default query from mngr-ui-admin/libs/pipelines/input/rethinkdb
        //   **/
				// 	default: function(req, next, app){
        //     req = (req)
        //     ? Object.clone(req)
        //     : (app.options && app.options.requests && app.options.requests.req)
        //       ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.requests.req))
        //       : { params: {}, query: {} }
        //
        //     // if(req.id === 'periodical'){
        //
        //       let _default = function(){
        //         debug_internals('default PERIODICAL %o %o', req, app.options.table)
        //
        //         req.options.full_range = req.options.full_range || false
        //
        //         app.fireEvent('onSuspend')
        //
        //         req = (req) ? Object.clone(req) : { id: 'paths', params: {}, query: {} }
        //
        //         let from = req.from || app.options.table
        //
        //
        //         let query = app.r
        //           .db(app.options.db)
        //           .table(from)
        //
        //         // query = (req.params.prop && req.params.value)
        //         // ? query
        //         //   .getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
        //         // : query
        //         if(req.params.prop && req.params.value){
        //           if(!Array.isArray(req.params.value))
        //             try{
        //               req.params.value = JSON.parse(req.params.value)
        //             }
        //             catch(e){
        //               req.params.value = [req.params.value]
        //             }
        //
        //           query = query.getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
        //         }
        //
        //         debug_internals('default %o %o', req, app.options.table)
        //
        //
        //         /**
        //         * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
        //         **/
        //         let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
        //         if(
        //           transformation
        //           && (transformation.orderBy
        //             || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
        //           )
        //         ){
        //           let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
        //           query = app.query_with_transformation(query, orderBy)
        //
        //           if(Array.isArray(transformation)){
        //             transformation = Array.clone(transformation)
        //             transformation.each(function(trasnform, index){
        //               if(Object.keys(trasnform)[0] === 'orderBy')
        //                 transformation[index] = undefined
        //             })
        //
        //             transformation = transformation.clean()
        //           }
        //
        //
        //         }
        //
        //         if(req.query && req.query.filter)
        //           query = app.query_with_filter(query, req.query.filter)
        //
        //         if(transformation)
        //           query = app.query_with_transformation(query, transformation)
        //         /**
        //         * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
        //         **/
        //
        //         // query = (req.params.path)
        //         // ? query
        //         //   .filter( app.r.row('metadata')('path').eq(req.params.path) )
        //         // : query
        //         let _result_callback = function(err, resp){
        //           debug_internals('run', err)//resp
        //           app.fireEvent('onResume')
        //           app.process_default(
        //             err,
        //             resp,
        //             {
        //               _extras: {
        //                 from: from,
        //                 type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //                 id: req.id,
        //                 transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //                 aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
        //                 filter: (req.query.filter) ? req.query.filter : undefined
        //                 // prop: pluralize(index)
        //               }
        //             }
        //           )
        //         }
        //
        //         /**
        //         * if no params, exec grouping query
        //         **/
        //         if(req.id === 'paths'){
        //         }
        //         else{
        //           if(req.options.full_range === false){
        //             if(app.options.type === 'minute'){
        //               query = query
        //                 .between(
        //                   roundSeconds(Date.now() - MINUTE),
        //                   roundSeconds(Date.now()),
        //                   {index: 'timestamp'}
        //                 )
        //             }
        //             else{
        //               query = query
        //                 .between(
        //                   roundMinutes(Date.now() - HOUR),
        //                   roundMinutes(Date.now()),
        //                   /**
        //                   * testing ML
        //                   **/
        //                   // Date.now() - HOUR,
        //                   // Date.now(),
        //                   // Date.now(),
        //                   {index: 'timestamp'}
        //                 )
        //             }
        //
        //           }
        //
        //           if (req.query && req.query.aggregation && !req.query.q) {
        //             query =  this.result_with_aggregation(query, req.query.aggregation)
        //             query.run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //           }
        //           else if(req.query.index === false){
        //             query = app.build_query_fields(query, req.query)
        //
        //             debug('NO INDEX %o', query)
        //
        //             query.run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //
        //           }
        //           else{
        //             if(req.query && (req.query.q || req.query.filter)){
        //               query = query
        //                 .group( app.get_group(req.query.index) )
        //                 // .group( {index:'path'} )
        //                 .ungroup()
        //                 .map(
        //                   function (doc) {
        //                     // return app.build_default_query_result(doc, req.query)
        //                     return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
        //                   }
        //                 )
        //                 .run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //
        //             }
        //             else{
        //               let _add_range = function(query){
        //
        //               }
        //               app.build_default_result_distinct(query, app.get_distinct(req.query.index), req.query.distinct, _result_callback)
        //             }
        //
        //           }
        //         }
        //
        //       }
        //
        //
        //
        //       debug('CONNECTED? %o %s', app.connected, app.options.db)
        //       if(app.connected === false){
        //         app.addEvent(app.ON_CONNECT, _default)
        //         // app.r.on('connect', function(err, conn){
        //         //   app.register(
        //         //     query,
        //         //     req,
        //         //     params
        //         //   )
        //         // })
        //       }
        //       else{
        //         _default()
        //       }
        //
        //     // } //req.query.register === false
				// 	}
				// },

        /**
        * default query || query with params
        **/
        // {
        //   default: function(req, next, app){
        //     req = (req)
        //     ? Object.clone(req)
        //     : (app.options && app.options.periodical)
        //       ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.periodical))
        //       : { params: {}, query: {} }
        //
        //     // req = (req)
        //     // ? Object.clone(req)
        //     // : (app.options && app.options.requests && app.options.requests.req)
        //     //   ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.requests.req))
        //     //   : { params: {}, query: {} }
        //
        //     debug('PERRIODICAL ', req, app.options)
        //     // process.exit(1)
        //     if(req.id === 'periodical'){
        //       const _default = function(){
        //
        //         // req.options.full_range = req.options.full_range || false
        //
        //         let start, end
        //
        //         let full_range = ( req.options && req.options.full_range === true ) ? true : false
        //         /**
        //         * maybe full_range = should do minus MINUTE/HOUR/etc
        //         **/
        //
        //         if(full_range === true){
        //           start = 0
        //           end = Date.now()
        //         }
        //         else {
        //           if(app.options.type === 'minute'){
        //             end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //             start  = (req.options && req.options.range) ? req.options.range.start : roundSeconds(end - SECOND)//- MINUTE
        //           }
        //           else if(app.options.type === 'hour'){
        //             end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //             start  = (req.options && req.options.range) ? req.options.range.start : roundMinutes(end - MINUTE)//  - MINUTE
        //           }
        //           else if(app.options.type === 'day'){
        //             end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //             start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end- HOUR)// - MINUTE
        //           }
        //           else if(app.options.type === 'week'){
        //             end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //             // start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end) - WEEK
        //             start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end - HOUR - WEEK)
        //           }
        //         }
        //
        //
        //         req.options = req.options || {}
        //         req.options.range = (full_range === true || !req.options.range) ? {start: start, end: end} : req.options.range
        //         // app.options.type
        //
        //
        //         let range = 'posix '+start+'-'+end+'/*'
        //
        //
        //         app.fireEvent('onSuspend')
        //
        //         // req = (req) ? Object.clone(req) : { id: 'paths', params: {}, query: {} }
        //
        //         let from = req.from || app.options.table
        //
        //         let query = app.r
        //           .db(app.options.db)
        //           .table(from)
        //
        //
        //         let _result_callback = function(err, resp){
        //           debug_internals('run', err)//resp
        //           app.fireEvent('onResume')
        //           app.process_default(
        //             err,
        //             resp,
        //             {
        //               _extras: {
        //                 from: from,
        //                 type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //                 id: (req.query && req.query.id) ? req.query.id : req.id,
        //                 transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //                 aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
        //                 filter: (req.query.filter) ? req.query.filter : undefined
        //                 // prop: pluralize(index)
        //               }
        //             }
        //           )
        //         }
        //         /**
        //         * if no params, exec grouping query
        //         **/
        //         // if(req.id === 'paths'){
        //         if(full_range === false){
        //           let distinct_query = query.distinct({index: 'path'})
        //
        //           // if(req.options.full_range === false){
        //             // if(app.options.type === 'periodical' || app.options.type === 'minute'){
        //             //   query = query
        //             //   .between(
        //             //     roundSeconds(Date.now() - MINUTE),
        //             //     roundSeconds(Date.now()),
        //             //     {index: 'timestamp'}
        //             //   )
        //             // }
        //             // else if(app.options.type === 'hour'){
        //             //   query = query
        //             //   .between(
        //             //     roundMinutes(Date.now() - HOUR),
        //             //     roundMinutes(Date.now()),
        //             //     /**
        //             //     * testing ML
        //             //     **/
        //             //     // Date.now() - HOUR,
        //             //     // Date.now(),
        //             //     {index: 'timestamp'}
        //             //   )
        //             // }
        //             // else if(app.options.type === 'day'){
        //             //   query = query
        //             //   .between(
        //             //     roundHours(Date.now() - DAY),
        //             //     roundHours(Date.now()),
        //             //     /**
        //             //     * testing ML
        //             //     **/
        //             //     // Date.now() - DAY,
        //             //     // Date.now(),
        //             //     {index: 'timestamp'}
        //             //   )
        //             // }
        //
        //           // }
        //           query = query.between(
        //             start,
        //             end,
        //             {index: 'timestamp'}
        //           )
        //
        //           distinct_query.run(app.conn, {arrayLimit: 10000000}, function(err, resp){
        //             if(err){
        //               _result_callback(err, undefined)
        //             }
        //             else{
        //               let _groups = {}
        //               resp.toArray(function(err, paths){
        //                 if(err){
        //                   _result_callback(err, undefined)
        //                 }
        //                 else{
        //                   async.eachOf(paths, function (path, index, _async_callback) {
        //                     if(!_groups[path]) _groups[path] = {}
        //
        //                     _groups[path].path = path
        //
        //                     try{
        //                       app.r.expr([
        //                         query
        //                         .filter(app.r.row('metadata')('path').eq(path))('metadata')('host')
        //                         .distinct(),
        //                         query
        //                         .filter(app.r.row('metadata')('path').eq(path))('metadata')('timestamp').min(),
        //                         query
        //                         .filter(app.r.row('metadata')('path').eq(path))('metadata')('timestamp').max(),
        //
        //                       ]).run(app.conn, {arrayLimit: 1000000}, function(err, resp){
        //                         debug('EXPR RESULT %o %o', err, resp)
        //                         // process.exit(1)
        //                         if(resp && Array.isArray(resp)){
        //                           _groups[path].range =[ resp[1], resp[2] ]
        //                           _groups[path].hosts = resp[0]
        //                         }
        //                         // _async_callback(err, _groups)
        //                         _async_callback(undefined, _groups)
        //                         // rowFinished(err)
        //                       })
        //                     }
        //                     catch(err){
        //                       // _async_callback(err, _groups)
        //                       _async_callback(undefined, _groups)
        //                     }
        //
        //
        //                   }, function (err) {
        //                     debug('build_default_result ERR %o', err)
        //                     // if(err){
        //                     //   _result_callback(err, undefined)
        //                     // }
        //                     // else{
        //                     _result_callback(err, _groups)
        //                     // }
        //                   // process.exit(1)
        //                   })
        //                 }
        //               })
        //
        //             }
        //           })
        //
        //
        //
        //         }
        //         /**
        //         * process query (same as default)
        //         **/
        //         else{
        //           // if(req.options.full_range === false){
        //           //   if(app.options.type === 'minute'){
        //           //     query = query
        //           //       .between(
        //           //         roundSeconds(Date.now() - MINUTE),
        //           //         roundSeconds(Date.now()),
        //           //         {index: 'timestamp'}
        //           //       )
        //           //   }
        //           //   else{
        //           //     query = query
        //           //       .between(
        //           //         roundMinutes(Date.now() - HOUR),
        //           //         roundMinutes(Date.now()),
        //           //         /**
        //           //         * testing ML
        //           //         **/
        //           //         // Date.now() - HOUR,
        //           //         // Date.now(),
        //           //         // Date.now(),
        //           //         {index: 'timestamp'}
        //           //       )
        //           //   }
        //           //
        //           // }
        //           debug('FULL RANGE %o', req.options.full_range, req)
        //           // process.exit(1)
        //
        //
        //           // query = (req.params.prop && req.params.value)
        //           // ? query
        //           //   .getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
        //           // : query
        //           if(req.params.prop && req.params.value){
        //             if(!Array.isArray(req.params.value))
        //               try{
        //                 req.params.value = JSON.parse(req.params.value)
        //               }
        //               catch(e){
        //                 req.params.value = [req.params.value]
        //               }
        //
        //             query = query.getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
        //           }
        //
        //           debug_internals('default %o %o', req, app.options.table)
        //
        //           /**
        //           * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
        //           **/
        //           let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
        //
        //           // debug('FULL RANGE %o', req.options.full_range, req, transformation, query)
        //           // process.exit(1)
        //           if(
        //             transformation
        //             && (transformation.orderBy
        //               || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
        //             )
        //           ){
        //             let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
        //             query = app.query_with_transformation(query, orderBy)
        //
        //             if(Array.isArray(transformation)){
        //               transformation = Array.clone(transformation)
        //               transformation.each(function(trasnform, index){
        //                 if(Object.keys(trasnform)[0] === 'orderBy')
        //                   transformation[index] = undefined
        //               })
        //
        //               transformation = transformation.clean()
        //             }
        //
        //
        //           }
        //
        //           if(req.query && req.query.filter)
        //             query = app.query_with_filter(query, req.query.filter)
        //
        //           if(transformation)
        //             query = app.query_with_transformation(query, transformation)
        //           /**
        //           * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
        //           **/
        //
        //
        //
        //           if (req.query && req.query.aggregation && !req.query.q) {
        //             query =  this.result_with_aggregation(query, req.query.aggregation)
        //             query.run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //           }
        //           else if(req.query.index === false){
        //             query = app.build_query_fields(query, req.query)
        //
        //             debug('NO INDEX %o', query)
        //
        //             query.run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //
        //           }
        //           else{
        //             if(req.query && (req.query.q || req.query.filter)){
        //               query = query
        //                 .group( app.get_group(req.query.index) )
        //                 // .group( {index:'path'} )
        //                 .ungroup()
        //                 .map(
        //                   function (doc) {
        //                     // return app.build_default_query_result(doc, req.query)
        //                     return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
        //                   }
        //                 )
        //                 .run(app.conn, {arrayLimit: 10000000}, _result_callback)
        //
        //             }
        //             else{
        //               app.build_default_result_distinct(query, app.get_distinct(req.query.index), _result_callback)
        //             }
        //             // query = query
        //             //   .group( app.r.row('metadata')('path') )
        //             //   .ungroup()
        //             //   .map(
        //             //     function (doc) {
        //             //         return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
        //             //     }
        //             // )
        //           }
        //         }
        //
        //       }
        //
        //
        //       debug('CONNECTED? %o %s', app.connected, app.options.db)
        //       if(app.connected === false){
        //         app.addEvent(app.ON_CONNECT, _default)
        //         // app.r.on('connect', function(err, conn){
        //         //   app.register(
        //         //     query,
        //         //     req,
        //         //     params
        //         //   )
        //         // })
        //       }
        //       else{
        //         _default()
        //       }
        //
        //
        //     }
        //
        //
				// 	}
				// },
        {
					default: function(req, next, app){
            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.periodical)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.periodical))
              : { params: {}, query: {} }

            // if(app.options.once && req.id === 'range' && (!req.query || (!req.query.register && !req.query.unregister))){
            if(req.id === 'periodical'){
              debug_internals('PERIODICAL', req, app.options.type)
              // process.exit(1)

              let _default = function(){
                let start, end

                let full_range = ( req.options && req.options.full_range === true ) ? true : false
                /**
                * maybe full_range = should do minus MINUTE/HOUR/etc
                **/

                if(full_range === true){
                  start = 0
                  end = Date.now()
                }
                else {
                  if(app.options.type === 'minute'){
                    end = (req.options && req.options.range) ? req.options.range.end : Date.now()
                    start  = (req.options && req.options.range) ? req.options.range.start : roundSeconds(end - SECOND)//- MINUTE
                  }
                  else if(app.options.type === 'hour'){
                    end = (req.options && req.options.range) ? req.options.range.end : Date.now()
                    start  = (req.options && req.options.range) ? req.options.range.start : roundMinutes(end - MINUTE)//  - MINUTE
                  }
                  else if(app.options.type === 'day'){
                    end = (req.options && req.options.range) ? req.options.range.end : Date.now()
                    start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end- HOUR)// - MINUTE
                  }
                  else if(app.options.type === 'week'){
                    end = (req.options && req.options.range) ? req.options.range.end : Date.now()
                    // start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end) - WEEK
                    start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end - HOUR - WEEK)
                  }
                }


                req.options = req.options || {}
                req.options.range = (full_range === true || !req.options.range) ? {start: start, end: end} : req.options.range
                // app.options.type


                let range = 'posix '+start+'-'+end+'/*'


                let from = req.from || app.options.table
                // from = (from === 'minute' || from === 'hour') ? 'historical' : from

                let index = "timestamp"

                let query = app.r
                  .db(app.options.db)
                  .table(from)

                index = (req.params.prop && req.params.value)
                ? pluralize(req.params.prop, 1)+'.timestamp'
                : index

                start = (req.params.prop && req.params.value)
                ? [req.params.value, start]
                : start

                end = (req.params.prop && req.params.value)
                ? [req.params.value, end]
                : end

                query = (full_range !== true)
                ? query.between(
                  start,
                  end,
                  {index: index}
                )
                : query

                query = (req.params.path)
                ? query
                  .filter( app.r.row('metadata')('path').eq(req.params.path) )
                : query

                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/
                let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
                if(
                  transformation
                  && (transformation.orderBy
                    || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
                  )
                ){
                  let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
                  query = app.query_with_transformation(query, orderBy)

                  if(Array.isArray(transformation)){
                    transformation = Array.clone(transformation)
                    transformation.each(function(trasnform, index){
                      if(Object.keys(trasnform)[0] === 'orderBy')
                        transformation[index] = undefined
                    })

                    transformation = transformation.clean()
                  }


                }

                if(req.query && req.query.filter)
                  query = app.query_with_filter(query, req.query.filter)

                if(transformation)
                  query = app.query_with_transformation(query, transformation)
                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/

                if (req.query && req.query.aggregation && !req.query.q) {
                  query =  this.result_with_aggregation(query, req.query.aggregation)
                }
                else if(req.query.index === false){
                  query = app.build_query_fields(query, req.query)

                }
                else{
                  query = query
                    .group(app.get_group(req.query.index))
                    .ungroup()
                    .map(
                      function (doc) {
                        // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
                        return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
                      }
                  )

                }

                app.fireEvent('onSuspend')

                query.run(app.conn, app.options.run, function(err, resp){
                  app.fireEvent('onResume')
                  debug_internals('run', err) //resp
                  app.process_default(
                    err,
                    resp,
                    {
                      _extras: {
                        from: from,
                        type: (req.params && req.params.path) ? req.params.path : app.options.type,
                        id: req.id,
                        Range: range,
                        range: req.options.range,
                        transformation: (req.query.transformation) ? req.query.transformation : undefined,
                        aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
                        filter: (req.query.filter) ? req.query.filter : undefined
                        // prop: pluralize(index)
                      }
                    }
                  )
                })
              }

              debug('CONNECTED? %o %s', app.connected, app.options.db)
              if(app.connected === false){
                app.addEvent(app.ON_CONNECT, _default)
              }
              else{
                _default()
              }
            }//

					}
        },

      ],

      /**
      * deletes on selected range
      **/
      range: [
        {
					delete: function(req, next, app){
            // req = (req) ? Object.clone(req) : {}
            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.range)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.range))
              : { params: {}, query: {} }

            // req = (req)
            // ? Object.clone(req)
            // : (app.options && app.options.requests && app.options.requests.req)
            //   ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.requests.req))
            //   : { params: {}, query: {} }

            debug_internals('default range', req, app.options);
            // process.exit(1)
            // if(!req.query || (!req.query.register && !req.query.unregister)){
            if(req.id === 'delete'){

              let start, end
              end = (req.opt && req.opt.range) ? req.opt.range.end : Date.now()
              start  = (req.opt && req.opt.range) ? req.opt.range.start : end - 10000 //10 secs

              let range = 'posix '+start+'-'+end+'/*'


              let from = req.from || app.options.table
              // from = (from === 'minute' || from === 'hour') ? 'historical' : from

              let index = "timestamp"

              let query = app.r
                .db(app.options.db)
                .table(from)

              index = (req.params.prop && req.params.value)
              ? pluralize(req.params.prop, 1)+'.timestamp'
              : index

              start = (req.params.prop && req.params.value)
              ? [req.params.value, start]
              : start

              end = (req.params.prop && req.params.value)
              ? [req.params.value, end]
              : end

              query = (req.params.path)
              ? query
                .between(
                  start,
                  end,
                  {index: index}
                )
                .filter( app.r.row('metadata')('path').eq(req.params.path) )
              : query
                .between(
                  start,
                  end,
                  {index: index}
                )



              /**
              * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
              **/
              let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
              if(
                transformation
                && (transformation.orderBy
                  || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
                )
              ){
                let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
                query = app.query_with_transformation(query, orderBy)

                if(Array.isArray(transformation)){
                  transformation = Array.clone(transformation)
                  transformation.each(function(trasnform, index){
                    if(Object.keys(trasnform)[0] === 'orderBy')
                      transformation[index] = undefined
                  })

                  transformation = transformation.clean()
                }


              }

              if(req.query && req.query.filter)
                query = app.query_with_filter(query, req.query.filter)

              if(transformation)
                query = app.query_with_transformation(query, transformation)
              /**
              * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
              **/

              query.delete().run(app.conn, {durability: "hard"}, function(err, resp){
                debug_internals('run %o %o', err, resp) //resp
                app.process_default(
                  err,
                  resp,
                  {
                    _extras: {
                      from: from,
                      type: (req.params && req.params.path) ? req.params.path : app.options.type,
                      id: req.id,
                      Range: range,
                      range: req.opt.range,
                      transformation: (req.query.transformation) ? req.query.transformation : undefined,
                      aggregation: (req.query.aggregation) ? req.query.aggregation : undefined
                      // prop: pluralize(index)
                    }
                  }
                )
              })

              // if (req.query && req.query.aggregation && !req.query.q) {
              //   query =  this.result_with_aggregation(query, req.query.aggregation)
              //
              //   // query.run(app.conn, {arrayLimit: 10000000}, _result_callback)
              // }
              // else if(req.query.index === false){
              //   query = app.build_query_fields(query, req.query)
              //
              //   debug('NO INDEX %o', query)
              // }
              // else{
              //   query = query
              //     .group(app.get_group(req.query.index))
              //     .ungroup()
              //     .map(
              //       function (doc) {
              //         // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
              //         return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
              //       }
              //   )
              // }
              //
              // query.run(app.conn, {arrayLimit: 10000000}, function(err, resp){
              //   debug_internals('run', err) //resp
              //   app.process_default(
              //     err,
              //     resp,
              //     {
              //       _extras: {
              //         from: from,
              //         type: (req.params && req.params.path) ? req.params.path : app.options.type,
              //         id: (req.query && req.query.id) ? req.query.id : req.id,
              //         Range: range,
              //         range: req.opt.range,
              //         transformation: (req.query.transformation) ? req.query.transformation : undefined,
              //         aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
              //         filter: (req.query.filter) ? req.query.filter : undefined
              //         // prop: pluralize(index)
              //       }
              //     }
              //   )
              // })

            }

					}
				},


      ]

		},

		routes: {

      // distinct: [{
      //   path: ':database/:table',
      //   callbacks: ['distinct']
      // }],
      // distinct: [{
      //   path: ':database/:table',
      //   callbacks: ['distinct']
      // }],
      // nth: [{
      //   path: ':database/:table',
      //   callbacks: ['range']
      // }],
      // changes: [{
      //   // path: ':database/:table',
      //   path: '',
      //   callbacks: ['changes']
      // }],

		},


  },

  process_default: function(err, resp, params, error_on_doc){
    this.parent(err, resp, params, true)
  }




});
