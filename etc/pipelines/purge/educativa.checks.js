const path = require('path')

const conn = require('../../servers/vhosts.conn')()

/**
* purge
**/
const periodical_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
]


let pipelines = [



    /**
    * Checks Purge
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'educativa',
            type: 'periodical',
            full_range: true,
            requests: {
              req : {
                query: {
                  'q': [
                    {'metadata': ['timestamp', 'type']},
                  ],
                  'transformation': [
                    {
                      'orderBy': { 'index': 'r.asc(timestamp)' }
                    },
                    { 'limit': 1 }
                  ],
                  'filter': [
                    "r.row('metadata')('type').eq('check')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        filters: Array.clone(periodical_purge_filters),

      }

    ),

]


module.exports = pipelines
