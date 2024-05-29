const CrabTypeService = require('../services/crabType.service');
const { CREATED, OK } = require('../core/success.response');

class CrabTypeController {
    static async createCrabType(req, res, next) {
        const userId = req.user.id;
        new CREATED({
            message: "Crab type created successfully!",
            metadata: await CrabTypeService.createCrabType(userId, req.body),
        }).sendData(res);
    }

    static async getAllCrabTypesByUser(req, res, next) {
        new OK({
            message: "Get all crab types for user success!",
            metadata: await CrabTypeService.getAllCrabTypesByUser(req.user.id),
        }).sendData(res);
    }

    static async getAllCrabTypesByDepots(req, res, next) {
        new OK({
            message: "Get all crab types by depots success!",
            metadata: await CrabTypeService.getAllCrabTypesByDepots(),
        }).sendData(res);
    }

    static async getCrabTypeById(req, res, next) {
        new OK({
            message: "Get crab type by id success!",
            metadata: await CrabTypeService.getCrabTypeById(req.params.id),
        }).sendData(res);
    }

    static async updateCrabType(req, res, next) {
        new OK({
            message: "Update crab type success!",
            metadata: await CrabTypeService.updateCrabType(req.params.id, req.body),
        }).sendData(res);
    }

    static async deleteCrabType(req, res, next) {
        new OK({
            message: "Delete crab type success!",
            metadata: await CrabTypeService.deleteCrabType(req.params.id),
        }).sendData(res);
    }
}

module.exports = CrabTypeController;
