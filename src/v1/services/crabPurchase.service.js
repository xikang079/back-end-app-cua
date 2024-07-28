const mongoose = require("mongoose");
const CrabPurchase = require("../models/crabPurchase.model");
const CrabType = require("../models/crabType.model");
const Trader = require("../models/trader.model");
const DailySummary = require("../models/dailySummary.model");
const { AuthError } = require("../core/error.response");
const { log } = require("winston");
const moment = require("moment-timezone");
const axios = require('axios');

class CrabPurchaseService {
  static async createCrabPurchase(userId, data) {
    const trader = await Trader.findOne({ _id: data.trader, isDeleted: false });
    if (!trader) throw new AuthError("Không tìm thấy thương nhân!");

    const crabs = await Promise.all(
      data.crabs.map(async (crab) => {
        const crabType = await CrabType.findOne({
          _id: crab.crabType,
          isDeleted: false,
        });
        if (!crabType) throw new AuthError("Không tìm thấy loại cua!");

        if (crabType.user.toString() !== userId) {
          throw new AuthError("Không có quyền truy cập vào loại cua này");
        }

        return {
          crabType: crabType._id,
          weight: crab.weight,
          pricePerKg: crabType.pricePerKg,
          totalCost: crab.weight * crabType.pricePerKg,
        };
      })
    );

    const totalCost = crabs.reduce((acc, crab) => acc + crab.totalCost, 0);

    const createdAt = moment.tz("Asia/Ho_Chi_Minh").toDate();

    const crabPurchase = await CrabPurchase.create({
      trader: data.trader,
      crabs,
      totalCost,
      user: userId,
      createdAt: createdAt,
    });

    if (!crabPurchase) throw new AuthError("Tạo hoá đơn mua cua thất bại!");

    return { crabPurchase };
  }

  static async getAllCrabPurchases(userId, page = 1, limit = 100) {
    const crabPurchases = await CrabPurchase.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .lean();
    return {
      pagination: {
        page,
        limit,
        total: crabPurchases.length,
      },
      crabPurchases,
    };
  }

  static async getCrabPurchaseById(id, userId) {
    const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .lean();
    if (!crabPurchase) throw new AuthError("Không tìm thấy hoá đơn mua cua!");
    return crabPurchase;
  }

  static async updateCrabPurchase(id, data, userId) {
    const crabPurchase = await CrabPurchase.findOne({ _id: id, user: userId });
    if (!crabPurchase) throw new AuthError("Không tìm thấy hoá đơn mua cua!");

    const trader = await Trader.findOne({ _id: data.trader, isDeleted: false });
    if (!trader) throw new AuthError("Không tìm thấy thương nhân!");

    const crabs = await Promise.all(
      data.crabs.map(async (crab) => {
        const crabType = await CrabType.findOne({
          _id: crab.crabType,
          isDeleted: false,
        });
        if (!crabType) throw new AuthError("Không tìm thấy loại cua!");

        // Kiểm tra xem crabType có thuộc vựa của người dùng hiện tại không
        if (crabType.user.toString() !== userId) {
          throw new AuthError("Không có quyền truy cập vào loại cua này");
        }

        return {
          crabType: crabType._id,
          weight: crab.weight,
          pricePerKg: crabType.pricePerKg,
          totalCost: crab.weight * crabType.pricePerKg,
        };
      })
    );

    const totalCost = crabs.reduce((acc, crab) => acc + crab.totalCost, 0);

    crabPurchase.trader = data.trader;
    crabPurchase.crabs = crabs;
    crabPurchase.totalCost = totalCost;

    await crabPurchase.save();

    return crabPurchase;
  }

  static async deleteCrabPurchase(id, userId) {
    const crabPurchase = await CrabPurchase.findOneAndDelete({
      _id: id,
      user: userId,
    }).lean();
    if (!crabPurchase) throw new AuthError("Xoá hoá đơn mua cua thất bại!");
    return crabPurchase;
  }

