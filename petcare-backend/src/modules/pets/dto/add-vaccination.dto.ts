import { IsString, IsNotEmpty, IsDateString, IsOptional, MinLength } from 'class-validator';

export class AddVaccinationDto {
  @IsString({ message: 'Tên vaccine phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên vaccine không được để trống' })
  @MinLength(2, { message: 'Tên vaccine phải có ít nhất 2 ký tự' })
  name: string;

  @IsDateString({}, { message: 'Ngày tiêm phải là định dạng ISO date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày tiêm không được để trống' })
  date: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày tiêm lần tiếp theo phải là định dạng ISO date' })
  nextDue?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateVaccinationDto {
  @IsOptional()
  @IsString({ message: 'Tên vaccine phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Tên vaccine phải có ít nhất 2 ký tự' })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày tiêm phải là định dạng ISO date' })
  date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày tiêm lần tiếp theo phải là định dạng ISO date' })
  nextDue?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}