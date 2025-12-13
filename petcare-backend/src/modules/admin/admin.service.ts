import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Order } from '../../schemas/order.schema';
import { Product } from '../../schemas/product.schema';
import { Appointment } from '../../schemas/appointment.schema';
import { BlogPost } from '../../schemas/blog-post.schema';
import { ActivityLog } from '../../schemas/activity-log.schema';
import * as bcrypt from 'bcrypt';
import {
  DashboardQueryDto,
  SalesAnalyticsDto,
  UserAnalyticsDto,
  GetUsersDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ActivityLogsDto,
  ExportReportDto,
  CategoryAnalyticsDto,
  TopProductsDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<any>,
    @InjectModel(Product.name) private productModel: Model<any>,
    @InjectModel(Appointment.name) private appointmentModel: Model<any>,
    @InjectModel(BlogPost.name) private blogPostModel: Model<any>,
    @InjectModel(ActivityLog.name) private activityLogModel: Model<any>,
  ) {}

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================

  async getDashboard(queryDto: DashboardQueryDto) {
    const { period = 'week' } = queryDto;
    const dateRange = this.getDateRange(period);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalAppointments,
      totalRevenue,
      previousRevenue,
      previousOrders,
      previousUsers,
      previousAppointments,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.orderModel.countDocuments({
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: { $in: ['confirmed', 'pending'] },
      }),
      this.productModel.countDocuments(),
      this.appointmentModel.countDocuments({
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      }),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
            status: 'confirmed',
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.previousStart, $lt: dateRange.start },
            status: 'confirmed',
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments({
        createdAt: { $gte: dateRange.previousStart, $lt: dateRange.start },
        status: { $in: ['confirmed', 'pending'] },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: dateRange.previousStart, $lt: dateRange.start },
      }),
      this.appointmentModel.countDocuments({
        createdAt: { $gte: dateRange.previousStart, $lt: dateRange.start },
      }),
    ]);

    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;

    const revenueGrowth = this.calculateGrowth(currentRevenue, prevRevenue);
    const ordersGrowth = this.calculateGrowth(totalOrders, previousOrders);
    const usersGrowth = this.calculateGrowth(totalUsers, previousUsers);
    const appointmentsGrowth = this.calculateGrowth(
      totalAppointments,
      previousAppointments,
    );

    return {
      success: true,
      data: {
        overview: {
          totalRevenue: currentRevenue,
          totalOrders,
          activeUsers: totalUsers,
          totalAppointments,
          revenueGrowth,
          ordersGrowth,
          usersGrowth,
          appointmentsGrowth,
        },
      },
    };
  }

  async getSalesAnalytics(analyticsDto: SalesAnalyticsDto) {
    const { startDate, endDate, groupBy = 'day' } = analyticsDto;

    let groupByUnit: any;
    switch (groupBy) {
      case 'day':
        groupByUnit = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case 'week':
        groupByUnit = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case 'month':
        groupByUnit = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      default:
        groupByUnit = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
    }

    const ordersData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: { $in: ['confirmed', 'pending'] },
        },
      },
      {
        $group: {
          _id: groupByUnit,
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const appointmentsData = await this.appointmentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: groupByUnit,
          appointments: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const dataMap = new Map();

    ordersData.forEach((item) => {
      const dateKey = this.formatDateKey(item._id, groupBy);
      dataMap.set(dateKey, {
        date: dateKey,
        orders: item.orders,
        revenue: item.revenue,
        appointments: 0,
      });
    });

    appointmentsData.forEach((item) => {
      const dateKey = this.formatDateKey(item._id, groupBy);
      const existing = dataMap.get(dateKey);
      if (existing) {
        existing.appointments = item.appointments;
      } else {
        dataMap.set(dateKey, {
          date: dateKey,
          orders: 0,
          revenue: 0,
          appointments: item.appointments,
        });
      }
    });

    const chartData = Array.from(dataMap.values()).sort((a, b) => {
      return a.date.localeCompare(b.date);
    });

    return {
      success: true,
      data: {
        chartData,
        totalOrders: ordersData.reduce((sum, item) => sum + item.orders, 0),
        totalRevenue: ordersData.reduce((sum, item) => sum + item.revenue, 0),
        totalAppointments: appointmentsData.reduce(
          (sum, item) => sum + item.appointments,
          0,
        ),
      },
    };
  }

  async getUserAnalytics(analyticsDto: UserAnalyticsDto) {
    const { period = 'month' } = analyticsDto;
    const dateRange = this.getDateRange(period);

    const newUsers = await this.userModel.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    });

    const activeUsers = await this.userModel.countDocuments({
      isActive: true,
      isBanned: false,
    });

    const bannedUsers = await this.userModel.countDocuments({
      isBanned: true,
    });

    return {
      success: true,
      data: {
        newUsers,
        activeUsers,
        bannedUsers,
        totalUsers: await this.userModel.countDocuments(),
      },
    };
  }

  async getCategoryDistribution(period: string = 'month') {
    const dateRange = this.getDateRange(period);

    const products = await this.productModel.find({}, 'categoryId soldCount');

    if (!products || products.length === 0) {
      return {
        success: true,
        categories: [],
      };
    }

    const categoryMap = new Map();
    let totalSold = 0;

    for (const product of products) {
      const categoryId = product.categoryId?.toString();
      if (!categoryId) continue;

      const sold = product.soldCount || 0;
      totalSold += sold;

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId);
        existing.products += 1;
        existing.sold += sold;
      } else {
        const categoryName = await this.getCategoryName(categoryId);
        categoryMap.set(categoryId, {
          name: categoryName,
          products: 1,
          sold: sold,
          percentage: 0,
        });
      }
    }

    const categories = Array.from(categoryMap.values()).map((cat) => ({
      ...cat,
      percentage: totalSold > 0 ? Math.round((cat.sold / totalSold) * 100) : 0,
    }));

    categories.sort((a, b) => b.sold - a.sold);

    return {
      success: true,
      categories,
      totalSold,
    };
  }

  async getTopProducts(limit: number = 10, period: string = 'month') {
    const dateRange = this.getDateRange(period);

    const topProducts = await this.productModel
      .find()
      .sort({ soldCount: -1 })
      .limit(limit)
      .select('name price soldCount stock categoryId images');

    const productsWithCategory = await Promise.all(
      topProducts.map(async (product) => {
        const categoryName = await this.getCategoryName(
          product.categoryId?.toString(),
        );
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          sold: product.soldCount || 0,
          stock: product.stock,
          category: categoryName,
          image: product.images?.[0] || null,
        };
      }),
    );

    return {
      success: true,
      products: productsWithCategory,
    };
  }

  // ==========================================
  // USER MANAGEMENT METHODS - ✅ UPDATED WITH FLAT STRUCTURE
  // ==========================================

  async getAllUsers(filtersDto: GetUsersDto) {
    const { page = 1, limit = 10, role, status, search } = filtersDto;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isBanned = status === 'banned';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // ✅ PARALLEL QUERIES for better performance
    const [users, total, activeCount, bannedCount, newUsersCount] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(query),
      // Stats for StatCards
      this.userModel.countDocuments({ isActive: true, isBanned: false }),
      this.userModel.countDocuments({ isBanned: true }),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const transformedUsers = users.map((user) => {
      const userObj: any = user.toObject();
      userObj.status = userObj.isBanned ? 'banned' : 'active';
      return userObj;
    });

    // ✅ FLAT STRUCTURE - Easy to parse in frontend
    return {
      success: true,
      users: transformedUsers,     // Array at root level
      total,                       // Total count
      page,                        // Current page
      limit,                       // Items per page
      totalPages: Math.ceil(total / limit), // Total pages
      // ✅ BONUS: Stats for StatCards
      active: activeCount,
      banned: bannedCount,
      newUsers: newUsersCount,
    };
  }

  async createUser(createDto: CreateUserDto) {
    const { name, email, phone, password, dateOfBirth, address, role } =
      createDto;

    // Check if email exists
    const existingEmail = await this.userModel.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Check if phone exists
    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã tồn tại');
    }

    // Default password if not provided
    const passwordToHash = password || '123456';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = new this.userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      dateOfBirth,
      address,
      role: role || 'user',
      isActive: true,
      isBanned: false,
    });

    await newUser.save();

    const userObject: any = newUser.toObject();
    delete userObject.password;
    userObject.status = userObject.isBanned ? 'banned' : 'active';

    return {
      success: true,
      message: 'Thêm người dùng thành công',
      data: userObject,
    };
  }

  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const { name, email, phone, dateOfBirth, address } = updateDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingEmail = await this.userModel.findOne({ email });
      if (existingEmail) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    // Check phone uniqueness if changing
    if (phone && phone !== user.phone) {
      const existingPhone = await this.userModel.findOne({ phone });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    await user.save();

    const userObject: any = user.toObject();
    delete userObject.password;
    userObject.status = userObject.isBanned ? 'banned' : 'active';

    return {
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: userObject,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      throw new BadRequestException('Không thể xóa tài khoản admin');
    }

    await this.userModel.findByIdAndDelete(userId);

    return {
      success: true,
      message: 'Xóa người dùng thành công',
    };
  }

  async updateUserRole(
    adminId: string,
    userId: string,
    updateDto: UpdateUserRoleDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.role = updateDto.role;
    await user.save();

    const userObject: any = user.toObject();
    delete userObject.password;
    userObject.status = userObject.isBanned ? 'banned' : 'active';

    return {
      success: true,
      message: 'Cập nhật quyền thành công',
      data: userObject,
    };
  }

  async updateUserStatus(
    adminId: string,
    userId: string,
    updateDto: UpdateUserStatusDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.isBanned = updateDto.status === 'banned';
    if (updateDto.reason) {
      user.banReason = updateDto.reason;
    }

    await user.save();

    const userObject: any = user.toObject();
    delete userObject.password;
    userObject.status = userObject.isBanned ? 'banned' : 'active';

    return {
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: userObject,
    };
  }

  // ==========================================
  // ACTIVITY LOGS & SYSTEM
  // ==========================================

  async getActivityLogs(logsDto: ActivityLogsDto) {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = logsDto;

    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.activityLogModel
        .find(query)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.activityLogModel.countDocuments(query),
    ]);

    return {
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSystemHealth() {
    try {
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalAppointments,
      ] = await Promise.all([
        this.userModel.estimatedDocumentCount(),
        this.orderModel.estimatedDocumentCount(),
        this.productModel.estimatedDocumentCount(),
        this.appointmentModel.estimatedDocumentCount(),
      ]);

      // Check database connection status
      const dbState = this.userModel.db.readyState;
      const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

      return {
        success: true,
        health: {
          status: 'healthy',
          database: dbStatus,
          collections: {
            users: totalUsers,
            orders: totalOrders,
            products: totalProducts,
            appointments: totalAppointments,
          },
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        health: {
          status: 'unhealthy',
          database: 'error',
          error: error.message,
          timestamp: new Date(),
        },
      };
    }
  }

  async exportReport(exportDto: ExportReportDto) {
    const { type, startDate, endDate, format = 'json' } = exportDto;

    let data: any[] = [];

    switch (type) {
      case 'users':
        data = await this.userModel
          .find(
            startDate && endDate
              ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
              : {},
          )
          .select('-password')
          .lean();
        break;

      case 'orders':
        data = await this.orderModel
          .find(
            startDate && endDate
              ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
              : {},
          )
          .populate('userId', 'name email')
          .lean();
        break;

      case 'products':
        data = await this.productModel.find().lean();
        break;

      case 'revenue':
        data = await this.orderModel.aggregate([
          {
            $match: {
              status: 'confirmed',
              ...(startDate && endDate
                ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
                : {}),
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
              },
              totalRevenue: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);
        break;

      case 'activities':
        data = await this.activityLogModel
          .find(
            startDate && endDate
              ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
              : {},
          )
          .populate('userId', 'name email')
          .lean();
        break;

      default:
        throw new BadRequestException('Invalid report type');
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = this.convertToCSV(data);
      return {
        success: true,
        format: 'csv',
        data: csv,
        filename: `${type}_report_${Date.now()}.csv`,
      };
    }

    return {
      success: true,
      format: 'json',
      data,
      total: data.length,
      exportedAt: new Date(),
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getDateRange(period: string) {
    const now = new Date();
    const start = new Date();
    const previousStart = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        previousStart.setDate(start.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        previousStart.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        previousStart.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        previousStart.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
        previousStart.setDate(start.getDate() - 7);
    }

    return {
      start,
      end: now,
      previousStart,
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private formatDateKey(dateObj: any, groupBy: string): string {
    const { year, month, day, week } = dateObj;

    switch (groupBy) {
      case 'day':
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
      case 'week':
        return `W${week}-${year}`;
      case 'month':
        return `${String(month).padStart(2, '0')}/${year}`;
      default:
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    }
  }

  private async getCategoryName(categoryId: string): Promise<string> {
    if (!categoryId) return 'Uncategorized';

    try {
      const Category = this.productModel.db.model('Category');
      const category = await Category.findById(categoryId);
      return category?.name || 'Uncategorized';
    } catch (error) {
      return 'Uncategorized';
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}