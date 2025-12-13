import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ServiceType, AppointmentStatus, TimeSlot } from '../../../schemas/appointment.schema';

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'Pet ID là bắt buộc' })
  @IsMongoId({ message: 'Pet ID không hợp lệ' })
  petId: string;

  @IsNotEmpty({ message: 'Loại dịch vụ là bắt buộc' })
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ' })
  serviceType: ServiceType;

  @IsNotEmpty({ message: 'Ngày hẹn là bắt buộc' })
  @IsDateString({}, { message: 'Ngày hẹn không hợp lệ' })
  appointmentDate: string;

  @IsNotEmpty({ message: 'Khung giờ là bắt buộc' })
  @IsEnum(TimeSlot, { message: 'Khung giờ không hợp lệ' })
  timeSlot: TimeSlot;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty({ message: 'Tên khách hàng là bắt buộc' })
  @IsString()
  customerName: string;

  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  customerPhone: string;
}

export class UpdateAppointmentStatusDto {
  @IsNotEmpty({ message: 'Trạng thái là bắt buộc' })
  @IsEnum(AppointmentStatus, { message: 'Trạng thái không hợp lệ' })
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  veterinarianNotes?: string;
}

export class CancelAppointmentDto {
  @IsNotEmpty({ message: 'Lý do hủy là bắt buộc' })
  @IsString()
  reason: string;
}

export class FilterAppointmentDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  petId?: string;
}

export class GetAvailableSlotsDto {
  @IsNotEmpty({ message: 'Ngày là bắt buộc' })
  @IsDateString({}, { message: 'Ngày không hợp lệ' })
  date: string;

  @IsNotEmpty({ message: 'Loại dịch vụ là bắt buộc' })
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ' })
  serviceType: ServiceType;
}