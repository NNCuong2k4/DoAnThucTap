import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Blog Categories
export enum BlogCategory {
  TIPS = 'tips',
  HEALTH = 'health',
  PRODUCT_REVIEW = 'product-review',
  NEWS = 'news',
  GUIDE = 'guide',
}

// Post Status
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type BlogPostDocument = BlogPost & Document;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  slug: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ trim: true })
  excerpt: string;

  @Prop({ trim: true })
  featuredImage: string;

  @Prop({
    type: String,
    enum: Object.values(BlogCategory),
    required: true,
    index: true,
  })
  category: BlogCategory;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(PostStatus),
    default: PostStatus.DRAFT,
    index: true,
  })
  status: PostStatus;

  @Prop({ default: 0, index: true })
  viewCount: number;

  @Prop({ type: Date })
  publishedAt: Date;

  @Prop({ default: false, index: true })
  isPublished: boolean;

  @Prop({ trim: true })
  metaTitle: string;

  @Prop({ trim: true })
  metaDescription: string;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

// Indexes for performance
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, isPublished: 1 });
BlogPostSchema.index({ category: 1, createdAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ viewCount: -1 }); // For popular posts
BlogPostSchema.index({ publishedAt: -1 }); // For latest posts
BlogPostSchema.index({ deletedAt: 1 }); // For soft delete queries

// Text index for search
BlogPostSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text',
});