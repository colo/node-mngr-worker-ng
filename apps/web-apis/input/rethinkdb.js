'use strict'

const App = require('../../../modules/js-pipeline.input.rethinkdb-rest')

// const App = require ( 'node-app-rethinkdb-client/index' )

let debug = require('debug')('Server:Apps:Stats:Input:periodical'),
    debug_internals = require('debug')('Server:Apps:Stats:Input:periodical:Internals');


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

const roundMinutes = function(timestamp){
  timestamp = roundSeconds(timestamp)
  let d = new Date(timestamp)
  d.setMinutes(0)

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
  options: {
    changes: {includeTypes: true, squash: false},
    // run: { maxBatchSeconds: 1},
    db: undefined,
    table: undefined,
    type: undefined,

    requests : {
      once: [
        {
					range: function(req, next, app){
            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.once)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.once))
              : { params: {}, query: {} }

            if(app.options.once && req.id === 'once.range' && (!req.query || (!req.query.register && !req.query.unregister))){
              debug_internals('default range ONCE', req, app.options.type)
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
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : roundMilliseconds (Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : roundSeconds(end - SECOND)//- MINUTE
                  }
                  else if(app.options.type === 'hour'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : roundSeconds(Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : roundMinutes(end - MINUTE)//  - MINUTE
                  }
                  else if(app.options.type === 'day'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : roundMinutes(Date.now())
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : roundHours(end- HOUR)// - MINUTE
                  }
                  else if(app.options.type === 'week'){
                    end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : roundHours (Date.now())
                    // start  = (req.options && req.options.range) ? req.options.range.start : roundHours(end) - WEEK
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : roundHours(end - HOUR - WEEK)
                  }
									else{
										end = (req.options && req.options.range && req.options.range.end) ? req.options.range.end : Date.now()
                    start  = (req.options && req.options.range && req.options.range.start) ? req.options.range.start : end - SECOND
									}
                }


                req.options = req.options || {}
                // req.options.range = (full_range === true || !req.options.range) ? {start: start, end: end} : req.options.range
								req.options.range =  {start: start, end: end}
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
        {
					default: function(req, next, app){
            // debug_internals('default %o %o', req, app.options.once);
            // if(req && req.id === 'once')
            // process.exit(1)

            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.once)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.once))
              : { params: {}, query: {} }

            // if(app.options.once && req.id !== 'once_range' && (!req.query || (!req.query.register && !req.query.unregister))){
            if(req.id === 'default' && (!req.query || (!req.query.register && !req.query.unregister))){
              debug_internals('default %o %o', req, app.options.once);
              // process.exit(1)

              let _default = function(){

                // let distinct_indexes = (req.params && req.params.prop ) ? pluralize(req.params.prop, 1) : app.distinct_indexes
                // if(!Array.isArray(distinct_indexes))
                //   distinct_indexes = [distinct_indexes]
                //
                // debug_internals('property', distinct_indexes);

                let from = req.from || app.options.table


                let query = app.r
                  .db(app.options.db)
                  .table(from)

                // query = (req.params.prop && req.params.value)
                // ? query
                //   .getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
                // : query
                if(req.params.prop && req.params.value){
                  if(!Array.isArray(req.params.value))
                    try{
                      req.params.value = JSON.parse(req.params.value)
                    }
                    catch(e){
                      req.params.value = [req.params.value]
                    }

                  query = query.getAll(app.r.args(req.params.value) , {index: pluralize(req.params.prop, 1)})
                }

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

                // debug('WITH PATH', req.params.path)
                // query = (req.params.path)
                // ? query
                //   .filter( app.r.row('metadata')('path').eq(req.params.path) )
                // : query

                let _result_callback = function(err, resp){
                  debug_internals('run', err)//resp
                  app.process_default(
                    err,
                    resp,
                    {
                      _extras: {
                        from: from,
                        type: (req.params && req.params.path) ? req.params.path : app.options.type,
                        id: req.id,
                        transformation: (req.query.transformation) ? req.query.transformation : undefined,
                        aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
                        filter: (req.query.filter) ? req.query.filter : undefined
                        // prop: pluralize(index)
                      }
                    }
                  )
                }

                if (req.query && req.query.aggregation && !req.query.q) {
                  query =  this.result_with_aggregation(query, req.query.aggregation)

                  query.run(app.conn, app.options.run, _result_callback)
                }
                else if(req.query.index === false){
                  query = app.build_query_fields(query, req.query)

                  debug('NO INDEX %o', query)

                  query.run(app.conn, app.options.run, _result_callback)

                }
                else{
                  if(req.query && (req.query.q || req.query.filter)){
                    query = query
                      .group( app.get_group(req.query.index) )
                      // .group( {index:'path'} )
                      .ungroup()
                      .map(
                        function (doc) {
                          debug('DOC %o', doc)
                          // return app.build_default_query_result(doc, req.query)
                          return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
                        }
                      )
                      .run(app.conn, app.options.run, _result_callback)

                  }
                  else{
                    app.build_default_result_distinct(query, app.get_distinct(req.query.index), _result_callback)
                  }


                  // query = query
                  //   .group( app.r.row('metadata')('path') )
                  //   // .group( {index:'path'} )
                  //   .ungroup()
                  //   .map(
                  //     function (doc) {
                  //         return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
                  //     }
                  //   )

                }
              }

              debug('CONNECTED? %o %s', app.connected, app.options.db)
              if(app.connected === false){
                app.addEvent(app.ON_CONNECT, _default)
              }
              else{
                _default()
              }

            } //req.query.register === false


					}
				},


      ],

      /**
      * periodical data always comes from 'periodical' table
      **/
      periodical: [
        // {
				// 	default: function(req, next, app){
        //     // req = (req)
        //     // ? Object.clone(req)
        //     // : (app.options && app.options.periodical)
        //     //   ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.periodical))
        //     //   : { params: {}, query: {} }
        //
        //     debug_internals('periodical default %s', new Date());
        //
        //     // if(!req.query || (!req.query.register && !req.query.unregister)){
        //     if(Object.getLength(app.periodicals) > 0){
        //       // debug_internals('periodical default %O', app.periodicals);
        //       // process.exit(1)
        //
        //       Object.each(app.periodicals, function(periodical_req, uuid){
        //         Object.each(periodical_req, function(periodical, id){
        //           let {query, params} = periodical
        //           debug_internals('periodical default %s %O', id, periodical);
        //           // periodical_req.id = id
        //           if(query instanceof Promise){
        //             query.then(function(resp) {
        //               debug('periodical default result as Promise %o', resp)
        //               // process.exit(1)
        //               app.process_default(
        //                 undefined,
        //                 resp,
        //                 params
        //               )
        //             }, function(err) {
        //               debug('periodical default ERRROR as Promise %o', err)
        //               // process.exit(1)
        //               app.process_default(
        //                 err,
        //                 undefined,
        //                 params
        //               )
        //             })
        //           }
        //           else{
        //             query.run(app.conn, app.options.run, function(err, resp){
        //               debug_internals('periodical default run', err, resp)//resp
        //               app.process_default(
        //                 err,
        //                 resp,
        //                 params
        //               )
        //             })
        //           }
        //
        //         }.bind(this))
        //       }.bind(this))
        //
        //
        //     } //req.query.register === false
				// 	}
				// },

        /**
        * Added
        **/
        // {
				// 	range: function(req, next, app){
        //     req = (req)
        //     ? Object.clone(req)
        //     : (app.options && app.options.periodical)
        //       ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.periodical))
        //       : { params: {}, query: {} }
        //
        //     if(app.options.periodical && req.id === 'range' && (!req.query || (!req.query.register && !req.query.unregister))){
        //       debug_internals('default range', req, app.options.type)
        //       // process.exit(1)
        //
        //       let _default = function(){
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
        //         let from = req.from || app.options.table
        //         // from = (from === 'minute' || from === 'hour') ? 'historical' : from
        //
        //         let index = "timestamp"
        //
        //         let query = app.r
        //           .db(app.options.db)
        //           .table(from)
        //
        //         index = (req.params.prop && req.params.value)
        //         ? pluralize(req.params.prop, 1)+'.timestamp'
        //         : index
        //
        //         start = (req.params.prop && req.params.value)
        //         ? [req.params.value, start]
        //         : start
        //
        //         end = (req.params.prop && req.params.value)
        //         ? [req.params.value, end]
        //         : end
        //
        //         query = (full_range !== true)
        //         ? query.between(
        //           start,
        //           end,
        //           {index: index}
        //         )
        //         : query
        //
        //         query = (req.params.path)
        //         ? query
        //           .filter( app.r.row('metadata')('path').eq(req.params.path) )
        //         : query
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
        //         if (req.query && req.query.aggregation && !req.query.q) {
        //           query =  this.result_with_aggregation(query, req.query.aggregation)
        //         }
        //         else if(req.query.index === false){
        //           query = app.build_query_fields(query, req.query)
        //
        //         }
        //         else{
        //           query = query
        //             .group(app.get_group(req.query.index))
        //             .ungroup()
        //             .map(
        //               function (doc) {
        //                 // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
        //                 return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
        //               }
        //           )
        //
        //         }
        //
        //         app.fireEvent('onSuspend')
        //
        //         query.run(app.conn, app.options.run, function(err, resp){
        //           app.fireEvent('onResume')
        //           debug_internals('run', err) //resp
        //           app.process_default(
        //             err,
        //             resp,
        //             {
        //               _extras: {
        //                 from: from,
        //                 type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //                 id: req.id,
        //                 Range: range,
        //                 range: req.options.range,
        //                 transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //                 aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
        //                 filter: (req.query.filter) ? req.query.filter : undefined
        //                 // prop: pluralize(index)
        //               }
        //             }
        //           )
        //         })
        //       }
        //
        //       debug('CONNECTED? %o %s', app.connected, app.options.db)
        //       if(app.connected === false){
        //         app.addEvent(app.ON_CONNECT, _default)
        //       }
        //       else{
        //         _default()
        //       }
        //     }//
        //
				// 	}
				// },
      ],

      range: [
        // {
				// 	default: function(req, next, app){
        //     req = (req)
        //     ? Object.clone(req)
        //     : (app.options && app.options.range)
        //       ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.range))
        //       : { params: {}, query: {} }
        //
        //     debug_internals('default range', app.options.range, req);
        //     // process.exit(1)
        //
				// 		if(app.options.range && req.id === 'range' && (app.options.range && !req.query || (!req.query.register && !req.query.unregister))){
        //       debug_internals('default range', req);
        //       // process.exit(1)
        //
        //       let _range = function(req, callback){
        //         let start, end
        //         end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //         start  = (req.options && req.options.range) ? req.options.range.start : end - 10000 //10 secs
        //
        //         let range = 'posix '+start+'-'+end+'/*'
        //
        //
        //         let from = req.from || app.options.table
        //         // from = (from === 'minute' || from === 'hour') ? 'historical' : from
        //
        //         let index = "timestamp"
        //
        //         let query = app.r
        //           .db(app.options.db)
        //           .table(from)
        //
        //         index = (req.params.prop && req.params.value)
        //         ? pluralize(req.params.prop, 1)+'.timestamp'
        //         : index
        //
        //         start = (req.params.prop && req.params.value)
        //         ? [req.params.value, start]
        //         : start
        //
        //         end = (req.params.prop && req.params.value)
        //         ? [req.params.value, end]
        //         : end
        //
        //
        //         query = (req.params.path)
        //         ? query
        //           .between(
        //             start,
        //             end,
        //             {index: index}
        //           )
        //           .filter( app.r.row('metadata')('path').eq(req.params.path) )
        //         : query
        //           .between(
        //             start,
        //             end,
        //             {index: index}
        //           )
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
        //         if (req.query && req.query.aggregation && !req.query.q) {
        //           query =  this.result_with_aggregation(query, req.query.aggregation)
        //         }
        //         else if(req.query.index === false){
        //           query = app.build_query_fields(query, req.query)
        //
        //         }
        //         else{
        //           query = query
        //             .group(app.get_group(req.query.index))
        //             .ungroup()
        //             .map(
        //               function (doc) {
        //                 // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
        //                 return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
        //               }
        //           )
        //
        //         }
        //
        //         query.run(app.conn, app.options.run, function(err, resp){
        //           if(callback)
        //             callback()
        //
        //           debug_internals('run', err) //resp
        //           app.process_default(
        //             err,
        //             resp,
        //             {
        //               _extras: {
        //                 from: from,
        //                 type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //                 id: req.id,
        //                 Range: range,
        //                 range: req.options.range,
        //                 transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //                 aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
        //                 filter: (req.query.filter) ? req.query.filter : undefined
        //                 // prop: pluralize(index)
        //               }
        //             }
        //           )
        //         })
        //
        //       }// _range = func
        //
        //       if(req.query && Array.isArray(req.query)){
        //         async.eachLimit(
        //           req.query,
        //           1,
        //           function(sub_query, callback) {
        //             sub_query = Object.merge(Object.clone(req), Object.clone(sub_query))
        //             debug('RANGE array sub_query %o', sub_query)
        //             // process.exit(1)
        //
        //             _range(sub_query, callback)
        //
        //         }, function(err) {
        //             // if any of the file processing produced an error, err would equal that error
        //             if( err ) {
        //               // // One of the iterations produced an error.
        //               // // All processing will now stop.
        //               // console.log('A file failed to process');
        //             } else {
        //               debug('RANGE array queries finished')
        //               // process.exit(1)
        //             }
        //         });
        //       }
        //       else{
        //         _range(req)
        //       }
        //
        //     }
        //
				// 	}
				// },

        // {
        //   register: function(req, next, app){
        //     req = (req)
        //     ? Object.clone(req)
        //     : (app.options && app.options.range)
        //       ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.range))
        //       : { params: {}, query: {} }
        //
        //     if(app.options.range && (req.query.register || req.query.unregister)){
        //       debug_internals('range register', req);
        //       req.params = req.params || {}
        //
        //       let start, end
        //       end = (req.options && req.options.range) ? req.options.range.end : Date.now()
        //       start  = (req.options && req.options.range) ? req.options.range.start : end - 10000 //10 secs
        //
        //       let range = 'posix '+start+'-'+end+'/*'
        //
        //
        //       let from = req.from || app.options.table
        //       // from = (from === 'minute' || from === 'hour') ? 'historical' : from
        //
        //       let index = "timestamp"
        //
        //
        //       let query
        //       // let params = {
        //       //   _extras: {
        //       //     from: from,
        //       //     type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //       //     id: req.id,
        //       //     transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //       //     aggregation: (req.query.aggregation) ? req.query.aggregation : undefined
        //       //     // prop: pluralize(index)
        //       //   }
        //       // }
        //       let params = {
        //         _extras: {
        //           from: from,
        //           type: (req.params && req.params.path) ? req.params.path : app.options.type,
        //           id: req.id,
        //           Range: range,
        //           range: req.options.range,
        //           transformation: (req.query.transformation) ? req.query.transformation : undefined,
        //           aggregation: (req.query.aggregation) ? req.query.aggregation : undefined,
        //           filter: (req.query.filter) ? req.query.filter : undefined
        //           // prop: pluralize(index)
        //         }
        //       }
        //
        //       if(req.query.register){
        //         query = app.r
        //           .db(app.options.db)
        //           .table(from)
        //
        //         index = (req.params.prop && req.params.value)
        //         ? pluralize(req.params.prop, 1)+'.timestamp'
        //         : index
        //
        //         start = (req.params.prop && req.params.value)
        //         ? [req.params.value, start]
        //         : start
        //
        //         end = (req.params.prop && req.params.value)
        //         ? [req.params.value, end]
        //         : end
        //
        //         query = (req.params.path)
        //         ? query
        //           .between(
        //           	start,
        //           	end,
        //           	{index: index}
        //           )
        //           .filter( app.r.row('metadata')('path').eq(req.params.path) )
        //         : query
        //           .between(
        //           	start,
        //           	end,
        //           	{index: index}
        //           )
        //
        //         if(req.query && req.query.filter)
        //           query = app.query_with_filter(query, req.query.filter)
        //         /**
        //         * changes (feed)
        //         **/
        //         if(req.query.register === 'changes')
        //           query = query.changes(req.query.opts || app.options.changes)
        //
        //         if(req.query && req.query.transformation)
        //           query = app.query_with_transformation(query, req.query.transformation)
        //
        //         query = (req.params.path)
        //         ? query
        //           .filter( app.r.row('metadata')('path').eq(req.params.path) )
        //         : query
        //
        //         /**
        //         * changes (feed)
        //         **/
        //         if(req.query.register === 'changes' && req.query.q && typeof req.query.q !== 'string'){
        //           debug_internals('register query.q', req.query);
        //           query = this.build_query_fields(query, {q: [{new_val: req.query.q }, 'type']})
        //         }
        //
        //
        //         /**
        //         * periodical
        //         **/
        //         if (req.query.register === 'periodical' && req.query.aggregation && !req.query.q) {
        //           query =  this.result_with_aggregation(query, req.query.aggregation)
        //         }
        //         else if(req.query.index === false){
        //           query = app.build_query_fields(query, req.query)
        //
        //           debug('NO INDEX %o', query)
        //
        //           // query.run(app.conn, app.options.run, _result_callback)
        //
        //         }
        //         else if(req.query.register === 'periodical'){
        //           query = query
        //             .group( app.get_group(req.query.index) )
        //             // .group( {index:'path'} )
        //             .ungroup()
        //             .map(
        //               function (doc) {
        //                 // return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result_between(doc)
        //                 return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc, (req.query.index) ? req.query.index : 'path')
        //               }
        //           )
        //         }
        //
        //
        //         app.register(
        //           query,
        //           req,
        //           params
        //         )
        //       }
        //       else{
        //
        //         app.unregister(
        //           req,
        //           params
        //         )
        //       }
        //
        //     }//req.query.register === true
        //   }
        // },

      ]

		},

		routes: {
		},


  },

  process_default: function(err, resp, params, error_on_doc){
    this.parent(err, resp, params, true)
  }




});
