const Trader = require('../models/trader.model');
const AuthError = require('../core/error.response').AuthError;

class TraderService {
    static async createTrader(userId, data) {
        // Kiểm tra xem tên thương lái đã tồn tại cho vựa cụ thể hay chưa
        const existingTrader = await Trader.findOne({
            name: data.name,
            user: userId,
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
        return await Trader.find({ user }).lean();
    }

    static async getAllTradersByDepots() {
        const traders = await Trader.find().lean();
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
        if (!trader) throw new AuthError("Trader not found!");
        return trader;
    }

    static async updateTrader(id, data) {
        const trader = await Trader.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!trader) throw new AuthError("Update trader failed!");
        return trader;
    }

    static async deleteTrader(id) {
        const trader = await Trader.findByIdAndDelete(id).lean();
        if (!trader) throw new AuthError("Delete trader failed!");
        return trader;
    }
}

module.exports = TraderService;
