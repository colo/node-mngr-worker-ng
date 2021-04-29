const path = require('path')

const conn = require('../default.conn')()
const http_os = require('../../http.os')
// const http_receiver = require('../http.receiver')

let pipelines = [

    /**
    * OS
    **/
    require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, http_receiver),
]


module.exports = pipelines
