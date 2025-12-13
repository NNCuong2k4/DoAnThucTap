import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ==================== ADD MEDICAL RECORD DTO (EXISTING) ====================

export class AddMedicalRecordDto {
  @ApiProperty({ example: '2024-03-10', description: 'Ngày khám bệnh' })
  @IsNotEmpty({ message: 'Ngày khám không được để trống' })
  @IsDateString({}, { message: 'Ngày khám phải là định dạng ISO date' })
  date: string;

  @ApiProperty({ example: 'Khám định kỳ, sức khỏe tốt', description: 'Mô tả chi tiết' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Bác sĩ Nguyễn Văn A', required: false, description: 'Tên bác sĩ' })
  @IsOptional()
  @IsString()
  veterinarian?: string;

  @ApiProperty({ example: 'Phòng khám Pet Care', required: false, description: 'Tên phòng khám' })
  @IsOptional()
  @IsString()
  clinic?: string;

  @ApiProperty({ 
    example: ['Viêm da'], 
    type: [String], 
    required: false,
    description: 'Danh sách chẩn đoán'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosis?: string[];

  @ApiProperty({ 
    example: ['Thuốc kháng sinh'], 
    type: [String], 
    required: false,
    description: 'Danh sách đơn thuốc'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prescription?: string[];

  @ApiProperty({ 
    example: ['https://example.com/doc.pdf'], 
    type: [String], 
    required: false,
    description: 'Danh sách tài liệu đính kèm'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ 
    example: '2024-02-15', 
    required: false,
    description: 'Ngày tái khám'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày tái khám phải là định dạng ISO date' })
  followUpDate?: string;

  @ApiProperty({ 
    example: 500000, 
    required: false,
    description: 'Chi phí điều trị (VND)'
  })
  @IsOptional()
  @IsNumber()
  cost?: number;
}

// ==================== UPDATE MEDICAL RECORD DTO (NEW) ====================

export class UpdateMedicalRecordDto {
  @ApiProperty({ example: '2024-03-10', description: 'Ngày khám bệnh', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày khám phải là định dạng ISO date' })
  date?: string;

  @ApiProperty({ example: 'Khám định kỳ, sức khỏe tốt', description: 'Mô tả chi tiết', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiProperty({ example: 'Bác sĩ Nguyễn Văn A', required: false, description: 'Tên bác sĩ' })
  @IsOptional()
  @IsString()
  veterinarian?: string;

  @ApiProperty({ example: 'Phòng khám Pet Care', required: false, description: 'Tên phòng khám' })
  @IsOptional()
  @IsString()
  clinic?: string;

  @ApiProperty({ 
    example: ['Viêm da', 'Dị ứng'], 
    type: [String], 
    required: false,
    description: 'Danh sách chẩn đoán'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosis?: string[];

  @ApiProperty({ 
    example: ['Thuốc kháng sinh', 'Thuốc giảm đau'], 
    type: [String], 
    required: false,
    description: 'Danh sách đơn thuốc'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prescription?: string[];

  @ApiProperty({ 
    example: ['https://example.com/doc.pdf', 'https://example.com/xray.jpg'], 
    type: [String], 
    required: false,
    description: 'Danh sách tài liệu đính kèm'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ 
    example: '2024-04-15', 
    required: false,
    description: 'Ngày tái khám'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày tái khám phải là định dạng ISO date' })
  followUpDate?: string;

  @ApiProperty({ 
    example: 750000, 
    required: false,
    description: 'Chi phí điều trị (VND)'
  })
  @IsOptional()
  @IsNumber({}, { message: 'Chi phí phải là số' })
  cost?: number;
}