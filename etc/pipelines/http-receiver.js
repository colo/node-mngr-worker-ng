const path = require('path')

const conn = require('../default.conn')()
const http_receiver = require('../http.receiver')


let pipelines = [

    /**
    * OS
    **/

    require(path.join(process.cwd(), 'apps/http-receiver/pipeline'))({
      input: http_receiver,
      output: conn,
      filters: []
    }),

]


module.exports = pipelines
