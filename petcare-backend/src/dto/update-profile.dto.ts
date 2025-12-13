import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  MinLength, 
  MaxLength, 
  Matches 
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên không được vượt quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9]{10,11}$/, { 
    message: 'Số điện thoại phải có 10-11 chữ số' 
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @MinLength(5, { message: 'Địa chỉ phải có ít nhất 5 ký tự' })
  @MaxLength(500, { message: 'Địa chỉ không được vượt quá 500 ký tự' })
  address?: string;

  @IsOptional()
  @IsDateString({}, { 
    message: 'Ngày sinh phải là định dạng ISO date (YYYY-MM-DD hoặc ISO 8601)' 
  })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi ký tự' })
  avatar?: string;
}