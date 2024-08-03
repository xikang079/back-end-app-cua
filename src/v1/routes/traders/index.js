"use strict";

const express = require('express');
const router = express.Router();
const TraderController = require('../../controllers/trader.controller');
const asyncHandle = require('../../utils/asyncHandle');
const { checkAuthentication, checkIsAdmin } = require('../../middlewares');

router.post('/', checkAuthentication, asyncHandle(TraderController.createTrader));
router.get('/', checkAuthentication, asyncHandle(TraderController.getAllTradersByUser));
router.get('/by-depot/:depotId', checkAuthentication, asyncHandle(TraderController.getAllTradersByDepot));
router.get('/:id', checkAuthentication, asyncHandle(TraderController.getTraderById));
router.put('/:id', checkAuthentication, asyncHandle(TraderController.updateTrader));
router.delete('/:id', checkAuthentication, asyncHandle(TraderController.deleteTrader));

module.exports = router;

