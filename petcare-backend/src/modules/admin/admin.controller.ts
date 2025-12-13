import {
  Controller,
  Get,
  Post,      // ✅ ADDED
  Put,       // ✅ ADDED
  Delete,    // ✅ ADDED
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import {
  DashboardQueryDto,
  SalesAnalyticsDto,
  UserAnalyticsDto,
  GetUsersDto,
  CreateUserDto,      // ✅ ADDED
  UpdateUserDto,      // ✅ ADDED
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ActivityLogsDto,
  ExportReportDto,
  CategoryAnalyticsDto,
  TopProductsDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // F8.1: Dashboard Overview
  @Get('dashboard')
  async getDashboard(@Query() queryDto: DashboardQueryDto) {
    return this.adminService.getDashboard(queryDto);
  }

  // F8.2: Sales Analytics
  @Get('analytics/sales')
  async getSalesAnalytics(@Query() analyticsDto: SalesAnalyticsDto) {
    return this.adminService.getSalesAnalytics(analyticsDto);
  }

  // F8.3: User Analytics
  @Get('analytics/users')
  async getUserAnalytics(@Query() analyticsDto: UserAnalyticsDto) {
    return this.adminService.getUserAnalytics(analyticsDto);
  }

  // ✅ NEW F8.10: Category Distribution Analytics
  @Get('analytics/categories')
  async getCategoryDistribution(@Query() queryDto: CategoryAnalyticsDto) {
    const { period = 'month' } = queryDto;
    return this.adminService.getCategoryDistribution(period);
  }

  // ✅ NEW F8.11: Top Products Analytics
  @Get('analytics/top-products')
  async getTopProducts(@Query() queryDto: TopProductsDto) {
    const { limit = 10, period = 'month' } = queryDto;
    return this.adminService.getTopProducts(limit, period);
  }

  // F8.4: Get All Users
  @Get('users')
  async getAllUsers(@Query() filtersDto: GetUsersDto) {
    return this.adminService.getAllUsers(filtersDto);
  }

  // ✅ NEW F8.12: Create User (POST /admin/users)
  @Post('users')
  async createUser(@Body() createDto: CreateUserDto) {
    return this.adminService.createUser(createDto);
  }

  // ✅ NEW F8.13: Update User (PUT /admin/users/:id)
  @Put('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, updateDto);
  }

  // ✅ NEW F8.14: Delete User (DELETE /admin/users/:id)
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // F8.5: Update User Role
  @Patch('users/:id/role')
  async updateUserRole(
    @Req() req,
    @Param('id') userId: string,
    @Body() updateDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(req.user.userId, userId, updateDto);
  }

  // F8.6: Update User Status (Ban/Unban)
  @Patch('users/:id/status')
  async updateUserStatus(
    @Req() req,
    @Param('id') userId: string,
    @Body() updateDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(
      req.user.userId,
      userId,
      updateDto,
    );
  }

  // F8.7: Get Activity Logs
  @Get('activity-logs')
  async getActivityLogs(@Query() logsDto: ActivityLogsDto) {
    return this.adminService.getActivityLogs(logsDto);
  }

  // F8.8: System Health Check
  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // F8.9: Export Reports
  @Get('reports/export')
  async exportReport(@Query() exportDto: ExportReportDto) {
    return this.adminService.exportReport(exportDto);
  }
}