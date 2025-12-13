import { IsString, IsNotEmpty, IsOptional, IsMongoId, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great article! Very informative about pet care.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @MinLength(1, { message: 'Content must be at least 1 character' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters' })
  content: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for nested replies',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid parent comment ID' })
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Updated comment content',
    example: 'Updated: Great article! Very informative.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @MinLength(1, { message: 'Content must be at least 1 character' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters' })
  content: string;
}

export class CommentQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Parent comment ID to get replies',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  postId: string;

  @ApiProperty({
    example: {
      _id: '507f1f77bcf86cd799439013',
      name: 'John Doe',
      avatar: 'https://cloudinary.com/avatar.jpg',
    },
  })
  user: {
    _id: string;
    name: string;
    avatar: string;
  };

  @ApiProperty({ example: 'Great article! Very informative.' })
  content: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  parentId?: string;

  @ApiProperty({ example: 5 })
  likes: number;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiProperty({ example: '2024-12-07T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-12-07T10:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Nested replies (if any)',
    type: [CommentResponseDto],
  })
  replies?: CommentResponseDto[];
}

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({
    example: {
      total: 45,
      page: 1,
      limit: 10,
      totalPages: 5,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}