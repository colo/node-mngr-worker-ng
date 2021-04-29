const path = require('path')

const conn = require('../../default.conn')()

let pipelines = [


    require(path.join(process.cwd(), 'apps/educativa/purge/all/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        // filters: Array.clone([
        //   require(path.join(process.cwd(), 'apps/educativa/purge/filters/00_from_default_query_delete_until_last_hour')),
        // ]),
        // type: 'check'
      }
    ),
]


module.exports = pipelines
