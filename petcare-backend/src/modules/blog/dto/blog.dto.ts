import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlogCategory, PostStatus } from '../../../schemas/blog-post.schema';

// DTO 1: Create post (Admin)
export class CreatePostDto {
  @IsString({ message: 'title phải là chuỗi' })
  @MinLength(5, { message: 'title phải có ít nhất 5 ký tự' })
  @MaxLength(200, { message: 'title không được quá 200 ký tự' })
  title: string;

  @IsString({ message: 'content phải là chuỗi' })
  @MinLength(50, { message: 'content phải có ít nhất 50 ký tự' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'excerpt không được quá 500 ký tự' })
  excerpt?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'featuredImage phải là URL hợp lệ' })
  featuredImage?: string;

  @IsEnum(BlogCategory, { message: 'category không hợp lệ' })
  category: BlogCategory;

  @IsOptional()
  @IsArray({ message: 'tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi tag phải là chuỗi' })
  tags?: string[];

  @IsOptional()
  @IsEnum(PostStatus, { message: 'status không hợp lệ' })
  status?: PostStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'metaTitle không được quá 100 ký tự' })
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'metaDescription không được quá 200 ký tự' })
  metaDescription?: string;
}

// DTO 2: Update post (Admin)
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  featuredImage?: string;

  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaDescription?: string;
}

// DTO 3: Filter posts (Public/Admin)
export class FilterPostsDto {
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
  limit?: number = 10;

  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['date', 'views'], { message: 'sortBy phải là date hoặc views' })
  sortBy?: 'date' | 'views';

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus; // Admin only
}

// DTO 4: Search posts (Public)
export class SearchPostsDto {
  @IsString({ message: 'query phải là chuỗi' })
  @MinLength(2, { message: 'query phải có ít nhất 2 ký tự' })
  query: string;

  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

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
  limit?: number = 10;
}