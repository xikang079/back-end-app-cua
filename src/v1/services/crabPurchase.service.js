const CrabPurchase = require('../models/crabPurchase.model');
const CrabType = require('../models/crabType.model');
const Trader = require('../models/trader.model');
const DailySummary = require('../models/dailySummary.model');
const { AuthError } = require('../core/error.response');

class CrabPurchaseService {
    static async createCrabPurchase(userId, data) {
        const trader = await Trader.findById(data.trader);
        if (!trader) throw new AuthError("Không tìm thấy thương nhân!");

        const crabs = await Promise.all(data.crabs.map(async crab => {
            const crabType = await CrabType.findById(crab.crabType);
            if (!crabType) throw new AuthError("Không tìm thấy loại cua!");

            // Kiểm tra xem crabType có thuộc vựa của người dùng hiện tại không
            if (crabType.user.toString() !== userId) {
                throw new AuthError("Không có quyền truy cập vào loại cua này");
            }

            return {
                crabType: crabType._id,
                weight: crab.weight,
                pricePerKg: crabType.pricePerKg,
                totalCost: crab.weight * crabType.pricePerKg
            };
        }));

        const totalCost = crabs.reduce((acc, crab) => acc + crab.totalCost, 0);

        const crabPurchase = await CrabPurchase.create({
            trader: data.trader,
            crabs,
            totalCost,
            user: userId
        });

        if (!crabPurchase) throw new AuthError("Tạo hoá đơn mua cua thất bại!");

        return { crabPurchase };
    }

    // Các phương thức khác vẫn giữ nguyên

    static async getAllCrabPurchases(userId, page = 1, limit = 10) {
        const crabPurchases = await CrabPurchase.find({ user: userId })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('trader crabs.crabType')
            .lean();
        return {
            pagination: {
                page,
                limit,
                total: crabPurchases.length
            },
            crabPurchases
        };
    }

