/**
 * @file 阿里OSS服务上传工具
 */

const OSS = require('ali-oss');
const path = require('path');
const Log = require('./../../lib/log')('ali_utils')
const dateUtils = require('./date_utils')
const ossConfig = require('./../../config').oss

class AliOssUtils {
    constructor() {
        //配置信息
        this.config = {
            region: ossConfig.region,
            accessKeyId: ossConfig.accessKeyId,
            accessKeySecret: ossConfig.accessKeySecret,
            bucket: ossConfig.bucket,
            allowedExtname: ['jpg', 'jpeg', 'gif', 'bmp']
        }
        this.client = new OSS(this.config);
    }

    /**
     * 上传文件
     * @param {string} file 
     */
    async upload(file) {
        try {
            // let extname = path.extname(file);
            let uploadPath = 'uploads/images/' + dateUtils.dateFormat(null, 'YYYYMMDD/')
            let localFilename = path.basename(file)
            let uploadFileName = localFilename;
            Log.info('upload uploadFileName:', uploadFileName)
            let result = await this.client.put(uploadPath + uploadFileName, file);
            Log.info('upload result:', uploadFileName)
            return result
        } catch (err) {
            Log.error('upload err:', err)
            return false
        }
    }

    // async download (file) {
    //     try {
    //       let result = await this.client.get('object-name', file);
    //       console.log(result);
    //     } catch (err) {
    //       consol.log (err);
    //     }
    // }

    async listBuckets() {
        try {
            return await this.client.listBuckets();
        } catch (err) {
            return err.message;
        }
    }
}

module.exports = new AliOssUtils();

// let demo  = new AliOssUtils();
// demo.upload(__dirname+'/pinyin.js').then(data=>{
//     if(data.res.status != 200){console.log(1)}
//     console.log(data.url)
// })
/**
 * 返回对象example
 * 
 * { name: 'xml_utils1544546276071.js',
  url:
   'http://cc-img.oss-cn-shenzhen.aliyuncs.com/xml_utils1544546276071.js',
  res:
   { status: 200,
     statusCode: 200,
     headers:
      { server: 'AliyunOSS',
        date: 'Tue, 11 Dec 2018 16:37:56 GMT',
        'content-length': '0',
        connection: 'keep-alive',
        'x-oss-request-id': '5C0FE7E4C84D1C4471310EFF',
        etag: '"F7D2555218E97B4C2642EF03EDC3A539"',
        'x-oss-hash-crc64ecma': '14494842173845212806',
        'content-md5': '99JVUhjpe0wmQu8D7cOlOQ==',
        'x-oss-server-time': '95' },
     size: 0,
     aborted: false,
     rt: 170,
     keepAliveSocket: false,
     data: <Buffer >,
     requestUrls:
      [ 'http://cc-img.oss-cn-shenzhen.aliyuncs.com/xml_utils1544546276071.js' ],
     timing: null,
     remoteAddress: '120.77.166.188',
     remotePort: 80,
     socketHandledRequests: 1,
     socketHandledResponses: 1 } }
 */