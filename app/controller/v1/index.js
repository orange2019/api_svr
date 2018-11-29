/**
 * @file 总包含文件
 */
'use strict';
const express = require('express');
const router = express.Router();


router.use('/account' , require('./account'));

module.exports = router