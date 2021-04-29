'use strict'

const App = require('../../../../modules/js-pipeline.input.rethinkdb-rest')

// const App = require ( 'node-app-rethinkdb-client/index' )

let debug = require('debug')('Server:Apps:OS:Input:RethinkDB'),
    debug_internals = require('debug')('Server:Apps:OS:Input:RethinkDB:Internals');


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
        /**
        * Once register periodical || changes
        **/
        {
					register: function(req, next, app){
            req = (req)
            ? Object.clone(req)
            : (app.options && app.options.once)
              ? Object.merge({ params: {}, query: {}}, Object.clone(app.options.once))
              : { params: {}, query: {} }

            if(app.options.once && (req.query.register || req.query.unregister)){
              if(!req.query.filter)
                req.query.filter = []

              if(app.options.type === 'minute'){
                // req.query.filter = [
                //   "r.row('metadata')('type').eq('periodical')"
                // ]
                req.query.filter.push("r.row('metadata')('type').eq('periodical')")
              }
              else if(app.options.type === 'hour'){
                req.query.filter.push("r.row('metadata')('type').eq('minute')")
              }

              // debug_internals('register', req);
              // process.exit(1)
              req.params = req.params || {}

              let from = req.from || app.options.table
              // from = (from === 'minute' || from === 'hour') ? 'historical' : from

              let query
              let params = {
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

              if(req.query.register){
                query = app.r
                  .db(app.options.db)
                  .table(from)

                // query = (req.params.prop && req.params.value)
                // ? query
                //   .getAll(req.params.value , {index: pluralize(req.params.prop, 1)})
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

                if(req.query && req.query.filter)
                  query = app.query_with_filter(query, req.query.filter)

                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes')
                  query = query.changes(req.query.opts || app.options.changes)
                  // query = query.changes({includeTypes: true, squash: 1})

                if(req.query && req.query.transformation)
                  query = app.query_with_transformation(query, req.query.transformation)
                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/
                // let transformation = (req.query && req.query.transformation) ? req.query.transformation : undefined
                // if(
                //   transformation
                //   && (transformation.orderBy
                //     || (Array.isArray(transformation) && transformation.some(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy'}))
                //   )
                // ){
                //   let orderBy = (transformation.orderBy) ? transformation.orderBy : transformation.filter(function(trasnform){ return Object.keys(trasnform)[0] === 'orderBy' })[0]//one orderBy
                //   query = app.query_with_transformation(query, orderBy)
                //
                //   if(Array.isArray(transformation)){
                //     transformation = Array.clone(transformation)
                //     transformation.each(function(trasnform, index){
                //       if(Object.keys(trasnform)[0] === 'orderBy')
                //         transformation[index] = undefined
                //     })
                //
                //     transformation = transformation.clean()
                //   }
                //
                //
                // }
                //
                // if(req.query && req.query.filter)
                //   query = app.query_with_filter(query, req.query.filter)
                //
                // if(transformation)
                //   query = app.query_with_transformation(query, transformation)
                /**
                * orderBy need to be called before filters (its order table), other trasnform like "slice" are run after "filters"
                **/

                query = (req.params.path)
                ? query
                  .filter( app.r.row('metadata')('path').eq(req.params.path) )
                : query

                /**
                * changes (feed)
                **/
                if(req.query.register === 'changes' && req.query.q && typeof req.query.q !== 'string'){
                  debug_internals('register query.q', req.query);
                  query = this.build_query_fields(query, {q: [{new_val: req.query.q }, 'type']})
                }


                /**
                * periodical
                **/
                if (req.query.register === 'periodical' && req.query.aggregation && !req.query.q) {
                  query =  this.result_with_aggregation(query, req.query.aggregation)
                }
                else if(req.query.register === 'periodical' && req.query.index === false){
                  query = app.build_query_fields(query, req.query)

                  debug('NO INDEX %o', query)

                }
                else if(req.query.register === 'periodical'){
                  // if(req.query && req.query.q){
                  //   query = query
                  //     .group( app.get_group(req.query.index) )
                  //     // .group( {index:'path'} )
                  //     .ungroup()
                  //     .map(
                  //       function (doc) {
                  //         return app.build_default_query_result(doc, req.query)
                  //       }
                  //     )
                  //
                  //
                  // }
                  // else{
                  //   //Promise
                  //   // process.exit(1)
                  //   query = app.build_default_result_distinct(query,  app.get_distinct(req.query.index))
                  // }
                  if(req.query && (req.query.q || req.query.filter)){
                    query = query
                      .group( app.get_group(req.query.index) )
                      // .group( {index:'path'} )
                      .ungroup()
                      .map(
                        function (doc) {
                          // debug('DOC %o', doc)
                          // return app.build_default_query_result(doc, req.query)
                          return (req.query && req.query.q) ? app.build_default_query_result(doc, req.query) : app.build_default_result(doc)
                        }
                      )


                  }
                  else{
                    query = app.build_default_result_distinct(query,  app.get_distinct(req.query.index))
                  }
                }


                debug('CONNECTED? %o %s', app.connected, app.options.db)
                // process.exit(1)
                if(app.connected === false){
                  app.addEvent(app.ON_CONNECT, function(){
                    app.register(
                      query,
                      req,
                      params
                    )
                  })
                }
                else{
                  app.register(
                    query,
                    req,
                    params
                  )
                }
              }
              else{

                app.unregister(
                  req,
                  params
                )
              }

            }//req.query.register === true
					}
				},

      ],

      periodical: [
				/**
	      * Run registered periodicals
	      **/
        {
					default: function(req, next, app){

            debug_internals('periodical default %s', new Date());

            // if(!req.query || (!req.query.register && !req.query.unregister)){
            if(Object.getLength(app.periodicals) > 0){
              // debug_internals('periodical default %O', app.periodicals);

              Object.each(app.periodicals, function(periodical_req, uuid){
                Object.each(periodical_req, function(periodical, id){
                  let {query, params} = periodical
                  debug_internals('periodical default %s %O', id, periodical);
                  // periodical_req.id = id
                  if(query instanceof Promise){
                    query.then(function(resp) {
                      debug('periodical default result as Promise %o', resp)
                      // process.exit(1)
                      app.process_default(
                        undefined,
                        resp,
                        params
                      )
                    }, function(err) {
                      debug('periodical default ERRROR as Promise %o', err)
                      // process.exit(1)
                      app.process_default(
                        err,
                        undefined,
                        params
                      )
                    })
                  }
                  else{
                    query.run(app.conn, app.options.run, function(err, resp){
                      debug_internals('periodical default run', err, resp)//resp
                      app.process_default(
                        err,
                        resp,
                        params
                      )
                    })
                  }

                }.bind(this))
              }.bind(this))


            } //req.query.register === false
					}
				},

      ],

      range: [


      ]

		},

		routes: {
		},


  },

  process_default: function(err, resp, params, error_on_doc){
    this.parent(err, resp, params, true)
  }




});
