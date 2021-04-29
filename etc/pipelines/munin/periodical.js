const path = require('path')

const conn = require('../../default.conn')()
const munin = require('../../munin')


let pipelines = [

    /**
    * Munin
    **/
    require(path.join(process.cwd(), 'apps/munin/pipeline'))(munin, conn),
    // require(path.join(process.cwd(), 'apps/munin/pipeline'))(Object.merge(Object.clone(munin), { host: 'elk' }), conn),
    //

]


module.exports = pipelines
