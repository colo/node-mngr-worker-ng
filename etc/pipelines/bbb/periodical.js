const path = require('path')

const conn = require('../../default.conn')()
const bbb_conn = require('../../bbb.conn.js')()


let pipelines = [
    require(path.join(process.cwd(), 'apps/bbb/pipeline'))(bbb_conn, conn),
]


module.exports = pipelines
