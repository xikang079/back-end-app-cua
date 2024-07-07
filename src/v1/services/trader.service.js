const Trader = require('../models/trader.model');
const AuthError = require('../core/error.response').AuthError;
const CrabPurchase = require('../models/crabPurchase.model'); // Import mô hình CrabPurchase để kiểm tra hóa đơn

class TraderService {
    static async createTrader(userId, data) {
        // Kiểm tra xem tên thương lái đã tồn tại cho vựa cụ thể hay chưa
        const existingTrader = await Trader.findOne({
            name: data.name,
            user: userId,
            isDeleted: false // Chỉ tìm các thương lái chưa bị xóa
        });

        if (existingTrader) {
            throw new AuthError("Trader name already exists for this depot!");
        }

        const trader = await Trader.create({
            name: data.name,
            phone: data.phone,
            user: userId,
        });

        if (!trader) throw new AuthError("Create trader failed!");

        return { trader };
    }

    static async getAllTradersByUser(user) {
        return await Trader.find({ user, isDeleted: false }).lean(); // Chỉ trả về các thương lái chưa bị xóa
    }

    static async getAllTradersByDepots() {
        const traders = await Trader.find({ isDeleted: false }).lean(); // Chỉ trả về các thương lái chưa bị xóa
        const groupedTraders = traders.reduce((acc, trader) => {
            const depotId = trader.user.toString();
            if (!acc[depotId]) {
                acc[depotId] = [];
            }
            acc[depotId].push(trader);
            return acc;
        }, {});
        return groupedTraders;
    }

    static async getTraderById(id) {
        const trader = await Trader.findById(id).lean();
        if (!trader || trader.isDeleted) throw new AuthError("Trader not found!");
        return trader;
    }

    static async updateTrader(id, data) {
        const trader = await Trader.findOneAndUpdate(
            { _id: id, isDeleted: false },
            data,
            { new: true }
        ).lean();
        if (!trader) throw new AuthError("Update trader failed!");
        return trader;
    }

    static async deleteTrader(id, user) {
        const trader = await Trader.findById(id);
        if (!trader || trader.isDeleted) throw new AuthError("Trader not found!");

        // Kiểm tra quyền sở hữu hoặc quyền admin
        if (trader.user.toString() !== user.id && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }

        // Kiểm tra xem Trader có xuất hiện trong hóa đơn nào không
        const existingPurchase = await CrabPurchase.findOne({
            'trader': id,
        });

        if (existingPurchase) {
            throw new AuthError("Cannot delete trader as it exists in one or more invoices!");
        }

        trader.isDeleted = true;
        await trader.save();

        return { message: "Trader deleted successfully" };
    }
}

module.exports = TraderService;
