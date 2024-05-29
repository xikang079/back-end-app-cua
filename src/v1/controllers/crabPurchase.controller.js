const CrabPurchaseService = require('../services/crabPurchase.service');
const { CREATED, OK } = require('../core/success.response');

class CrabPurchaseController {
    static async createCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new CREATED({
            message: "Crab purchase created successfully!",
            metadata: await CrabPurchaseService.createCrabPurchase(userId, req.body),
        }).sendData(res);
    }

    static async getAllCrabPurchases(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Get all crab purchases success!",
            metadata: await CrabPurchaseService.getAllCrabPurchases(userId),
        }).sendData(res);
    }

    static async getCrabPurchaseById(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Get crab purchase by id success!",
            metadata: await CrabPurchaseService.getCrabPurchaseById(req.params.id, userId),
        }).sendData(res);
    }

    static async updateCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Update crab purchase success!",
            metadata: await CrabPurchaseService.updateCrabPurchase(req.params.id, req.body, userId),
        }).sendData(res);
    }

    static async deleteCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Delete crab purchase success!",
            metadata: await CrabPurchaseService.deleteCrabPurchase(req.params.id, userId),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndDate(req, res, next) {
        const { depotId, date } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get crab purchases by depot and date success!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndDate(depotId, date, page, limit),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndTrader(req, res, next) {
        const { depotId, traderId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get crab purchases by depot and trader success!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndTrader(depotId, traderId, page, limit),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndMonth(req, res, next) {
        const { depotId, month, year } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get crab purchases by depot and month success!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndMonth(depotId, month, year, page, limit),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndYear(req, res, next) {
        const { depotId, year } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get crab purchases by depot and year success!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndYear(depotId, year, page, limit),
        }).sendData(res);
    }

    static async getAllCrabPurchasesByDepot(req, res, next) {
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get all crab purchases by depot success!",
            metadata: await CrabPurchaseService.getAllCrabPurchasesByDepot(page, limit),
        }).sendData(res);
    }

    static async createDailySummaryByDepotToday(req, res, next) {
        const depotId = req.params.depotId;
        new CREATED({
            message: "Daily summary created for today by depot success!",
            metadata: await CrabPurchaseService.createDailySummaryByDepotToday(depotId),
        }).sendData(res);
    }

    static async getDailySummaryByDepotToday(req, res, next) {
        const depotId = req.params.depotId;
        new OK({
            message: "Get daily summary for today by depot success!",
            metadata: await CrabPurchaseService.getDailySummaryByDepotToday(depotId),
        }).sendData(res);
    }

    static async getAllDailySummariesByDepot(req, res, next) {
        const depotId = req.params.depotId;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get all daily summaries by depot success!",
            metadata: await CrabPurchaseService.getAllDailySummariesByDepot(depotId, page, limit),
        }).sendData(res);
    }

    static async getAllDailySummariesForAdmin(req, res, next) {
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get all daily summaries for admin success!",
            metadata: await CrabPurchaseService.getAllDailySummariesForAdmin(page, limit),
        }).sendData(res);
    }

    static async getDailySummariesByDateForAdmin(req, res, next) {
        const { date } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Get daily summaries by date for admin success!",
            metadata: await CrabPurchaseService.getDailySummariesByDateForAdmin(date, page, limit),
        }).sendData(res);
    }
}

module.exports = CrabPurchaseController;
