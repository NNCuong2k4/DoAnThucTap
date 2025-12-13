import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../schemas/comments.schema';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentQueryDto,
} from './dto/comments.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  /**
   * Create a new comment
   */
  async create(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    // If parentId is provided, validate it exists
    if (createCommentDto.parentId) {
      const parentComment = await this.commentModel.findById(
        createCommentDto.parentId,
      );
      if (!parentComment) {
        throw new NotFoundException('Bình luận cha không tồn tại');
      }
      if (parentComment.postId.toString() !== postId) {
        throw new BadRequestException(
          'Bình luận cha không thuộc bài viết này',
        );
      }
      if (parentComment.isDeleted) {
        throw new BadRequestException('Không thể trả lời bình luận đã bị xóa');
      }
    }

    const comment = new this.commentModel({
      postId,
      userId,
      content: createCommentDto.content,
      parentId: createCommentDto.parentId || null,
    });

    await comment.save();

    // Populate user info before returning
    const populatedComment = await this.commentModel
      .findById(comment._id)
      .populate('userId', 'name avatar email')
      .exec();
    
    if (!populatedComment) {
      throw new NotFoundException('Không thể tìm thấy bình luận vừa tạo');
    }
    
    return populatedComment;
  }

  /**
   * Get comments for a post with pagination
   */
  async findByPost(postId: string, query: CommentQueryDto) {
    const page = Math.max(1, parseInt(query.page?.toString() || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit?.toString() || '10')));
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    // Build filter - only top-level comments (no parent) or specific parent
    const filter: any = {
      postId,
      isDeleted: false,
    };

    if (query.parentId) {
      filter.parentId = query.parentId;
    } else {
      filter.parentId = null; // Top-level comments only
    }

    // Get comments with pagination
    const comments = await this.commentModel
      .find(filter)
      .populate('userId', 'name avatar email')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count
    const total = await this.commentModel.countDocuments(filter);

    // For each comment, get reply count
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await this.commentModel.countDocuments({
          parentId: comment._id,
          isDeleted: false,
        });
        return {
          ...comment.toObject(),
          replyCount,
          user: comment.userId, // Rename userId to user for cleaner response
          userId: undefined,
        };
      }),
    );

    return {
      comments: commentsWithReplies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single comment by ID
   */
  async findOne(id: string): Promise<CommentDocument> {
    const comment = await this.commentModel
      .findById(id)
      .populate('userId', 'name avatar email')
      .exec();

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    return comment;
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể sửa bình luận của mình');
    }

    comment.content = updateCommentDto.content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await this.commentModel
      .findById(comment._id)
      .populate('userId', 'name avatar email')
      .exec();
    
    if (!updatedComment) {
      throw new NotFoundException('Không thể tìm thấy bình luận sau khi cập nhật');
    }
    
    return updatedComment;
  }

  /**
   * Delete a comment (soft delete)
   */
  async remove(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<{ message: string }> {
    const comment = await this.commentModel.findById(id);

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    // Check ownership or admin
    if (comment.userId.toString() !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn chỉ có thể xóa bình luận của mình');
    }

    // Soft delete
    comment.isDeleted = true;
    comment.content = '[Bình luận đã bị xóa]';
    await comment.save();

    return { message: 'Xóa bình luận thành công' };
  }

  /**
   * Get comment count for a post
   */
  async getCommentCount(postId: string): Promise<number> {
    return this.commentModel.countDocuments({
      postId,
      isDeleted: false,
    });
  }

  /**
   * Get user's comments
   */
  async getUserComments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ userId, isDeleted: false })
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments({
      userId,
      isDeleted: false,
    });

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Like a comment (bonus feature)
   */
  async likeComment(id: string, userId: string): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    // Simple increment (in production, track who liked in separate collection)
    comment.likes += 1;
    await comment.save();

    const likedComment = await this.commentModel
      .findById(comment._id)
      .populate('userId', 'name avatar email')
      .exec();
    
    if (!likedComment) {
      throw new NotFoundException('Không thể tìm thấy bình luận sau khi like');
    }
    
    return likedComment;
  }

  /**
   * Admin: Get all comments with filters
   */
  async findAll(page: number = 1, limit: number = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.postId) query.postId = filters.postId;
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.isDeleted !== undefined) query.isDeleted = filters.isDeleted;

    const comments = await this.commentModel
      .find(query)
      .populate('userId', 'name avatar email')
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments(query);

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}