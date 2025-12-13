import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto, FilterProductDto } from './dto/product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) {}

  // Tạo slug từ name
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // F3.7.1: Thêm sản phẩm mới (Admin)
  async create(createProductDto: CreateProductDto) {
    const slug = this.createSlug(createProductDto.name);

    // Check slug exists
    const existingProduct = await this.productModel.findOne({ slug });
    if (existingProduct) {
      throw new ConflictException('Sản phẩm này đã tồn tại');
    }

    // Verify category exists
    await this.categoriesService.findOne(createProductDto.categoryId);

    const product = new this.productModel({
      ...createProductDto,
      slug,
    });

    await product.save();

    // Update category product count
    await this.categoriesService.updateProductCount(createProductDto.categoryId, 1);

    return {
      message: 'Thêm sản phẩm thành công',
      data: product,
    };
  }

  // F3.1: Xem danh sách sản phẩm với filter, search, pagination
  async findAll(filterDto: FilterProductDto) {
    const {
      page = 1,
      limit = 12,
      categoryId,
      search,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isFeatured,
      brand,
      tag,
    } = filterDto;

    // Build filter query
    const filter: any = { isActive: true };

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // Build sort
    const sort: any = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // F3.2: Xem chi tiết sản phẩm
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return {
      message: 'Lấy thông tin sản phẩm thành công',
      data: product,
    };
  }

  // Xem sản phẩm theo slug
  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return {
      message: 'Lấy thông tin sản phẩm thành công',
      data: product,
    };
  }

  // F3.7.2: Cập nhật sản phẩm (Admin)
  async update(id: string, updateProductDto: UpdateProductDto) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('ID sản phẩm không hợp lệ');
  }

  const product = await this.productModel.findById(id);

  if (!product) {
    throw new NotFoundException('Không tìm thấy sản phẩm');
  }

  // If name changed, update slug
  if (updateProductDto.name && updateProductDto.name !== product.name) {
    const newSlug = this.createSlug(updateProductDto.name);
    
    const existingProduct = await this.productModel.findOne({ 
      slug: newSlug, 
      _id: { $ne: id } 
    });
    
    if (existingProduct) {
      throw new ConflictException('Sản phẩm này đã tồn tại');
    }

    product.slug = newSlug;
  }

  // If category changed, update product counts
  if (updateProductDto.categoryId && updateProductDto.categoryId !== product.categoryId.toString()) {
    // Verify new category exists
    await this.categoriesService.findOne(updateProductDto.categoryId);
    
    // Update counts
    await this.categoriesService.updateProductCount(product.categoryId.toString(), -1);
    await this.categoriesService.updateProductCount(updateProductDto.categoryId, 1);
  }

  // Update only provided fields (không ghi đè undefined)
  const allowedUpdates = [
    'name', 'description', 'price', 'stock', 'categoryId',
    'images', 'tags', 'brand', 'weight', 'discount',
    'colors', 'sizes', 'isActive', 'isFeatured',
    'metaDescription', 'metaKeywords'
  ];

  allowedUpdates.forEach(field => {
    if (updateProductDto[field] !== undefined) {
      product[field] = updateProductDto[field];
    }
  });

  await product.save();

  return {
    message: 'Cập nhật sản phẩm thành công',
    data: product,
  };
}

  // F3.7.3: Xóa sản phẩm (Admin - soft delete)
  async remove(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    product.isActive = false;
    await product.save();

    // Update category product count
    await this.categoriesService.updateProductCount(product.categoryId.toString(), -1);

    return {
      message: 'Xóa sản phẩm thành công',
    };
  }

  // Get featured products
  async getFeatured(limit: number = 8) {
    const products = await this.productModel
      .find({ isActive: true, isFeatured: true })
      .populate('categoryId', 'name slug')
      .sort({ soldCount: -1, rating: -1 })
      .limit(limit)
      .exec();

    return {
      message: 'Lấy sản phẩm nổi bật thành công',
      data: products,
    };
  }

  // Get best sellers
  async getBestSellers(limit: number = 8) {
    const products = await this.productModel
      .find({ isActive: true })
      .populate('categoryId', 'name slug')
      .sort({ soldCount: -1 })
      .limit(limit)
      .exec();

    return {
      message: 'Lấy sản phẩm bán chạy thành công',
      data: products,
    };
  }

  // Get new arrivals
  async getNewArrivals(limit: number = 8) {
    const products = await this.productModel
      .find({ isActive: true })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return {
      message: 'Lấy sản phẩm mới thành công',
      data: products,
    };
  }
}