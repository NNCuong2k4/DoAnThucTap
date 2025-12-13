import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsDate,
  IsIn,
  Min,
  Max,
  IsMongoId,
  MinLength,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../schemas/user.schema';
import { ActivityAction } from '../../../schemas/activity-log.schema';

// DTO 1: Dashboard Query
export class DashboardQueryDto {
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year'], {
    message: 'period phải là today, week, month hoặc year',
  })
  period?: 'today' | 'week' | 'month' | 'year';
}

// DTO 2: Sales Analytics
export class SalesAnalyticsDto {
  @Type(() => Date)
  @IsDate({ message: 'startDate phải là ngày hợp lệ' })
  startDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'endDate phải là ngày hợp lệ' })
  endDate: Date;

  @IsOptional()
  @IsIn(['day', 'week', 'month'], {
    message: 'groupBy phải là day, week hoặc month',
  })
  groupBy?: 'day' | 'week' | 'month';
}

// DTO 3: User Analytics
export class UserAnalyticsDto {
  @IsOptional()
  @IsIn(['week', 'month', 'year'], {
    message: 'period phải là week, month hoặc year',
  })
  period?: 'week' | 'month' | 'year';
}

// DTO 4: Get Users (with filters)
export class GetUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'banned'], { message: 'status phải là active hoặc banned' })
  status?: 'active' | 'banned';

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'search phải có ít nhất 2 ký tự' })
  search?: string;
}

// ✅ NEW DTO 5: Create User
export class CreateUserDto {
  @IsString({ message: 'name phải là chuỗi' })
  @MinLength(2, { message: 'name phải có ít nhất 2 ký tự' })
  name: string;

  @IsEmail({}, { message: 'email không hợp lệ' })
  email: string;

  @IsString({ message: 'phone phải là chuỗi' })
  @Matches(/^[0-9]{10,11}$/, { message: 'phone phải là số điện thoại hợp lệ (10-11 số)' })
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password phải có ít nhất 6 ký tự' })
  password?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dateOfBirth phải là ngày hợp lệ' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role không hợp lệ' })
  role?: UserRole;
}

// ✅ NEW DTO 6: Update User
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'name phải là chuỗi' })
  @MinLength(2, { message: 'name phải có ít nhất 2 ký tự' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'phone phải là chuỗi' })
  @Matches(/^[0-9]{10,11}$/, { message: 'phone phải là số điện thoại hợp lệ (10-11 số)' })
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dateOfBirth phải là ngày hợp lệ' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  address?: string;
}

// DTO 7: Update User Role
export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'role phải là user hoặc admin' })
  role: UserRole;
}

// DTO 8: Update User Status (Ban/Unban)
export class UpdateUserStatusDto {
  @IsIn(['active', 'banned'], { message: 'status phải là active hoặc banned' })
  status: 'active' | 'banned';

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'reason phải có ít nhất 10 ký tự' })
  reason?: string;
}

// DTO 9: Activity Logs Query
export class ActivityLogsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsMongoId({ message: 'userId phải là ObjectId hợp lệ' })
  userId?: string;

  @IsOptional()
  @IsEnum(ActivityAction, { message: 'action không hợp lệ' })
  action?: ActivityAction;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

// DTO 10: Export Report
export class ExportReportDto {
  @IsIn(['orders', 'users', 'products', 'revenue', 'activities'], {
    message: 'type phải là orders, users, products, revenue hoặc activities',
  })
  type: 'orders' | 'users' | 'products' | 'revenue' | 'activities';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsIn(['csv', 'json'], { message: 'format phải là csv hoặc json' })
  format?: 'csv' | 'json';
}

// DTO 11: Category Analytics
export class CategoryAnalyticsDto {
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year'], {
    message: 'period phải là today, week, month hoặc year',
  })
  period?: 'today' | 'week' | 'month' | 'year';
}

// DTO 12: Top Products Query
export class TopProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year'], {
    message: 'period phải là today, week, month hoặc year',
  })
  period?: 'today' | 'week' | 'month' | 'year';
}