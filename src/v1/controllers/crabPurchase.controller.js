const CrabPurchaseService = require('../services/crabPurchase.service');
const { CREATED, OK } = require('../core/success.response');

class CrabPurchaseController {
    static async createCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new CREATED({
            message: "Tạo hoá đơn mua cua thành công!",
            metadata: await CrabPurchaseService.createCrabPurchase(userId, req.body),
        }).sendData(res);
    }

    static async getAllCrabPurchases(req, res, next) {
        const userId = req.user.id;
        const { page = 1, limit = 100 } = req.query;

        const crabPurchases = await CrabPurchaseService.getAllCrabPurchases(userId, page, limit);
        new OK({
            message: "Lấy tất cả hoá đơn mua cua thành công!",
            metadata: crabPurchases,
        }).sendData(res);
    }

    static async getCrabPurchaseById(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Lấy hoá đơn mua cua theo ID thành công!",
            metadata: await CrabPurchaseService.getCrabPurchaseById(req.params.id, userId),
        }).sendData(res);
    }

    static async updateCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Cập nhật hoá đơn mua cua thành công!",
            metadata: await CrabPurchaseService.updateCrabPurchase(req.params.id, req.body, userId),
        }).sendData(res);
    }

    static async deleteCrabPurchase(req, res, next) {
        const userId = req.user.id;
        new OK({
            message: "Xoá hoá đơn mua cua thành công!",
            metadata: await CrabPurchaseService.deleteCrabPurchase(req.params.id, userId),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndDate(req, res, next) {
        const { depotId, date } = req.params;
        const { page = 1, limit = 100 } = req.query;
    
        new OK({
          message: "Lấy hoá đơn mua cua theo ngày thành công!",
          metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndDate(depotId, date, page, limit, req.user),
        }).sendData(res);
      }  

    static async getCrabPurchasesByDateRange(req, res, next) {
        try {
            const { depotId } = req.params;
            const { startDate, endDate } = req.query;
            console.log(`Fetching crab purchases from ${startDate} to ${endDate}`); // Debug
            const purchases = await CrabPurchaseService.getCrabPurchasesByDateRange(depotId, startDate, endDate);
            console.log(`Found ${purchases.length} purchases`); // Debug
            new OK({
                message: "Lấy hoá đơn mua cua theo khoảng thời gian thành công!",
                metadata: purchases,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }
    
    

    static async getCrabPurchasesByDepotAndTrader(req, res, next) {
        const { depotId, traderId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy hoá đơn mua cua theo thương nhân thành công!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndTrader(depotId, traderId, page, limit, req.user),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndMonth(req, res, next) {
        const { depotId, month, year } = req.params;
        const { page = 1, limit = 40 } = req.query;
        new OK({
            message: "Lấy hoá đơn mua cua theo tháng thành công!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndMonth(depotId, month, year, page, limit, req.user),
        }).sendData(res);
    }

    static async getCrabPurchasesByDepotAndYear(req, res, next) {
        const { depotId, year } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy hoá đơn mua cua theo năm thành công!",
            metadata: await CrabPurchaseService.getCrabPurchasesByDepotAndYear(depotId, year, page, limit, req.user),
        }).sendData(res);
    }

    static async getAllCrabPurchasesByDepot(req, res, next) {
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy tất cả hoá đơn mua cua theo vựa thành công!",
            metadata: await CrabPurchaseService.getAllCrabPurchasesByDepot(page, limit),
        }).sendData(res);
    }

    static async createDailySummaryByDepotToday(req, res, next) {
        const depotId = req.params.depotId;
        const { startDate, endDate } = req.body;
        new CREATED({
          message: "Tạo báo cáo tổng hợp trong ngày cho vựa thành công!",
          metadata: await CrabPurchaseService.createDailySummaryByDepotToday(depotId, startDate, endDate, req.user),
        }).sendData(res);
      }
      

    static async getDailySummaryByDepotToday(req, res, next) {
        const depotId = req.params.depotId;
        const { startDate, endDate } = req.body;
        new OK({
            message: "Lấy báo cáo tổng hợp trong ngày cho vựa thành công!",
            metadata: await CrabPurchaseService.getDailySummaryByDepotToday(depotId, startDate, endDate, req.user),
        }).sendData(res);
    }

    static async getAllDailySummariesByDepot(req, res, next) {
        const depotId = req.params.depotId;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy tất cả báo cáo tổng hợp theo vựa thành công!",
            metadata: await CrabPurchaseService.getAllDailySummariesByDepot(depotId, page, limit),
        }).sendData(res);
    }

    static async getAllDailySummariesForAdmin(req, res, next) {
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy tất cả báo cáo tổng hợp cho admin thành công!",
            metadata: await CrabPurchaseService.getAllDailySummariesForAdmin(page, limit),
        }).sendData(res);
    }

    static async getDailySummariesByDateForAdmin(req, res, next) {
        const { date } = req.params;
        const { page = 1, limit = 10 } = req.query;
        new OK({
            message: "Lấy báo cáo tổng hợp theo ngày cho admin thành công!",
            metadata: await CrabPurchaseService.getDailySummariesByDateForAdmin(date, page, limit),
        }).sendData(res);
    }

    static async deleteDailySummary(req, res, next) {
        const { depotId, summaryId } = req.params;
        try {
            await CrabPurchaseService.deleteDailySummary(depotId, summaryId);
            new OK({
                message: "Xóa báo cáo tổng hợp thành công!",
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async getDailySummariesByDepotAndMonth(req, res, next) {
        const { depotId, month, year } = req.params;
        const { page = 1, limit = 50 } = req.query;
        new OK({
            message: "Lấy báo cáo tổng hợp theo tháng thành công!",
            metadata: await CrabPurchaseService.getDailySummariesByDepotAndMonth(depotId, month, year, page, limit, req.user),
        }).sendData(res);
    }

    static async getTodayCrabPurchasesForDepot(req, res, next) {
        const { depotId } = req.params;
        const { page = 1, limit = 100 } = req.query;
    
        new OK({
            message: "Lấy tất cả hóa đơn mua cua trong ngày theo vựa thành công!",
            metadata: await CrabPurchaseService.getTodayCrabPurchasesForDepot(depotId, page, limit),
        }).sendData(res);
    }
    
}

module.exports = CrabPurchaseController;
