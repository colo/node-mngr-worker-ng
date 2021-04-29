const path = require('path')

const conn = require('../../../default.conn')()
const http_receiver = require('../../http.receiver')

const os = require('os')

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/educativa/pipeline'))(
  //   {
  //     input: {
  //       file: path.join(process.cwd(), 'devel/var/log/apache2/educativa/ID.log'),
  //       stdin: true,
  //       domain: 'ID',
  //     },
  //     output: conn,
  //     opts: {
  //       type: 'educativa',
  //       hostname: os.hostname()
  //     }
  //   }
  // ),


]

/**
* load all access log from dir (production)
**/

const glob = require('glob')
const DIR = path.join(process.cwd(), 'devel/var/log/apache2/educativa/')
// const DIR = '/var/log/apache2/educativa/'

const files = glob.sync('*.log', {
  'cwd': DIR
})

Array.each(files, function(file){
  /**
  * Logs
  **/

  let domain = file.replace('.log', '')
  // domain = domain.replace('access.log', '')
  // domain = (domain === '') ? os.hostname() : domain

  pipelines.push(
    require(path.join(process.cwd(), 'apps/logs/educativa/pipeline-send-remote'))(
      {
        input: {
          file: path.join(DIR, file),
          stdin: false,
          domain: domain
        },
        output: conn,
        opts: {
          type: 'educativa',
          hostname: os.hostname()
        }
      }



    )
  )
})

module.exports = pipelines
