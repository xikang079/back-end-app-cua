const CrabPurchase = require('../models/crabPurchase.model');
const CrabType = require('../models/crabType.model');
const Trader = require('../models/trader.model');
const DailySummary = require('../models/dailySummary.model');
const { AuthError } = require('../core/error.response');

class CrabPurchaseService {
    static async createCrabPurchase(userId, data) {
        const trader = await Trader.findById(data.trader);
        if (!trader) throw new AuthError("Trader not found!");

        const crabs = await Promise.all(data.crabs.map(async crab => {
            const crabType = await CrabType.findById(crab.crabType);
            if (!crabType) throw new AuthError("Crab type not found!");
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

        if (!crabPurchase) throw new AuthError("Create crab purchase failed!");

        return { crabPurchase };
    }

    static async getAllCrabPurchases(userId) {
        return await CrabPurchase.find({ user: userId }).populate('trader crabs.crabType').lean();
    }

    static async getCrabPurchaseById(id, userId) {
        const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId }).populate('trader crabs.crabType').lean();
        if (!crabPurchase) throw new AuthError("Crab purchase not found!");
        return crabPurchase;
    }

    static async updateCrabPurchase(id, data, userId) {
        const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId });
        if (!crabPurchase) throw new AuthError("Crab purchase not found!");

        const trader = await Trader.findById(data.trader);
        if (!trader) throw new AuthError("Trader not found!");

        const crabs = await Promise.all(data.crabs.map(async crab => {
            const crabType = await CrabType.findById(crab.crabType);
            if (!crabType) throw new AuthError("Crab type not found!");
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
        if (!crabPurchase) throw new AuthError("Delete crab purchase failed!");
        return crabPurchase;
    }

    static async getCrabPurchasesByDepotAndDate(depotId, date, page = 1, limit = 10) {
        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: new Date(date).setHours(0, 0, 0, 0),
                $lt: new Date(date).setHours(23, 59, 59, 999),
            },
        })
            .populate('trader crabs.crabType')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return crabPurchases;
    }

    static async getCrabPurchasesByDepotAndTrader(depotId, traderId, page = 1, limit = 10) {
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

    static async getCrabPurchasesByDepotAndMonth(depotId, month, year, page = 1, limit = 10) {
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

    static async getCrabPurchasesByDepotAndYear(depotId, year, page = 1, limit = 10) {
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

    static async createDailySummaryByDepotToday(depotId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        console.log('Today Start:', todayStart);
        console.log('Today End:', todayEnd);

        const crabPurchases = await CrabPurchase.find({
            user: depotId,
            createdAt: {
                $gte: todayStart,
                $lt: todayEnd,
            }
        }).lean();

        console.log('Crab Purchases:', crabPurchases);

        if (crabPurchases.length === 0) {
            console.log('No crab purchases found for today.');
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

        console.log('Summary Details:', summaryDetails);
        console.log('Total Amount:', totalAmount);

        const dailySummary = await DailySummary.create({
            depot: depotId,
            details: summaryDetails,
            totalAmount,
        });

        console.log('Daily Summary Created:', dailySummary);

        return dailySummary;
    }

    static async getDailySummaryByDepotToday(depotId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const dailySummary = await DailySummary.findOne({
            depot: depotId,
            createdAt: {
                $gte: todayStart,
                $lt: todayEnd,
            }
        }).lean();

        console.log('Daily Summary for today:', dailySummary);

        if (!dailySummary) {
            console.log('No daily summary found for today.');
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
