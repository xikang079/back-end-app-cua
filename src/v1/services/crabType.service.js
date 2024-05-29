const CrabType = require('../models/crabType.model');
const AuthError = require('../core/error.response').AuthError;

class CrabTypeService {
    static async createCrabType(userId, data) {
        // Kiểm tra xem tên loại cua đã tồn tại cho vựa cụ thể hay chưa
        const existingCrabType = await CrabType.findOne({
            name: data.name,
            user: userId,
        });

        if (existingCrabType) {
            throw new AuthError("Crab type name already exists for this depot!");
        }

        const crabType = await CrabType.create({
            name: data.name,
            pricePerKg: data.pricePerKg,
            user: userId,
        });

        if (!crabType) throw new AuthError("Create crab type failed!");

        return { crabType };
    }

    static async getAllCrabTypesByUser(user) {
        return await CrabType.find({ user }).lean();
    }

    static async getAllCrabTypesByDepots() {
        const crabTypes = await CrabType.find().lean();
        const groupedCrabTypes = crabTypes.reduce((acc, crabType) => {
            const depotId = crabType.user.toString();
            if (!acc[depotId]) {
                acc[depotId] = [];
            }
            acc[depotId].push(crabType);
            return acc;
        }, {});
        return groupedCrabTypes;
    }

    static async getCrabTypeById(id) {
        const crabType = await CrabType.findById(id).lean();
        if (!crabType) throw new AuthError("Crab type not found!");
        return crabType;
    }

    static async updateCrabType(id, data) {
        const findCrab = await CrabType.findOne({
            _id: id,
        });
        
        if(!findCrab) throw new AuthError("Crab type can not find!");

        const crabType = await CrabType.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!crabType) throw new AuthError("Update crab type failed!");
        return crabType;
    }

    static async deleteCrabType(id) {
        const crabType = await CrabType.findByIdAndDelete(id).lean();
        if (!crabType) throw new AuthError("Delete crab type failed!");
        return crabType;
    }
}

module.exports = CrabTypeService;
