"use strict";

const express = require('express');
const router = express.Router();
const CrabTypeController = require('../../controllers/crabType.controller');
const asyncHandle = require('../../utils/asyncHandle');
const { checkAuthentication, checkIsAdmin } = require('../../middlewares');

router.post('/', checkAuthentication, asyncHandle(CrabTypeController.createCrabType));
router.get('/', checkAuthentication, asyncHandle(CrabTypeController.getAllCrabTypesByUser));
router.get('/by-depot/:depotId', checkAuthentication, asyncHandle(CrabTypeController.getAllCrabTypesByDepot));
router.get('/:id', checkAuthentication, asyncHandle(CrabTypeController.getCrabTypeById));
router.put('/:id', checkAuthentication, asyncHandle(CrabTypeController.updateCrabType));
router.delete('/:id', checkAuthentication, asyncHandle(CrabTypeController.deleteCrabType));

module.exports = router;
