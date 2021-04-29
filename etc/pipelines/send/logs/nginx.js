const path = require('path')

const conn = require('../../../default.conn')()
const http_receiver = require('../../http.receiver')

const os = require('os')

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/web/pipeline'))(
  //   {
  //     input: {
  //       file: path.join(process.cwd(), 'devel/var/log/nginx/www.educativa.com-access.log'),
  //       stdin: true,
  //       domain: 'www.educativa.com',
  //     },
  //     output: conn,
  //     opts: {
  //       type: 'nginx',
  //       hostname: os.hostname()
  //     }
  //   }
  // ),


]


/**
* load all access log from dir (production)
**/

const glob = require('glob')
const DIR = path.join(process.cwd(), 'devel/var/log/nginx/')
// const DIR = '/var/log/nginx/'

const files = glob.sync('*access.log', {
  'cwd': DIR
})

Array.each(files, function(file){
  /**
  * Logs
  **/

  let domain = file.replace('-access.log', '')
  domain = domain.replace('access.log', '')
  domain = (domain === '') ? os.hostname() : domain

  pipelines.push(
    // require(path.join(process.cwd(), 'apps/logs/web/pipeline'))(
    require(path.join(process.cwd(), 'apps/logs/web/pipeline-send-remote'))(
      {
        input: {
          file: path.join(DIR, file),
          stdin: false,
          domain: domain
        },
        output: http_receiver,
        opts: {
          type: 'nginx',
          hostname: os.hostname()
        },
      }



    )
  )
})

module.exports = pipelines
