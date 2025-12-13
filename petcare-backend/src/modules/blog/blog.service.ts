import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BlogPost,
  BlogPostDocument,
  PostStatus,
} from '../../schemas/blog-post.schema';
import {
  CreatePostDto,
  UpdatePostDto,
  FilterPostsDto,
  SearchPostsDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name)
    private blogPostModel: Model<BlogPostDocument>,
  ) {}

  // F7.1: Get all published posts (Public)
  async getAllPosts(filterDto: FilterPostsDto, isAdmin: boolean = false) {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      sortBy = 'date',
      status,
    } = filterDto;

    const filter: any = {
      deletedAt: null,
    };

    // Public users only see published posts
    if (!isAdmin) {
      filter.status = PostStatus.PUBLISHED;
      filter.isPublished = true;
    } else if (status) {
      // Admin can filter by status
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    const sortOrder: any = {};
    if (sortBy === 'views') {
      sortOrder.viewCount = -1;
    } else {
      sortOrder.publishedAt = -1;
      sortOrder.createdAt = -1;
    }

    const [posts, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .populate('author', 'name email')
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .select('-content') // Exclude full content in list
        .exec(),
      this.blogPostModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy danh sách bài viết thành công',
      data: posts,
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

  // F7.2: Get post detail by slug (Public)
  async getPostBySlug(slug: string, isAdmin: boolean = false) {
    const filter: any = { slug, deletedAt: null };

    // Public users only see published posts
    if (!isAdmin) {
      filter.status = PostStatus.PUBLISHED;
      filter.isPublished = true;
    }

    const post = await this.blogPostModel
      .findOne(filter)
      .populate('author', 'name email');

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Increment view count (only for public views)
    if (!isAdmin) {
      post.viewCount += 1;
      await post.save();
    }

    return {
      message: 'Lấy thông tin bài viết thành công',
      data: post,
    };
  }

  // F7.3: Search posts (Public)
  async searchPosts(searchDto: SearchPostsDto, isAdmin: boolean = false) {
    const { query, category, page = 1, limit = 10 } = searchDto;

    const filter: any = {
      $text: { $search: query },
      deletedAt: null,
    };

    // Public users only see published posts
    if (!isAdmin) {
      filter.status = PostStatus.PUBLISHED;
      filter.isPublished = true;
    }

    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.blogPostModel
        .find(filter, { score: { $meta: 'textScore' } })
        .populate('author', 'name email')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .exec(),
      this.blogPostModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Tìm kiếm bài viết thành công',
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // F7.4: Create post (Admin)
  async createPost(adminId: string, createDto: CreatePostDto) {
    // Generate slug from title
    const slug = await this.generateUniqueSlug(createDto.title);

    // Auto-generate excerpt if not provided
    const excerpt =
      createDto.excerpt ||
      this.generateExcerpt(createDto.content);

    // Auto-generate meta title/description if not provided
    const metaTitle = createDto.metaTitle || createDto.title;
    const metaDescription =
      createDto.metaDescription || excerpt;

    const postData: any = {
      ...createDto,
      slug,
      excerpt,
      metaTitle,
      metaDescription,
      author: new Types.ObjectId(adminId),
    };

    // If status is published, set publishedAt and isPublished
    if (createDto.status === PostStatus.PUBLISHED) {
      postData.publishedAt = new Date();
      postData.isPublished = true;
    } else {
      postData.isPublished = false;
    }

    const post = new this.blogPostModel(postData);
    await post.save();
    await post.populate('author', 'name email');

    return {
      message: 'Tạo bài viết thành công',
      data: post,
    };
  }

  // F7.5: Update post (Admin)
  async updatePost(postId: string, updateDto: UpdatePostDto) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID bài viết không hợp lệ');
    }

    const post = await this.blogPostModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // If title changed, regenerate slug
    if (updateDto.title && updateDto.title !== post.title) {
      const newSlug = await this.generateUniqueSlug(updateDto.title);
      updateDto['slug'] = newSlug;
    }

    // If status changed to published
    if (
      updateDto.status === PostStatus.PUBLISHED &&
      post.status !== PostStatus.PUBLISHED
    ) {
      updateDto['publishedAt'] = new Date();
      updateDto['isPublished'] = true;
    }

    // If status changed from published
    if (
      updateDto.status &&
      updateDto.status !== PostStatus.PUBLISHED &&
      post.status === PostStatus.PUBLISHED
    ) {
      updateDto['isPublished'] = false;
    }

    Object.assign(post, updateDto);
    await post.save();
    await post.populate('author', 'name email');

    return {
      message: 'Cập nhật bài viết thành công',
      data: post,
    };
  }

  // F7.6: Delete post (Admin - soft delete)
  async deletePost(postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID bài viết không hợp lệ');
    }

    const post = await this.blogPostModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Soft delete
    post.deletedAt = new Date();
    post.isPublished = false;
    await post.save();

    return {
      message: 'Xóa bài viết thành công',
    };
  }

  // HELPER: Generate unique slug
  private async generateUniqueSlug(title: string): Promise<string> {
    let baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists
    while (await this.blogPostModel.exists({ slug, deletedAt: null })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // HELPER: Slugify string (handle Vietnamese)
  private slugify(text: string): string {
    const vietnameseMap: { [key: string]: string } = {
      à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a',
      â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a',
      ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a',
      è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e',
      ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e',
      ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
      ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o',
      ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o',
      ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o',
      ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u',
      ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u',
      ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y',
      đ: 'd',
      À: 'A', Á: 'A', Ạ: 'A', Ả: 'A', Ã: 'A',
      Â: 'A', Ầ: 'A', Ấ: 'A', Ậ: 'A', Ẩ: 'A', Ẫ: 'A',
      Ă: 'A', Ằ: 'A', Ắ: 'A', Ặ: 'A', Ẳ: 'A', Ẵ: 'A',
      È: 'E', É: 'E', Ẹ: 'E', Ẻ: 'E', Ẽ: 'E',
      Ê: 'E', Ề: 'E', Ế: 'E', Ệ: 'E', Ể: 'E', Ễ: 'E',
      Ì: 'I', Í: 'I', Ị: 'I', Ỉ: 'I', Ĩ: 'I',
      Ò: 'O', Ó: 'O', Ọ: 'O', Ỏ: 'O', Õ: 'O',
      Ô: 'O', Ồ: 'O', Ố: 'O', Ộ: 'O', Ổ: 'O', Ỗ: 'O',
      Ơ: 'O', Ờ: 'O', Ớ: 'O', Ợ: 'O', Ở: 'O', Ỡ: 'O',
      Ù: 'U', Ú: 'U', Ụ: 'U', Ủ: 'U', Ũ: 'U',
      Ư: 'U', Ừ: 'U', Ứ: 'U', Ự: 'U', Ử: 'U', Ữ: 'U',
      Ỳ: 'Y', Ý: 'Y', Ỵ: 'Y', Ỷ: 'Y', Ỹ: 'Y',
      Đ: 'D',
    };

    // Replace Vietnamese characters
    let slug = text
      .split('')
      .map((char) => vietnameseMap[char] || char)
      .join('');

    // Convert to lowercase, replace spaces with hyphens, remove special chars
    slug = slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    return slug;
  }

  // HELPER: Generate excerpt from content
  private generateExcerpt(content: string, maxLength: number = 200): string {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  }

  // HELPER: Get popular posts (for homepage/sidebar)
  async getPopularPosts(limit: number = 5) {
    const posts = await this.blogPostModel
      .find({
        status: PostStatus.PUBLISHED,
        isPublished: true,
        deletedAt: null,
      })
      .sort({ viewCount: -1 })
      .limit(limit)
      .select('title slug featuredImage viewCount category')
      .exec();

    return posts;
  }

  // HELPER: Get related posts
  async getRelatedPosts(postId: string, limit: number = 3) {
    const post = await this.blogPostModel.findById(postId);
    
    if (!post) {
      return [];
    }

    const relatedPosts = await this.blogPostModel
      .find({
        _id: { $ne: postId },
        category: post.category,
        status: PostStatus.PUBLISHED,
        isPublished: true,
        deletedAt: null,
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug featuredImage excerpt category')
      .exec();

    return relatedPosts;
  }
}