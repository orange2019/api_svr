/**
 * @file 阿里OSS服务上传
 */
const OSS = require('ali-oss');


class AliOssUtils 
{
    constructor()
    {
        //配置信息
        this.config = {
            region: 'oss-cn-shenzhen',
            accessKeyId: 'H7tlMQ8JJIiqGLYR',
            accessKeySecret: 'cfk8GkR2VSrLkDYE7mgiHijkpoPSv8',
            bucket: 'cc-img'
        }
        this.client = new OSS(this.config);
    }
    async upload(file)
    {

    }
    async listBuckets () {
        try {
          return await this.client.listBuckets();
        } catch(err) {
            return err.message;
        }
      }
}
client = new AliOssUtils()
client.listBuckets().then(data=>{
    console.log(data)
})
// module.exports = new AliOssUtils();