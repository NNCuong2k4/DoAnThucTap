import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { CommentsService } from './comments.service';
import { BlogPost, BlogPostSchema } from '../../schemas/blog-post.schema';
import { Comment, CommentSchema } from '../../schemas/comments.schema'; // ← ADDED: Import Comment schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Comment.name, schema: CommentSchema }, // ← ADDED: Comment schema
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService, CommentsService], // ← ADDED: CommentsService
  exports: [BlogService, CommentsService], // ← ADDED: Export CommentsService
})
export class BlogModule {}