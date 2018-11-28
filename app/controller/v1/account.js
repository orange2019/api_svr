/**
 * @file 用户登录注册等相关操作接口文件
 */
'use strict';
const express = require('express');
const router  = express.Router();
const multer = require('multer');
const path = require('path');
const fs   = require('fs');


router.post('/login', (req,res) => {
    return res.send(
        JSON.stringify({code:200, message: 'success'})
      );
});

router.post('/register', (req,res) => {
    return res.send(
        JSON.stringify({code:200,message:'success'})
    )
});


module.exports = router;