const { log } = require('winston');
const CrabType = require('../models/crabType.model');
const CrabPurchase = require('../models/crabPurchase.model');
const AuthError = require('../core/error.response').AuthError;

class CrabTypeService {
    static async createCrabType(userId, data) {
        try {
            // Kiểm tra xem tên loại cua đã tồn tại cho tài khoản cụ thể hay chưa
            const existingCrabType = await CrabType.findOne({
                name: data.name,
                user: userId,
            });

            // Nếu đã tồn tại và không bị xóa, ném lỗi
            if (existingCrabType && !existingCrabType.isDeleted) {
                throw new AuthError("Crab type name already exists for this depot!");
            }

            // Nếu đã tồn tại nhưng đã bị xóa, cập nhật lại loại cua
            if (existingCrabType && existingCrabType.isDeleted) {
                existingCrabType.isDeleted = false;
                existingCrabType.pricePerKg = data.pricePerKg;
                await existingCrabType.save();
                return { crabType: existingCrabType };
            }

            // Tạo mới loại cua
            const crabType = await CrabType.create({
                name: data.name,
                pricePerKg: data.pricePerKg,
                user: userId,
                isDeleted: false // Ensure isDeleted is set to false by default
            });

            if (!crabType) throw new AuthError("Create crab type failed!");

            return { crabType };
        } catch (error) {
            log.error(`Failed to create crab type: ${error.message}`);
            throw error;
        }
    }

    static async getAllCrabTypesByUser(user) {
        return await CrabType.find({ user, isDeleted: false }).lean();
    }

    static async getAllCrabTypesByDepots() {
        const crabTypes = await CrabType.find({ isDeleted: false }).lean();
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
        if (!crabType || crabType.isDeleted) throw new AuthError("Crab type not found!");
        return crabType;
    }

    static async updateCrabType(id, data) {
        const findCrab = await CrabType.findOne({
            _id: id,
            isDeleted: false
        });
        
        if (!findCrab) throw new AuthError("Crab type can not find!");

        const crabType = await CrabType.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!crabType) throw new AuthError("Update crab type failed!");
        return crabType;
    }

    static async deleteCrabType(id) {
        const crabType = await CrabType.findById(id);
        if (!crabType || crabType.isDeleted) {
            throw new AuthError("Delete crab type failed!");
        }

        // Kiểm tra xem CrabType có xuất hiện trong hóa đơn nào không
        const existingPurchase = await CrabPurchase.findOne({
            'crabs.crabType': id,
        });

        if (existingPurchase) {
            throw new AuthError("Cannot delete crab type as it exists in one or more invoices!");
        }

        crabType.isDeleted = true;
        await crabType.save();
        
        return crabType;
    }
}

module.exports = CrabTypeService;
