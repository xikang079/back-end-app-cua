"use strict"

const express = require('express');
const router = express.Router();

router.use('/auths', require('./auths'));
router.use('/crabTypes', require('./crabTypes'));
router.use('/traders', require('./traders'));
router.use('/crabPurchases', require('./crabPurchases'));

module.exports = router;