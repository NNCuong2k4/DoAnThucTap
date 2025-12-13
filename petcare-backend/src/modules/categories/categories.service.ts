import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  // Tạo slug từ name
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Replace multiple - with single -
  }

  // F3.8.1: Thêm danh mục mới (Admin)
  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.createSlug(createCategoryDto.name);

    // Check slug exists
    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new ConflictException('Danh mục này đã tồn tại');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });

    await category.save();

    return {
      message: 'Thêm danh mục thành công',
      data: category,
    };
  }

  // F3.8.4: Xem danh sách danh mục (Public)
  async findAll(showInactive: boolean = false) {
    const filter: any = {};
    
    if (!showInactive) {
      filter.isActive = true;
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .exec();

    return {
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
      total: categories.length,
    };
  }

  // Xem chi tiết danh mục
  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return {
      message: 'Lấy thông tin danh mục thành công',
      data: category,
    };
  }

  // Xem danh mục theo slug
  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug, isActive: true }).exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return {
      message: 'Lấy thông tin danh mục thành công',
      data: category,
    };
  }

  // F3.8.2: Sửa danh mục (Admin)
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // If name changed, update slug
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const newSlug = this.createSlug(updateCategoryDto.name);
      
      // Check new slug exists
      const existingCategory = await this.categoryModel.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      });
      
      if (existingCategory) {
        throw new ConflictException('Danh mục này đã tồn tại');
      }

      category.slug = newSlug;
    }

    Object.assign(category, updateCategoryDto);
    await category.save();

    return {
      message: 'Cập nhật danh mục thành công',
      data: category,
    };
  }

  // F3.8.3: Xóa danh mục (Admin - soft delete)
  async remove(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Check if category has products
    if (category.productCount > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục đang có sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.',
      );
    }

    category.isActive = false;
    await category.save();

    return {
      message: 'Xóa danh mục thành công',
    };
  }

  // Hard delete (Admin only - for maintenance)
  async hardDelete(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (category.productCount > 0) {
      throw new BadRequestException('Không thể xóa danh mục đang có sản phẩm');
    }

    await this.categoryModel.findByIdAndDelete(id);

    return {
      message: 'Xóa vĩnh viễn danh mục thành công',
    };
  }

  // Update product count
  async updateProductCount(categoryId: string, increment: number) {
    await this.categoryModel.findByIdAndUpdate(
      categoryId,
      { $inc: { productCount: increment } },
    );
  }
}