/**
 * contoller router
 */

let fs = require('fs')
let path = require('path')

let controller = (parent , options) => {
  let verbose = options.verbose
  let readControllerPath = path.join(__dirname , './../app/controller')
  fs.readdirSync(readControllerPath).forEach((fileName) => {
    verbose && console.log('add file or folder :' + readControllerPath + '/' + fileName)
    let obj = require('./../app/controller/' + fileName)
    let objName = fileName.replace('.js' , '')

    // index转为空
    if(objName === 'index'){
      objName = ''
    }

    parent.use('/' + objName , obj)
  })
}

module.exports = controller