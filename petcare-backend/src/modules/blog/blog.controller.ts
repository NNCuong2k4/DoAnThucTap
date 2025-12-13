import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CommentsService } from './comments.service'; // ← ADDED
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import {
  CreatePostDto,
  UpdatePostDto,
  FilterPostsDto,
  SearchPostsDto,
} from './dto/blog.dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentQueryDto,
} from './dto/comments.schema'; // ← ADDED

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly commentsService: CommentsService, // ← ADDED
  ) {}

  // ================================================================
  // EXISTING BLOG ENDPOINTS (UNCHANGED)
  // ================================================================

  // F7.3: Search posts (Public) - MUST be before /:slug
  @Get('search')
  async searchPosts(@Query() searchDto: SearchPostsDto) {
    return this.blogService.searchPosts(searchDto, false);
  }

  // F7.1: Get all posts (Public)
  @Get()
  async getAllPosts(@Query() filterDto: FilterPostsDto) {
    return this.blogService.getAllPosts(filterDto, false);
  }

  // F7.4: Create post (Admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createPost(@Req() req, @Body() createDto: CreatePostDto) {
    return this.blogService.createPost(req.user.userId, createDto);
  }

  // BONUS: Get popular posts (Public)
  @Get('popular/posts')
  async getPopularPosts(@Query('limit') limit?: number) {
    const posts = await this.blogService.getPopularPosts(limit || 5);
    return {
      message: 'Lấy danh sách bài viết phổ biến thành công',
      data: posts,
    };
  }

  // ================================================================
  // NEW: COMMENTS ENDPOINTS (7 ENDPOINTS)
  // ================================================================

  // Get current user's comments across all posts
  @Get('my-comments')
  @UseGuards(JwtAuthGuard)
  async getMyComments(
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.getUserComments(req.user.userId, page, limit);
  }

  // F7.2: Get post detail by slug (Public) - MUST be after /my-comments
  @Get(':slug')
  async getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug, false);
  }

  // F7.5: Update post (Admin)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePost(@Param('id') id: string, @Body() updateDto: UpdatePostDto) {
    return this.blogService.updatePost(id, updateDto);
  }

  // F7.6: Delete post (Admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  // BONUS: Get related posts (Public)
  @Get(':id/related')
  async getRelatedPosts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    const posts = await this.blogService.getRelatedPosts(id, limit || 3);
    return {
      message: 'Lấy danh sách bài viết liên quan thành công',
      data: posts,
    };
  }

  // -------------------- COMMENTS ENDPOINTS --------------------

  // 1. Create a comment on a blog post
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const comment = await this.commentsService.create(
      postId,
      req.user.userId,
      createCommentDto,
    );
    return {
      message: 'Tạo bình luận thành công',
      data: comment,
    };
  }

  // 2. Get comments for a blog post (with pagination)
  @Get(':id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query() query: CommentQueryDto,
  ) {
    const result = await this.commentsService.findByPost(postId, query);
    return {
      message: 'Lấy danh sách bình luận thành công',
      data: result.comments,
      pagination: result.pagination,
    };
  }

  // 3. Get comment count for a post
  @Get(':id/comments/count')
  async getCommentCount(@Param('id') postId: string) {
    const count = await this.commentsService.getCommentCount(postId);
    return {
      message: 'Lấy số lượng bình luận thành công',
      data: { count },
    };
  }

  // 4. Update a comment (only owner)
  @Put(':postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    const comment = await this.commentsService.update(
      commentId,
      req.user.userId,
      updateCommentDto,
    );
    return {
      message: 'Cập nhật bình luận thành công',
      data: comment,
    };
  }

  // 5. Delete a comment (owner or admin)
  @Delete(':postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('commentId') commentId: string, @Req() req) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    const result = await this.commentsService.remove(
      commentId,
      req.user.userId,
      isAdmin,
    );
    return {
      message: result.message,
    };
  }

  // 6. Like a comment (bonus feature)
  @Post(':postId/comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  async likeComment(@Param('commentId') commentId: string, @Req() req) {
    const comment = await this.commentsService.likeComment(
      commentId,
      req.user.userId,
    );
    return {
      message: 'Thích bình luận thành công',
      data: comment,
    };
  }

  // ================================================================
  // SUMMARY: TOTAL ENDPOINTS IN CONTROLLER
  // ================================================================
  // Blog Posts: 7 endpoints (search, list, create, detail, update, delete, popular, related)
  // Comments: 7 endpoints (create, list, count, update, delete, like, my-comments)
  // TOTAL: 14 endpoints
}