const smsUitls = require( './../../app/utils/sms_utils' );


// smsUtils.sendSmsCode('13433856321').then(data=>{
//     console.log(data)
// })
smsUitls.validateCode('13433856321','5034').then(data=>{
    console.log(data)
})