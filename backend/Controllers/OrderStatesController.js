import Order from "../Models/Order.js";
import { Op, fn, col, literal } from "sequelize";

/**
 * Basic Order Statistics (manual calculation)
 */
export const getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereCondition = {};

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: new Date(endDate) };
    }

    const orders = await Order.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "total",
        "recip",
        "remained",
        "isDelivered",
        "createdAt",
      ],
    });

    const statistics = {
      totalOrdersCount: orders.length,
      totalIncome: 0, // total of all orders
      totalReceivedMoney: 0, // sum of recip
      totalPendingMoney: 0, // sum of remained
      deliveredOrdersCount: 0,
      notDeliveredOrdersCount: 0,
      timeRange: {
        startDate: startDate || null,
        endDate: endDate || null,
        hasTimeRange: !!(startDate || endDate),
      },
    };

    orders.forEach((order) => {
      const total = parseFloat(order.total) || 0;
      const recip = parseFloat(order.recip) || 0;
      const remained = parseFloat(order.remained) || 0;

      statistics.totalIncome += total;
      statistics.totalReceivedMoney += recip;
      statistics.totalPendingMoney += remained;

      if (order.isDelivered) statistics.deliveredOrdersCount++;
      else statistics.notDeliveredOrdersCount++;
    });

    res.status(200).json({ success: true, data: statistics });
  } catch (error) {
    console.error("Error in getOrderStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

export const getOrderStatisticsSequelize = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereCondition = {};

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: new Date(endDate) };
    }

    const stats = await Order.findAll({
      where: whereCondition,
      attributes: [
        [fn("COUNT", col("id")), "totalOrdersCount"],
        [fn("SUM", col("total")), "totalIncome"],
        [fn("SUM", col("recip")), "totalReceivedMoney"],
        [fn("SUM", col("remained")), "totalPendingMoney"],
        [
          literal(`SUM(CASE WHEN isDelivered = true THEN 1 ELSE 0 END)`),
          "deliveredOrdersCount",
        ],
        [
          literal(`SUM(CASE WHEN isDelivered = false THEN 1 ELSE 0 END)`),
          "notDeliveredOrdersCount",
        ],
      ],
      raw: true,
    });

    const result = stats[0] || {};

    res.status(200).json({
      success: true,
      data: {
        totalOrdersCount: parseInt(result.totalOrdersCount) || 0,
        totalIncome: parseFloat(result.totalIncome) || 0,
        totalReceivedMoney: parseFloat(result.totalReceivedMoney) || 0,
        totalPendingMoney: parseFloat(result.totalPendingMoney) || 0,
        deliveredOrdersCount: parseInt(result.deliveredOrdersCount) || 0,
        notDeliveredOrdersCount: parseInt(result.notDeliveredOrdersCount) || 0,
        timeRange: {
          startDate: startDate || null,
          endDate: endDate || null,
          hasTimeRange: !!(startDate || endDate),
        },
      },
    });
  } catch (error) {
    console.error("Error in getOrderStatisticsSequelize:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

export const getDetailedOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereCondition = {};

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Overall stats
    const overallStats = await Order.findAll({
      where: whereCondition,
      attributes: [
        [fn("SUM", col("total")), "totalIncome"],
        [fn("SUM", col("recip")), "totalReceivedMoney"],
        [fn("SUM", col("remained")), "totalPendingMoney"],
        [fn("COUNT", col("id")), "totalOrdersCount"],
        [fn("AVG", col("total")), "averageOrderValue"],
        [
          literal(`SUM(CASE WHEN isDelivered = true THEN 1 ELSE 0 END)`),
          "deliveredOrdersCount",
        ],
        [
          literal(`SUM(CASE WHEN isDelivered = false THEN 1 ELSE 0 END)`),
          "notDeliveredOrdersCount",
        ],
      ],
      raw: true,
    });

    // By delivery status
    const byDeliveryStatus = await Order.findAll({
      where: whereCondition,
      attributes: [
        "isDelivered",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("total")), "totalMoney"],
        [fn("SUM", col("recip")), "receivedMoney"],
        [fn("SUM", col("remained")), "pendingMoney"],
        [fn("AVG", col("total")), "averageValue"],
      ],
      group: ["isDelivered"],
      raw: true,
    });

    // Monthly breakdown
    let monthlyBreakdown = [];
    if (startDate && endDate) {
      monthlyBreakdown = await Order.findAll({
        where: whereCondition,
        attributes: [
          [fn("YEAR", col("createdAt")), "year"],
          [fn("MONTH", col("createdAt")), "month"],
          [fn("SUM", col("total")), "totalMoney"],
          [fn("SUM", col("recip")), "receivedMoney"],
          [fn("SUM", col("remained")), "pendingMoney"],
          [
            literal(`SUM(CASE WHEN isDelivered = true THEN 1 ELSE 0 END)`),
            "deliveredCount",
          ],
          [
            literal(`SUM(CASE WHEN isDelivered = false THEN 1 ELSE 0 END)`),
            "pendingCount",
          ],
        ],
        group: ["year", "month"],
        order: [
          [fn("YEAR", col("createdAt")), "ASC"],
          [fn("MONTH", col("createdAt")), "ASC"],
        ],
        raw: true,
      });
    }

    const result = overallStats[0] || {};

    res.status(200).json({
      success: true,
      data: {
        totalIncome: parseFloat(result.totalIncome) || 0,
        totalReceivedMoney: parseFloat(result.totalReceivedMoney) || 0,
        totalPendingMoney: parseFloat(result.totalPendingMoney) || 0,
        totalOrdersCount: parseInt(result.totalOrdersCount) || 0,
        averageOrderValue: parseFloat(result.averageOrderValue) || 0,
        deliveredOrdersCount: parseInt(result.deliveredOrdersCount) || 0,
        notDeliveredOrdersCount: parseInt(result.notDeliveredOrdersCount) || 0,
        byDeliveryStatus,
        monthlyBreakdown,
        timeRange: {
          startDate: startDate || null,
          endDate: endDate || null,
          hasTimeRange: !!(startDate || endDate),
        },
      },
    });
  } catch (error) {
    console.error("Error in getDetailedOrderStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching detailed order statistics",
      error: error.message,
    });
  }
};