    static async getCrabPurchaseById(id, userId) {
        const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId }).populate('trader crabs.crabType').lean();
        if (!crabPurchase) throw new AuthError("Không tìm thấy hoá đơn mua cua!");
        return crabPurchase;
    }

    static async updateCrabPurchase(id, data, userId) {
        const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId });
        if (!crabPurchase) throw new AuthError("Không tìm thấy hoá đơn mua cua!");

        const trader = await Trader.findById(data.trader);
        if (!trader) throw new AuthError("Không tìm thấy thương nhân!");

        const crabs = await Promise.all(data.crabs.map(async crab => {
            const crabType = await CrabType.findById(crab.crabType);
            if (!crabType) throw new AuthError("Không tìm thấy loại cua!");

            // Kiểm tra xem crabType có thuộc vựa của người dùng hiện tại không
            if (crabType.user.toString() !== userId) {
                throw new AuthError("Không có quyền truy cập vào loại cua này");
            }

            return {
                crabType: crabType._id,
                weight: crab.weight,
                pricePerKg: crabType.pricePerKg,
                totalCost: crab.weight * crabType.pricePerKg
            };
        }));

        const totalCost = crabs.reduce((acc, crab) => acc + crab.totalCost, 0);

        crabPurchase.trader = data.trader;
        crabPurchase.crabs = crabs;
        crabPurchase.totalCost = totalCost;

        await crabPurchase.save();

        return crabPurchase;
    }

    static async deleteCrabPurchase(id, userId) {
        const crabPurchase = await CrabPurchase.findOneAndDelete({ _id: id, user: userId }).lean();
        if (!crabPurchase) throw new AuthError("Xoá hoá đơn mua cua thất bại!");
        return crabPurchase;
    }

    static async getCrabPurchasesByDepotAndDate(depotId, date, page = 1, limit = 10, user) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }
        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: new Date(date).setHours(6, 0, 0, 0),
                $lt: new Date(date).setHours(29, 59, 59, 999), // 5:59:59 AM của ngày hôm sau
            },
        })
            .populate('trader crabs.crabType')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return crabPurchases;
    }

    static async getCrabPurchasesByDepotAndTrader(depotId, traderId, page = 1, limit = 10, user) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }
        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            trader: traderId
        })
            .populate('trader crabs.crabType')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return crabPurchases;
    }

    static async getCrabPurchasesByDepotAndMonth(depotId, month, year, page = 1, limit = 10, user) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }
        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1),
            },
        })
            .populate('trader crabs.crabType')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return crabPurchases;
    }

    static async getCrabPurchasesByDepotAndYear(depotId, year, page = 1, limit = 10, user) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }
        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1),
            },
        })
            .populate('trader crabs.crabType')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return crabPurchases;
    }

    static async getAllCrabPurchasesByDepot(page = 1, limit = 10) {
        const crabPurchases = await CrabPurchase.aggregate([
            {
                $group: {
                    _id: "$user",
                    purchases: { $push: "$$ROOT" }
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            }
        ]);
        return crabPurchases;
    }

    static async createDailySummaryByDepotToday(depotId, user, startHour = 6, endHour = 6) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(startHour, 0, 0, 0);

        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(endHour, 0, 0, 0);

        console.log('Bắt đầu ngày:', todayStart);
        console.log('Bắt đầu ngày tiếp theo:', tomorrowStart);

        const existingSummary = await DailySummary.findOne({
            depot: depotId,
            createdAt: {
                $gte: todayStart,
                $lt: tomorrowStart,
            }
        }).lean();

        if (existingSummary) {
            throw new AuthError("Báo cáo tổng hợp cho ngày hôm nay đã tồn tại. Vui lòng xoá báo cáo hiện tại trước khi tạo mới.");
        }

        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: todayStart,
                $lt: tomorrowStart,
            }
        }).lean();

        console.log('Hoá đơn mua cua:', crabPurchases);

        if (crabPurchases.length === 0) {
            console.log('Không tìm thấy hoá đơn mua cua cho hôm nay.');
            return { details: [], totalAmount: 0 };
        }

        const summaryMap = new Map();

        crabPurchases.forEach(purchase => {
            purchase.crabs.forEach(crab => {
                const crabTypeId = crab.crabType.toString();
                if (!summaryMap.has(crabTypeId)) {
                    summaryMap.set(crabTypeId, {
                        crabType: crab.crabType,
                        totalWeight: 0,
                        totalCost: 0
                    });
                }
                const summary = summaryMap.get(crabTypeId);
                summary.totalWeight += crab.weight;
                summary.totalCost += crab.totalCost;
            });
        });

        const summaryDetails = Array.from(summaryMap.values());
        const totalAmount = summaryDetails.reduce((acc, detail) => acc + detail.totalCost, 0);

        console.log('Chi tiết tổng hợp:', summaryDetails);
        console.log('Tổng số tiền:', totalAmount);

        const dailySummary = await DailySummary.create({
            depot: depotId,
            details: summaryDetails,
            totalAmount,
        });

        console.log('Tạo báo cáo tổng hợp hàng ngày:', dailySummary);

        return dailySummary;
    }

    static async getDailySummaryByDepotToday(depotId, user) {
        if (user.id !== depotId && user.role !== 'admin') {
            throw new AuthError("Không có quyền truy cập!");
        }
        const todayStart = new Date();
        todayStart.setHours(6, 0, 0, 0);

        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        todayEnd.setHours(5, 59, 59, 999);

        const dailySummary = await DailySummary.findOne({
            depot: depotId,
            createdAt: {
                $gte: todayStart,
                $lt: todayEnd,
            }
        }).lean();

        console.log('Báo cáo tổng hợp cho hôm nay:', dailySummary);

        if (!dailySummary) {
            console.log('Không tìm thấy báo cáo tổng hợp cho hôm nay.');
            return { details: [], totalAmount: 0 };
        }

        return dailySummary;
    }

    static async getAllDailySummariesByDepot(depotId, page = 1, limit = 10) {
        const dailySummaries = await DailySummary.find({ depot: depotId })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return dailySummaries;
    }

    static async getAllDailySummariesForAdmin(page = 1, limit = 10) {
        const dailySummaries = await DailySummary.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return dailySummaries;
    }

    static async getDailySummariesByDateForAdmin(date, page = 1, limit = 10) {
        const dailySummaries = await DailySummary.find({
            createdAt: {
                $gte: new Date(date).setHours(0, 0, 0, 0),
                $lt: new Date(date).setHours(23, 59, 59, 999)
            }
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return dailySummaries;
    }
}

module.exports = CrabPurchaseService;
