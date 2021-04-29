const path = require('path')

const conn = require('../../servers/logs.conn')()
const conn_historical = require('../../servers/historical.conn')()

/**
* purge
**/
const periodical_purge_filters = [
  //require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
    require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_15_mins')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]

const hour_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_week')),
]

const day_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_month')),
]

let pipelines = [



    /**
    * OS Purge
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'logs',
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
                    "r.row('metadata')('type').eq('periodical')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'logs'}),
        filters: Array.clone(periodical_purge_filters),

      }

    ),


    /**
    * OS Purge - minute
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'minute',
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
                    "r.row('metadata')('type').eq('minute')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical'}),
        filters: Array.clone(minute_purge_filters),

      }

    ),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'minute',
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
                    "r.row('metadata')('type').eq('minute')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical_minute'}),
        filters: Array.clone(minute_purge_filters),

      }

    ),


    /**
    * OS Purge - hour
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'hour',
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
                    "r.row('metadata')('type').eq('hour')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical'}),
        filters: Array.clone(hour_purge_filters),

      }

    ),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'hour',
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
                    "r.row('metadata')('type').eq('hour')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical_hour'}),
        filters: Array.clone(hour_purge_filters),

      }

    ),


    /**
    * OS Purge - day
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'day',
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
                    "r.row('metadata')('type').eq('day')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical'}),
        filters: Array.clone(day_purge_filters),

      }

    ),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn_historical), {
            table: 'logs_historical',
            type: 'day',
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
                    "r.row('metadata')('type').eq('day')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn_historical), {table: 'logs_historical_day'}),
        filters: Array.clone(day_purge_filters),

      }

    ),
]


module.exports = pipelines
