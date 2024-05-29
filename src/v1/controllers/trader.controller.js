const TraderService = require('../services/trader.service');
const { CREATED, OK } = require('../core/success.response');

class TraderController {
    static async createTrader(req, res, next) {
        const userId = req.user.id;
        new CREATED({
            message: "Trader created successfully!",
            metadata: await TraderService.createTrader(userId, req.body),
        }).sendData(res);
    }

    static async getAllTradersByUser(req, res, next) {
        new OK({
            message: "Get all traders for user success!",
            metadata: await TraderService.getAllTradersByUser(req.user.id),
        }).sendData(res);
    }

    static async getAllTradersByDepots(req, res, next) {
        new OK({
            message: "Get all traders by depots success!",
            metadata: await TraderService.getAllTradersByDepots(),
        }).sendData(res);
    }

    static async getTraderById(req, res, next) {
        new OK({
            message: "Get trader by id success!",
            metadata: await TraderService.getTraderById(req.params.id),
        }).sendData(res);
    }

    static async updateTrader(req, res, next) {
        new OK({
            message: "Update trader success!",
            metadata: await TraderService.updateTrader(req.params.id, req.body),
        }).sendData(res);
    }

    static async deleteTrader(req, res, next) {
        new OK({
            message: "Delete trader success!",
            metadata: await TraderService.deleteTrader(req.params.id),
        }).sendData(res);
    }
}

module.exports = TraderController;
