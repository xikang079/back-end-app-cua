const TraderService = require('../services/trader.service');
const { CREATED, OK } = require('../core/success.response');

class TraderController {
    static async createTrader(req, res, next) {
        const userId = req.user.id;
        try {
            const result = await TraderService.createTrader(userId, req.body);
            new CREATED({
                message: "Trader created successfully!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async getAllTradersByUser(req, res, next) {
        try {
            const result = await TraderService.getAllTradersByUser(req.user.id);
            new OK({
                message: "Get all traders for user success!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async getAllTradersByDepot(req, res, next) {
        try {
            const result = await TraderService.getAllTradersByDepot(req.params.depotId);
            new OK({
                message: "Get all traders by depot success!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async getTraderById(req, res, next) {
        try {
            const result = await TraderService.getTraderById(req.params.id);
            new OK({
                message: "Get trader by id success!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async updateTrader(req, res, next) {
        try {
            const result = await TraderService.updateTrader(req.params.id, req.body);
            new OK({
                message: "Update trader success!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTrader(req, res, next) {
        try {
            const result = await TraderService.deleteTrader(req.params.id, req.user);
            new OK({
                message: "Delete trader success!",
                metadata: result,
            }).sendData(res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TraderController;
