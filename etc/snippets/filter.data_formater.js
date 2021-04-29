'use strict'

const debug = require('debug')('filter:data_formater'),
      debug_internals = require('debug')('filter:data_formater:Internals');

// const data_formater = require('node-tabular-data')
// const path = require('path');
//
//
// let eachOf = require( 'async' ).eachOf
//
// let cache
//
// let data_to_stat = require('node-tabular-data').data_to_stat
// let data_to_tabular = require('node-tabular-data').data_to_tabular
//
// const data_formater = function(data, format, require_path, cb){
//   debug('data_formater FUNC %s %o', format, data)
//   // process.exit(1)
//   if(format && data && (data.length > 0 || Object.getLength(data) > 0)){
//
//     if(format === 'merged'){
//       if(Array.isArray(data) && Array.isArray(data[0])){//array of array
//         // process.exit(1)
//         for(let i = 0; i < data.length; i++){
//           data[i] = merge_result_data(data[i])
//         }
//       }
//       else{
//         data = merge_result_data(data)
//       }
//
//       cb(data)
//     }
//     else{
//
//       // let stat = {}
//       // stat['data'] = (!Array.isArray(data)) ? [data] : data
//
//
//       data = (!Array.isArray(data)) ? [data] : data
//       /**
//       * data should be array of arrays (each array is a grouped path)
//       * when index=false is used, data isn't grouped, so we groupe it here
//       *
//       **/
//       if(!Array.isArray(data[0])){
//         // let tmp_data = []
//         let tmp_obj = {}
//         Array.each(data, function(value, key){
//           // tmp_data.push([value])
//           if(value && value.metadata && value.metadata.path){
//             if(!tmp_obj[value.metadata.path]) tmp_obj[value.metadata.path] = []
//             tmp_obj[value.metadata.path].push(value)
//           }
//         })
//
//         data = []
//         Object.each(tmp_obj, function(value){
//           data.push(value)
//         })
//       }
//
//       debug('FORMAT %o', data)
//       // process.exit(1)
//
//
//       // let stat_counter = 0
//       // let not_equal_length = true
//
//       let transformed = {}
//
//       eachOf(data, function (value, key, callback) {
//         key = (value[0] && value[0].metadata && value[0].metadata.path) ? value[0].metadata.path : key
//         let stat = {}
//         stat['data'] = value
//         __transform_data('stat', key, stat, undefined, require_path, function(value){
//           // transformed[key] = (value && value.stat) ? value.stat : undefined
//           transformed[key] = (value && value.stat && value.stat.data) ? value.stat.data : undefined
//           callback()
//         })
//       }.bind(this), function (err) {
//
//         data = transformed
//
//         debug('FORMAT trasnformed %O', transformed)
//         // process.exit(1)
//         // if( format == 'tabular' && !err && value.stat['data'] && (value.stat['data'].length > 0 || Object.getLength(value.stat['data']) > 0)){
//         // if( format == 'tabular' && data.length > 0){
//         if( format == 'tabular' && Object.getLength(data) > 0){
//           // let transformed = []
//           let transformed = {}
//
//           eachOf(data, function (value, key, callback) {
//             // debug_internals(': __transform_data tabular -> %o %s', value, key) //result
//             // process.exit(1)
//             // if(value && value.data && (value.data.length > 0 || Object.getLength(value.data))){
//             if(value && (value.length > 0 || Object.getLength(value))){
//               // let stat = {}
//               // stat['data'] = value
//
//               // __transform_data('tabular', 'data', value.data, id, function(value){
//               __transform_data('tabular', key, value, undefined, require_path, function(value){
//                 debug_internals(': __transform_data tabular -> %o', value) //result
//                 transformed[key] = value
//                 callback()
//               }.bind(this))
//             }
//             else{
//               // transformed[key] = undefined
//               callback()
//             }
//           }.bind(this), function(err){
//             data = transformed
//
//             cb(data)
//           }.bind(this))
//
//         }
//         else{
//
//           cb(data)
//         }
//
//       }.bind(this))
//
//
//     }
//
//
//   }
//   else{
//     cb(data)
//   }
// }
//
// const __transform_data = function(type, data_path, data, cache_key, require_path, cb){
//   debug_internals('__transform_data', type, data_path, data, require_path)
//   // process.exit(1)
//   let convert = (type == 'stat') ? data_to_stat : data_to_tabular
//
//   let transformed = {}
//   transformed[type] = {}
//
//   let counter = 0 //counter for each path:stat in data
//   // let instances = []
//   let instances = {}
//
//   if(!data || data == null && typeof cb == 'function')
//     cb(transformed)
//
//   /**
//   * first count how many "transform" there are for this data set, so we can fire callback on last one
//   **/
//   let transform_result_length = 0
//   Object.each(data, function(d, path){
//     let transform = __traverse_path_require(type, require_path, (data_path && data_path !== '') ? data_path+'.'+path : path, d)
//
//     if(transform && typeof transform == 'function'){
//       transform_result_length += Object.getLength(transform(d))
//     }
//     // else if(transform){
//       transform_result_length++
//     // }
//   }.bind(this))
//
//   let transform_result_counter = 0
//
//   Object.each(data, function(d, path){
//
//     debug_internals('DATA', d, type, path)
//
//     if(d && d !== null){
//       if (d[0] && d[0].metadata && d[0].metadata.format && d[0].metadata.format == type){
//
//         // if(!d[0].metadata.format[type]){
//         let formated_data = []
//         Array.each(d, function(_d){ formated_data.push(_d.data) })
//         transformed[type] = __merge_transformed(__transform_name(path), formated_data, transformed[type])
//         // }
//
//         if(counter == Object.getLength(data) - 1 && typeof cb == 'function')
//           cb(transformed)
//
//       }
//       else if (
//         (d[0] && d[0].metadata && !d[0].metadata.format && type == 'stat')
//         || (d[0] && !d[0].metadata && type == 'tabular')
//       ){
//         let transform = __traverse_path_require(type, require_path, (data_path && data_path !== '') ? data_path+'.'+path : path, d) //for each path find a transform or use "default"
//
//         // debug_internals('__transform_data', d)
//         if(transform){
//
//           if(typeof transform == 'function'){
//             let transform_result = transform(d, path)
//
//
//             Object.each(transform_result, function(chart, path_key){
//
//               /**
//               * key may use "." to create more than one chart (per key), ex: cpus.times | cpus.percentage
//               **/
//               let sub_key = (path_key.indexOf('.') > -1) ? path_key.substring(0, path_key.indexOf('.')) : path_key
//
//
//               if(type == 'tabular'){
//                 // debug_internals('transform_result', transform_result)
//
//                 let _wrap_convert = function(chart_instance){
//
//                   convert(d[sub_key], chart_instance, path+'.'+path_key, function(name, stat){
//                     transformed[type] = __merge_transformed(name, stat, transformed[type])
//                     // name = name.replace(/\./g, '_')
//                     // let to_merge = {}
//                     // to_merge[name] = stat
//                     //
//                     // transformed = Object.merge(transformed, to_merge)
//                     //
//                     // debug_internals('chart_instance CACHE %o', name, transform_result_counter, transform_result_length)
//
//
//                     // chart_instance = cache.clean(chart_instance)
//                     // // debug_internals('transformed func', name, JSON.stringify(chart_instance))
//                     // instances.push(__transform_name(path+'.'+path_key))
//                     instances[__transform_name(path+'.'+path_key)] = chart_instance
//
//                     /**
//                     * race condition between this app && ui?
//                     **/
//                     // cache.set(cache_key+'.'+type+'.'+__transform_name(path+'.'+path_key), JSON.stringify(chart_instance), CHART_INSTANCE_TTL)
//
//                     if(
//                       transform_result_counter == transform_result_length - 1
//                       && (counter >= Object.getLength(data) - 1 && typeof cb == 'function')
//                     ){
//                       /**
//                       * race condition between this app && ui?
//                       **/
//                       // __save_instances(cache_key, instances, cb.pass(transformed[type]))
//                       cb(transformed[type])
//                     }
//
//                     transform_result_counter++
//                   }.bind(this))
//
//                 }
//                 if(cache && cache_key){
//                   cache.get(cache_key+'.'+type+'.'+__transform_name(path+'.'+path_key), function(err, chart_instance){
//                     // chart_instance = (chart_instance) ? JSON.parse(chart_instance) : chart
//                     chart_instance = (chart_instance) ? chart_instance : chart
//
//                     chart_instance = Object.merge(chart, chart_instance)
//
//                     _wrap_convert(chart_instance)
//
//
//                   }.bind(this))
//                 }
//                 else{
//                   _wrap_convert(chart)
//                 }
//
//               }
//               else{
//                 convert(d[sub_key], chart, path+'.'+path_key, function(name, stat){
//                   transformed[type] = __merge_transformed(name, stat, transformed[type])
//                   // name = name.replace(/\./g, '_')
//                   // let to_merge = {}
//                   // to_merge[name] = stat
//                   //
//                   // debug_internals('transformed func', name, stat)
//                   //
//                   // transformed = Object.merge(transformed, to_merge)
//
//                   if(
//                     transform_result_counter == transform_result_length - 1
//                     && (counter >= Object.getLength(data) - 1 && typeof cb == 'function')
//                   ){
//                     cb(transformed)
//                   }
//
//
//                   transform_result_counter++
//                 })
//
//               }
//
//
//
//
//
//             }.bind(this))
//           }
//           else{//not a function
//
//             /**
//             * @todo: 'tabular' not tested, also counter should consider this case (right now only considers functions type)
//             **/
//             if(type == 'tabular'){
//
//               let _wrap_convert = function(chart_instance){
//                 convert(d, chart_instance, path, function(name, stat){
//                   transformed[type] = __merge_transformed(name, stat, transformed[type])
//                   // name = name.replace(/\./g, '_')
//                   // let to_merge = {}
//                   // to_merge[name] = stat
//                   //
//                   // debug_internals('transformed custom CACHE', cache_key+'.'+type+'.'+path, transformed)
//
//                   // transformed = Object.merge(transformed, to_merge)
//
//                   // chart_instance = cache.clean(chart_instance)
//
//                   // instances.push(__transform_name(path))
//
//
//                   instances[__transform_name(path)] = chart_instance
//                   /**
//                   * race condition between this app && ui?
//                   **/
//                   // cache.set(cache_key+'.'+type+'.'+__transform_name(path), JSON.stringify(chart_instance), CHART_INSTANCE_TTL)
//
//
//                   if(
//                     transform_result_counter == transform_result_length - 1
//                     && (counter >= Object.getLength(data) - 1 && typeof cb == 'function')
//                   ){
//                     /**
//                     * race condition between this app && ui?
//                     **/
//                     // __save_instances(cache_key, instances, cb.pass(transformed[type]))
//                     cb(transformed[type])
//                   }
//
//                   transform_result_counter++
//
//                 }.bind(this))
//               }
//
//               if(cache && cache_key){
//                 cache.get(cache_key+'.'+type+'.'+__transform_name(path), function(err, chart_instance){
//                   // chart_instance = (chart_instance) ? JSON.parse(chart_instance) : transform
//                   chart_instance = (chart_instance) ? chart_instance : transform
//
//                   chart_instance = Object.merge(chart_instance, transform)
//                   // debug_internals('chart_instance NOT FUNC %o', chart_instance)
//
//                   // debug_internals('transformed custom CACHE', cache_key+'.'+type+'.'+path)
//
//                   // throw new Error()
//
//                   _wrap_convert(chart_instance)
//
//
//                 }.bind(this))
//               }
//               else {
//                 _wrap_convert(transform)
//               }
//             }
//             else{
//               convert(d, transform, path, function(name, stat){
//                 transformed[type] = __merge_transformed(name, stat, transformed[type])
//
//                 // name = name.replace(/\./g, '_')
//                 // let to_merge = {}
//                 // to_merge[name] = stat
//                 //
//                 // debug_internals('transformed custom', type, to_merge)
//                 //
//                 // transformed = Object.merge(transformed, to_merge)
//
//                 if(counter == Object.getLength(data) - 1 && typeof cb == 'function')
//                   cb(transformed)
//
//               }.bind(this))
//             }
//
//           }
//
//
//         }
//         else{//default
//           if(type == 'tabular'){ //default transform for "tabular"
//
//             // debug_internals('transform default tabular', path)
//
//             let chart = Object.clone(require(require_path+'/'+type)(d, path))
//
//             let _wrap_convert = function(chart_instance){
//               convert(d, chart_instance, path, function(name, stat){
//                 // debug_internals('transform default tabular %s %o', name, stat)
//                 // if(type !== 'stat')
//                 //   process.exit(1)
//
//                 /**
//                 * clean stats that couldn't be converted with "data_to_tabular"
//                 **/
//                 Array.each(stat, function(val, index){
//                   Array.each(val, function(row, i_row){
//                     if(isNaN(row) && typeof row !== 'string')
//                       val[i_row] = undefined
//                   })
//                   stat[index] = val.clean()
//                   if(stat[index].length <= 1)
//                     stat[index] = undefined
//                 })
//                 stat = stat.clean()
//
//                 // debug_internals('transform default tabular', name, stat)
//
//                 if(stat.length > 0)
//                   transformed[type] = __merge_transformed(name, stat, transformed[type])
//
//
//                 // name = name.replace(/\./g, '_')
//                 // let to_merge = {}
//                 // to_merge[name] = stat
//                 //
//                 // transformed = Object.merge(transformed, to_merge)
//                 // debug_internals('default chart_instance CACHE %o', name)
//
//                 // debug_internals('default chart_instance CACHE %o', name, transform_result_counter, transform_result_length)
//                 // chart_instance = cache.clean(chart_instance)
//                 // // debug_internals('transformed func', name, JSON.stringify(chart_instance))
//                 // instances.push(__transform_name(path))
//                 instances[__transform_name(path)] = chart_instance
//
//                 /**
//                 * race condition between this app && ui?
//                 **/
//                 // cache.set(cache_key+'.'+type+'.'+__transform_name(path), JSON.stringify(chart_instance), CHART_INSTANCE_TTL)
//
//                 debug_internals('transform default tabular %d', transform_result_counter, transform_result_length, counter, Object.getLength(data), typeof cb == 'function', (
//                   transform_result_counter == transform_result_length - 1
//                   && (counter >= Object.getLength(data) - 1 && typeof cb == 'function')
//                 ))
//                 if(
//                   transform_result_counter == transform_result_length - 1
//                   && (counter >= Object.getLength(data) - 1 && typeof cb == 'function')
//                 ){
//
//                   /**
//                   * race condition between this app && ui?
//                   **/
//                   // __save_instances(cache_key, instances, cb.pass(transformed[type]))
//                   cb(transformed[type])
//                 }
//
//                 transform_result_counter++
//               }.bind(this))
//             }
//
//             if(cache && cache_key){
//               cache.get(cache_key+'.'+type+'.'+__transform_name(path), function(err, chart_instance){
//                 // chart_instance = (chart_instance) ? JSON.parse(chart_instance) : chart
//                 chart_instance = (chart_instance) ? chart_instance : chart
//
//                 chart_instance = Object.merge(chart, chart_instance)
//
//                 // debug_internals('transform default tabular', d, path)
//
//                 _wrap_convert(chart_instance)
//
//               }.bind(this))
//             }
//             else{
//               _wrap_convert(chart)
//             }
//           }
//           else{//default transform for "stat"
//             require(require_path+'/'+type)(d, path, function(name, stat){
//               // debug_internals('transform default', d, path, name , stat)
//               // process.exit(1)
//               transformed[type] = __merge_transformed(name, stat, transformed[type])
//               // name = name.replace(/\./g, '_')
//               // let to_merge = {}
//               // to_merge[name] = stat
//               // debug_internals('transformed default', type, to_merge)
//               // transformed = Object.merge(transformed, to_merge)
//
//               // debug_internals('transform default', d, path)
//               // process.exit(1)
//
//               if(counter == Object.getLength(data) - 1 && typeof cb == 'function')
//                 cb(transformed)
//
//             }.bind(this))
//           }
//
//
//         }
//
//         // if(counter == Object.getLength(data) - 1 && typeof cb == 'function')
//         //   cb(transformed)
//
//       }
//       else if(counter == Object.getLength(data) - 1 && typeof cb == 'function'){
//           cb(transformed)
//       }
//
//     }//end if(d && d !== null)
//     else if(counter == Object.getLength(data) - 1 && typeof cb == 'function'){
//         cb(transformed)
//     }
//
//     counter++
//   }.bind(this))
//
//
// }
//
// const merge_result_data = function(data){
//   debug('merge_result_data')
//   let newData
//   if(Array.isArray(data)){
//     debug('merge_result_data TO MERGE ARRAY', data)
//     newData = data.shift()
//
//     for(const i in data){
//       newData = deep_object_merge(newData, data[i])
//     }
//   }
//   else if(typeof data === 'object' && data.constructor === Object && Object.keys(data).length > 0){
//     newData = {}
//     // debug('merge_result_data TO MERGE', data)
//     for(const i in data){
//       debug('merge_result_data TO MERGE', i, data[i])
//       newData[i] = merge_result_data(data[i])
//     }
//   }
//   else{
//     newData = data
//   }
//
//   debug('merge_result_data MERGED', newData)
//
//   return newData
// }
//
// const deep_object_merge = function(obj1, obj2){
//   // debug('deep_object_merge %o %o', obj1, obj2)
//
//   let merged = (obj1) ?  Object.clone(obj1): {}
//
//   for(const key in obj2){
//     if(!obj1[key]){
//       obj1[key] = obj2[key]
//     }
//     else if(obj2[key] !== null && obj1[key] !== obj2[key]){
//       if(typeof obj2[key] === 'object' && obj2[key].constructor === Object && Object.keys(obj2[key]).length > 0){
//         merged[key] = deep_object_merge(merged[key], obj2[key])
//
//         // if(Object.keys(merged).length === 0)
//         //   delete merged[key]
//
//       }
//       else if(Array.isArray(merged[key]) && Array.isArray(obj2[key])){
//         merged[key].combine(obj2[key])
//       }
//       // else if( Object.keys(obj2[key]).length > 0 ){
//       else {
//         if(!Array.isArray(merged[key])){
//           let tmpVal = merged[key]
//           merged[key] = []
//         }
//
//         merged[key].include(obj2[key])
//       }
//
//     }
//
//
//   }
//
//
//   return merged
// }
//
// let traversed_path_require = {}
//
// const __traverse_path_require = function(type, require_path, path, stat, original_path){
//   original_path = original_path || path
//   path = path.replace(/_/g, '.')
//   original_path = original_path.replace(/_/g, '.')
//
//
//   if(traversed_path_require[require_path+'/'+type+'/'+path] && traversed_path_require[require_path+'/'+type+'/'+path] !== undefined){
//     return traversed_path_require[require_path+'/'+type+'/'+path]
//   }
//   else if(traversed_path_require[require_path+'/'+type+'/'+path] === undefined){
//     if(path.indexOf('.') > -1){
//       let pre_path = path.substring(0, path.lastIndexOf('.'))
//       if(traversed_path_require[require_path+'/'+type+'/'+pre_path] !== undefined){
//         let chart = __traverse_path_require(type, pre_path, stat, original_path)
//         traversed_path_require[require_path+'/'+type+'/'+pre_path] = chart
//         return chart
//       }
//     }
//     return undefined
//   }
//   else{
//
//     debug_internals('__traverse_path_require %s',  require_path+'/'+type+'/'+path)
//
//     try{
//       let chart = require(require_path+'/'+type+'/'+path)(stat, original_path)
//       traversed_path_require[require_path+'/'+type+'/'+path] = chart
//       return chart
//     }
//     catch(e){
//       traversed_path_require[require_path+'/'+type+'/'+path] = undefined
//       if(path.indexOf('.') > -1){
//         let pre_path = path.substring(0, path.lastIndexOf('.'))
//         let chart = __traverse_path_require(type, require_path, pre_path, stat, original_path)
//         traversed_path_require[require_path+'/'+type+'/'+pre_path] = chart
//         return chart
//       }
//
//       return undefined
//     }
//
//   }
//
//
//   // let path = path.split('.')
//   // if(!Array.isArray(path))
//   //   path = [path]
//   //
//   // Array.each()
// }
//
// const __merge_transformed = function(name, stat, merge){
//   name = __transform_name(name)
//
//   let to_merge = {}
//   to_merge[name] = stat
//   return Object.merge(merge, to_merge)
// }
//
// const __transform_name = function(name){
//   name = name.replace(/\./g, '_')
//   name = name.replace(/\%/g, 'percentage_')
//   return name
// }

module.exports = require('node-tabular-data')
