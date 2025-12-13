import { IsNotEmpty, IsNumber, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ 
    example: '674471234567890abcdef101', 
    description: 'ID sản phẩm' 
  })
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  @IsMongoId({ message: 'Product ID không hợp lệ' })
  productId: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Số lượng' 
  })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ 
    example: '674471234567890abcdef101', 
    description: 'ID sản phẩm' 
  })
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ 
    example: 5, 
    description: 'Số lượng mới' 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}