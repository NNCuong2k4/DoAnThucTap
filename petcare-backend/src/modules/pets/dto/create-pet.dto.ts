import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsDateString,
  Min,
  MinLength,
  MaxLength 
} from 'class-validator';

export class CreatePetDto {
  @IsString({ message: 'Tên thú cưng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên thú cưng không được để trống' })
  @MinLength(2, { message: 'Tên thú cưng phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Tên thú cưng không được vượt quá 50 ký tự' })
  name: string;

  @IsString({ message: 'Loài phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Loài không được để trống' })
  species: string;

  @IsString({ message: 'Giống phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Giống không được để trống' })
  breed: string;

  @IsEnum(['male', 'female'], { message: 'Giới tính phải là male hoặc female' })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh phải là định dạng ISO date' })
  dob?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @Min(0, { message: 'Cân nặng phải lớn hơn 0' })
  weight?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  microchipId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}