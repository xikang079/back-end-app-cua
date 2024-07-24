"use strict";

const express = require('express');
const router = express.Router();
const CrabPurchaseController = require('../../controllers/crabPurchase.controller');
const asyncHandle = require('../../utils/asyncHandle');
const { checkAuthentication, checkIsAdmin, checkOwnership } = require('../../middlewares/index');
const CrabPurchase = require('../../models/crabPurchase.model');

// CRUD hóa đơn mua cua
router.post('/', checkAuthentication, asyncHandle(CrabPurchaseController.createCrabPurchase));
router.get('/', checkAuthentication, asyncHandle(CrabPurchaseController.getAllCrabPurchases));
router.get('/:id', checkAuthentication, checkOwnership(CrabPurchase, 'id'), asyncHandle(CrabPurchaseController.getCrabPurchaseById));
router.put('/:id', checkAuthentication, checkOwnership(CrabPurchase, 'id'), asyncHandle(CrabPurchaseController.updateCrabPurchase));
router.delete('/:id', checkAuthentication, checkOwnership(CrabPurchase, 'id'), asyncHandle(CrabPurchaseController.deleteCrabPurchase));

// Các route tổng hợp và báo cáo
router.get('/depot/:depotId/date/:date', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDepotAndDate));
router.get('/depot/:depotId/trader/:traderId', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDepotAndTrader));
router.get('/depot/:depotId/month/:month/year/:year', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDepotAndMonth));
router.get('/depot/:depotId/year/:year', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDepotAndYear));
router.get('/all/by-depot', checkAuthentication, checkIsAdmin, asyncHandle(CrabPurchaseController.getAllCrabPurchasesByDepot));
router.post('/depot/:depotId/summary/today', checkAuthentication, asyncHandle(CrabPurchaseController.createDailySummaryByDepotToday));
router.get('/depot/:depotId/summary/today', checkAuthentication, asyncHandle(CrabPurchaseController.getDailySummaryByDepotToday));
router.get('/depot/:depotId/summaries', checkAuthentication, asyncHandle(CrabPurchaseController.getAllDailySummariesByDepot));
router.get('/summaries/all', checkAuthentication, checkIsAdmin, asyncHandle(CrabPurchaseController.getAllDailySummariesForAdmin));
router.get('/summaries/date/:date', checkAuthentication, checkIsAdmin, asyncHandle(CrabPurchaseController.getDailySummariesByDateForAdmin));

// Route mới để xóa báo cáo cuối ngày
router.delete('/depot/:depotId/summary/:summaryId', checkAuthentication, asyncHandle(CrabPurchaseController.deleteDailySummary));

// Route mới để lấy hoá đơn theo khoảng thời gian
router.get('/depot/:depotId/date-range', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDateRange));

// Route mới để lấy summaries theo tháng
router.get('/depot/:depotId/summaries/month/:month/year/:year', checkAuthentication, asyncHandle(CrabPurchaseController.getDailySummariesByDepotAndMonth));

// // Route mới để lấy hoá đơn theo khoảng thời gian và thương nhân
// router.get('/depot/:depotId/date/:date', checkAuthentication, asyncHandle(CrabPurchaseController.getCrabPurchasesByDepotAndDate));

// Route mới để lấy hoá đơn mua cua theo khoảng thời gian
router.get('/admin/depot/:depotId/today', checkAuthentication, checkIsAdmin, asyncHandle(CrabPurchaseController.getTodayCrabPurchasesForDepot));

module.exports = router;