  static async getCrabPurchasesByDepotAndDate(
    depotId,
    date,
    page = 1,
    limit = 100,
    user
  ) {
    if (user.id !== depotId && user.role !== "admin") {
      throw new AuthError("Không có quyền truy cập!");
    }

    const startOfDay = moment.tz(date, "Asia/Ho_Chi_Minh").startOf('day').add(6, 'hours');
    const endOfDay = startOfDay.clone().add(1, 'day');

    const crabPurchases = await CrabPurchase.find({
      user: depotId,
      createdAt: {
        $gte: startOfDay.toDate(),
        $lt: endOfDay.toDate(),
      },
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return crabPurchases;
  }

  static async getCrabPurchasesByDepotAndTrader(
    depotId,
    traderId,
    page = 1,
    limit = 10,
    user
  ) {
    if (user.id !== depotId && user.role !== "admin") {
      throw new AuthError("Không có quyền truy cập!");
    }
    const crabPurchases = await CrabPurchase.find({
      user: depotId,
      trader: traderId,
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return crabPurchases;
  }

  static async getCrabPurchasesByDepotAndMonth(
    depotId,
    month,
    year,
    page = 1,
    limit = 40,
    user
  ) {
    // if (user.id !== depotId && user.role !== 'admin') {
    //     throw new AuthError("Không có quyền truy cập!");
    // }
    const crabPurchases = await CrabPurchase.find({
      user: depotId,
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return crabPurchases;
  }

  static async getCrabPurchasesByDepotAndYear(
    depotId,
    year,
    page = 1,
    limit = 10,
    user
  ) {
    if (user.id !== depotId && user.role !== "admin") {
      throw new AuthError("Không có quyền truy cập!");
    }
    const crabPurchases = await CrabPurchase.find({
      user: depotId,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
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
          purchases: { $push: "$$ROOT" },
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
    ]);
    return crabPurchases;
  }

  static async getCrabPurchasesByDateRange(depotId, startDate, endDate) {
    const start = moment.tz(startDate, "UTC").toDate();
    const end = moment.tz(endDate, "UTC").toDate();

    const purchases = await CrabPurchase.find({
      user: depotId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .lean();

    return purchases;
  }

  // Controller method on the server
  static async createDailySummaryByDepotToday(depotId, startDate, endDate, user) {
    if (user.id !== depotId && user.role !== "admin") {
        throw new AuthError("Không có quyền truy cập!");
    }

    const depotObjectId = mongoose.Types.ObjectId.createFromHexString(depotId);

    const existingSummary = await DailySummary.findOne({
        depot: depotObjectId,
        createdAt: {
            $gte: startDate,
            $lt: endDate,
        },
    }).lean();

    if (existingSummary) {
        throw new AuthError(
            "Báo cáo tổng hợp cho ngày hôm nay đã tồn tại. Vui lòng xoá báo cáo hiện tại trước khi tạo mới."
        );
    }

    const crabPurchases = await CrabPurchase.find({
        user: depotObjectId,
        createdAt: {
            $gte: startDate,
            $lt: endDate,
        },
    }).lean();

    if (crabPurchases.length === 0) {
        return { details: [], totalAmount: 0 };
    }

    const summaryMap = new Map();

    crabPurchases.forEach((purchase) => {
        purchase.crabs.forEach((crab) => {
            const crabTypeId = crab.crabType.toString();
            if (!summaryMap.has(crabTypeId)) {
                summaryMap.set(crabTypeId, {
                    crabType: crab.crabType,
                    totalWeight: 0,
                    totalCost: 0,
                });
            }
            const summary = summaryMap.get(crabTypeId);
            summary.totalWeight += crab.weight;
            summary.totalCost += crab.totalCost;
        });
    });

    const summaryDetails = Array.from(summaryMap.values());
    const totalAmount = summaryDetails.reduce(
        (acc, detail) => acc + detail.totalCost,
        0
    );

    const dailySummary = await DailySummary.create({
        depot: depotObjectId,
        details: summaryDetails,
        totalAmount,
    });

    // Gửi báo cáo qua Zalo nếu tổng chi phí không phải 0
    if (totalAmount > 0) {
        await this.sendReportToZalo(dailySummary, user);
    } else {
        throw new AuthError("Chưa có hoá đơn nào được tạo để làm báo cáo.");
    }

    return dailySummary;
}

static async sendReportToZalo(dailySummary, user) {
    const accessToken = 'YOUR_ZALO_ACCESS_TOKEN'; // Thay thế bằng token của bạn
    const recipientId = 'RECIPIENT_ID'; // ID của nhóm hoặc người nhận trên Zalo

    const message = `Báo cáo tổng hợp ngày:
    Tổng số tiền: ${dailySummary.totalAmount}
    Chi tiết: ${dailySummary.details.map(detail => `Loại cua: ${detail.crabType}, Trọng lượng: ${detail.totalWeight}, Tổng chi phí: ${detail.totalCost}`).join('\n')}`;

    try {
        const response = await axios.post('https://openapi.zalo.me/v2.0/oa/message', {
            recipient: {
                user_id: recipientId
            },
            message: {
                text: message
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'access_token': accessToken
            }
        });

        console.log('Gửi báo cáo qua Zalo thành công:', response.data);
    } catch (error) {
        console.error('Lỗi khi gửi báo cáo qua Zalo:', error.response ? error.response.data : error.message);
    }
}

  static async getDailySummaryByDepotToday(depotId, startDate, endDate, user) {
    if (user.id !== depotId && user.role !== "admin") {
      throw new AuthError("Không có quyền truy cập!");
    }

    // Get current time in Ho Chi Minh timezone
    const now = moment().tz("Asia/Ho_Chi_Minh");

    // Determine the start and end of the current day based on the current time
    let todayStart, todayEnd;
    if (now.hour() < 6) {
      // If before 6 AM, consider it as part of the previous day
      todayStart = now.clone().subtract(1, 'day').startOf('day').add(6, 'hours');
      todayEnd = now.clone().startOf('day').add(6, 'hours');
    } else {
      // Otherwise, it's part of the current day
      todayStart = now.clone().startOf('day').add(6, 'hours');
      todayEnd = now.clone().add(1, 'day').startOf('day').add(6, 'hours');
    }

    const dailySummary = await DailySummary.findOne({
      depot: depotId,
      createdAt: {
        $gte: todayStart.toDate(),
        $lt: todayEnd.toDate(),
      },
    }).lean();

    if (!dailySummary) {
      console.log("Không tìm thấy báo cáo tổng hợp cho hôm nay.");
      return { details: [], totalAmount: 0 };
    }

    // console.log('Fetched Daily Summary from Server:', dailySummary); // Debugging print statement

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
        $lt: new Date(date).setHours(23, 59, 59, 999),
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return dailySummaries;
  }

  static async deleteDailySummary(depotId, summaryId) {
    const dailySummary = await DailySummary.findOne({
      _id: summaryId,
      depot: depotId,
    }).lean();
    if (!dailySummary) throw new AuthError("Xóa báo cáo tổng hợp thất bại!");

    const now = moment.tz("Asia/Ho_Chi_Minh");
    const summaryDate = moment.tz(dailySummary.createdAt, "Asia/Ho_Chi_Minh");
    const diffDays = now.diff(summaryDate, "days");

    if (diffDays > 1) {
      throw new AuthError("Không thể xóa báo cáo tổng hợp quá 2 ngày!");
    }

    await DailySummary.findOneAndDelete({ _id: summaryId, depot: depotId });
    return dailySummary;
  }

  static async getDailySummariesByDepotAndMonth(depotId, month, year, page = 1, limit = 50, user) {
    if (user.id !== depotId && user.role !== "admin") {
      throw new AuthError("Không có quyền truy cập!");
    }

    const startDate = moment.tz(`${year}-${String(month).padStart(2, '0')}-01`, "YYYY-MM-DD", "Asia/Ho_Chi_Minh").startOf('month').toDate();
    const endDate = moment.tz(startDate, "Asia/Ho_Chi_Minh").endOf('month').toDate();

    const dailySummaries = await DailySummary.find({
      depot: depotId,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return dailySummaries;
  }

  static async getTodayCrabPurchasesForDepot(depotId, page = 1, limit = 100) {
    const startDate = moment().tz("Asia/Ho_Chi_Minh").startOf('day').add(6, 'hours').toDate();
    const endDate = moment().tz("Asia/Ho_Chi_Minh").endOf('day').add(6, 'hours').toDate();

    const crabPurchases = await CrabPurchase.find({
      user: depotId,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate({
        path: "trader crabs.crabType",
        match: { isDeleted: { $ne: true } },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return crabPurchases;
  }

}

module.exports = CrabPurchaseService;
