'use strict'

module.exports = function(){
  // let req = request()
  return {
    host: '127.0.0.1',
		port: 28015,
		db: 'production',
    // couchdb: {
    //   request: (redis) ? require('cachemachine')({redis: true, hostname: 'elk'}) : undefined
    // },
  }
}
