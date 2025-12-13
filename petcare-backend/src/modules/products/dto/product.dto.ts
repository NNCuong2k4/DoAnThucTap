import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Royal Canin Adult 15kg', description: 'Tên sản phẩm' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Thức ăn hạt cao cấp cho chó trưởng thành', description: 'Mô tả sản phẩm' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1200000, description: 'Giá sản phẩm (VND)' })
  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber()
  @Min(0, { message: 'Giá phải lớn hơn 0' })
  price: number;

  @ApiProperty({ example: 50, description: 'Số lượng tồn kho' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '674471234567890abcdef123', description: 'ID danh mục' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @IsMongoId({ message: 'ID danh mục không hợp lệ' })
  categoryId: string;

  @ApiProperty({ 
    example: ['https://example.com/products/royal-canin-1.jpg', 'https://example.com/products/royal-canin-2.jpg'],
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: ['thức ăn chó', 'royal canin', 'dinh dưỡng'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ example: 'Royal Canin', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 15, description: 'Trọng lượng (kg)', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 100000, description: 'Giảm giá (VND)', required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: ['Vàng', 'Nâu'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  colors?: string[];

  @ApiProperty({ example: ['S', 'M', 'L'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  sizes?: string[];

  @ApiProperty({ example: 'Thức ăn cao cấp cho chó trưởng thành', required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ example: ['royal canin', 'thức ăn chó', 'dog food'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  metaKeywords?: string[];
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Royal Canin Adult 15kg', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Thức ăn hạt cao cấp cho chó trưởng thành', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1200000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: '674471234567890abcdef123', required: false })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  colors?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  sizes?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  metaKeywords?: string[];
}

export class FilterProductDto {
  @ApiProperty({ example: 1, description: 'Số trang', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 12, description: 'Số sản phẩm mỗi trang', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @ApiProperty({ example: '674471234567890abcdef123', description: 'Lọc theo danh mục', required: false })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiProperty({ example: 'royal canin', description: 'Tìm kiếm theo từ khóa', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 100000, description: 'Giá tối thiểu', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ example: 2000000, description: 'Giá tối đa', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ example: 4, description: 'Rating tối thiểu (0-5)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @ApiProperty({ 
    example: 'price', 
    description: 'Sắp xếp theo (price, rating, soldCount, createdAt)',
    required: false 
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ example: 'asc', description: 'Thứ tự sắp xếp (asc, desc)', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';

  @ApiProperty({ example: true, description: 'Chỉ hiển thị sản phẩm nổi bật', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 'Royal Canin', description: 'Lọc theo thương hiệu', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'thức ăn chó', description: 'Lọc theo tag', required: false })
  @IsOptional()
  @IsString()
  tag?: string;
}