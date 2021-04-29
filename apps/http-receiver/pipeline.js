'use strict'

let debug = require('debug')('Server:Apps:HttpReceiver:Pipeline');
let debug_internals = require('debug')('Server:Apps:HttpReceiver:Pipeline:Internals');

let cron = require('node-cron');

const JSPipelineInputReceivers = require('../../modules/js-pipeline.input.receivers')

module.exports = function(payload){
  let {input, output, filters, opts} = payload


  Array.each(filters, function(filter, i){
    filters[i] = filter(payload)
  })

  if(!Array.isArray(input)) input = [input]

  let inputs = []
  Array.each(input, function(_input){
    let input_conf = Object.merge({
      id: "input.periodical",

      connect_retry_count: -1,
      connect_retry_periodical: 1000,

      requests: {
        /**
         * runnign at 20 secs intervals
         * needs 3 runs to start analyzing from last historical (or from begining)
         * it takes 60 secs to complete, so it makes historical each minute
         * @use node-cron to start on 14,29,44,59....or it would start messuring on a random timestamp
         * */
        periodical: function(dispatch){
          // return cron.schedule('14,29,44,59 * * * * *', dispatch);//every 15 secs
          if(_input.type === 'inmediate' || _input.type === 'second'){
            return cron.schedule('* * * * * *', dispatch);//every second
          }
          else if(_input.type === 'minute'){
            return cron.schedule('* * * * *', dispatch);//every minute
            // return cron.schedule('*/10 * * * * *', dispatch);//DEVEL
          }
          else if(_input.type === 'hour'){
            // return cron.schedule('0 * * * *', dispatch);//every hour 0x:00
            // return cron.schedule('*/10 * * * *', dispatch);//every 10 minutes
            return cron.schedule('* * * * *', dispatch);//every minute
            // return cron.schedule('*/10 * * * * *', dispatch);//testing ML
          }
          // else if(_input.type === 'day'){
          else{
            // return cron.schedule('0 0 * * *', dispatch);//every day...00:00
            return cron.schedule('0 * * * *', dispatch);//every hour 0x:00
            // return cron.schedule('*/10 * * * * *', dispatch);//testing ML
          }
        },
        // periodical: 15000,
        // periodical: 1000,//test
      },
    },
    _input)
    input_conf.receivers = _input.receivers
    inputs.push(new JSPipelineInputReceivers(input_conf))
  })

  payload.input = inputs
  // let conf = {
  //   input: [
  //     new JSPipelineInputClients()
  //
  //   ],
  //
  //   filters: filters,
  //
  // 	output: output
  // }

  return payload
}


// module.exports = function(payload){
//   let {input, output, filters, opts} = payload
//
//
//   Array.each(filters, function(filter, i){
//     filters[i] = filter(payload)
//   })
//
//   let input_conf = Object.merge({
//     id: "input.periodical",
//
//     connect_retry_count: -1,
//     connect_retry_periodical: 1000,
//
//     // requests: {
//     //   /**
//     //    * runnign at 20 secs intervals
//     //    * needs 3 runs to start analyzing from last historical (or from begining)
//     //    * it takes 60 secs to complete, so it makes historical each minute
//     //    * @use node-cron to start on 14,29,44,59....or it would start messuring on a random timestamp
//     //    * */
//     //   periodical: function(dispatch){
//     //     // return cron.schedule('14,29,44,59 * * * * *', dispatch);//every 15 secs
//     //     if(input.type === 'inmediate' || input.type === 'second'){
//     //       return cron.schedule('* * * * * *', dispatch);//every second
//     //     }
//     //     else if(input.type === 'minute'){
//     //       return cron.schedule('* * * * *', dispatch);//every minute
//     //       // return cron.schedule('*/10 * * * * *', dispatch);//DEVEL
//     //     }
//     //     else if(input.type === 'hour'){
//     //       // return cron.schedule('0 * * * *', dispatch);//every hour 0x:00
//     //       // return cron.schedule('*/10 * * * *', dispatch);//every 10 minutes
//     //       return cron.schedule('* * * * *', dispatch);//every minute
//     //       // return cron.schedule('*/10 * * * * *', dispatch);//testing ML
//     //     }
//     //     // else if(input.type === 'day'){
//     //     else{
//     //       // return cron.schedule('0 0 * * *', dispatch);//every day...00:00
//     //       return cron.schedule('0 * * * *', dispatch);//every hour 0x:00
//     //       // return cron.schedule('*/10 * * * * *', dispatch);//testing ML
//     //     }
//     //   },
//     //   // periodical: 15000,
//     //   // periodical: 1000,//test
//     // },
//   },
//   input)
//
//   input_conf.receivers = input.receivers
//   //
//   // let conf = {
//   //   input: [
//   //     new JSPipelineInputReceivers(input_conf)
//   //
//   //   ],
//   //
//   //   filters: filters,
//   //
//   // 	output: output
//   // }
//
//   // conf = Object.merge(conf, opts)
//   payload.input = [new JSPipelineInputReceivers(input_conf)]
//   // debug('payload', payload)
//   // process.exit(1)
//   return payload
// }
