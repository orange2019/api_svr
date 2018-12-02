/**
 * @file 用户登录注册等相关操作接口文件
 */
'use strict';
const express = require('express');
const router = express.Router();
const accountService = require('./../../service/account_service');


router.post('/login', (req, res) => {
    return res.send(
        JSON.stringify({
            code: 200,
            message: 'success'
        })
    );
});

router.post('/register', (req, res) => {
    return res.send(
        JSON.stringify({
            code: 200,
            message: 'success'
        })
    )
});

router.post('/change_pw', async (req, res) => {
    // let message;
    let params = req.body;
    await accountService._changePassword(params)
    return res.return(req.ctx);
    // .then(data=>{
    //     message = 'success!';
    //     return res.send(
    //         JSON.stringify({code:200,message:message})
    //     )
    // })
    // .catch(err=>{
    //     console.log(err);
    //     message = err.message;
    //     return res.send(
    //         JSON.stringify({code:200,message:message})
    //     )
    // })
});

router.post('/info', (req, res) => {
    let {
        user_id
    } = req.body;
    accountService.accountInfo(user_id)
        .then(data => {
            return res.send(
                JSON.stringify({
                    code: 200,
                    message: data
                })
            )
        });

});




module.exports = router;