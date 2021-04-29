const path = require('path')

const conn = require('../../default.conn')()

const os = require('os')

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/web/pipeline'))(
  //   {
  //     input: {
  //       file: path.join(process.cwd(), 'devel/var/log/apache2/www.educativa.com-access.log'),
  //       stdin: true,
  //       domain: 'www.educativa.com',
  //     },
  //     output: conn,
  //     opts: {
  //       type: 'apache2',
  //       schema: '$remote_addr - $remote_user [$time_local] '
  //           + '"$request" $status $body_bytes_sent '
  //           + '"$http_user_agent" "$http_x_forwarded_for"'
  //     }
  //   }
  // ),


]


/**
* load all access log from dir (production)
**/

const glob = require('glob')

const DIR = path.join(process.cwd(), 'devel/var/log/apache2/')
// const DIR = '/var/log/apache2/'

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
    require(path.join(process.cwd(), 'apps/logs/web/pipeline'))(
      {
        input: {
          file: path.join(DIR, file),
          stdin: false,
          domain: domain
        },
        output: conn,
        opts: {
          type: 'apache2',
          hostname: os.hostname(),
          schema: '$remote_addr - $remote_user [$time_local] '
              + '"$request" $status $body_bytes_sent '
              + '"$http_user_agent" "$http_x_forwarded_for"'
        }
      }



    )
  )
})

module.exports = pipelines
