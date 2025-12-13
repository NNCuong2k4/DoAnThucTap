import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const BlogCard = ({ post }) => {
  const categoryColors = {
    tips: 'bg-blue-100 text-blue-800',
    health: 'bg-green-100 text-green-800',
    'product-review': 'bg-purple-100 text-purple-800',
    news: 'bg-red-100 text-red-800',
    guide: 'bg-yellow-100 text-yellow-800',
  };

  const categoryLabels = {
    tips: 'Mẹo hay',
    health: 'Sức khỏe',
    'product-review': 'Đánh giá',
    news: 'Tin tức',
    guide: 'Hướng dẫn',
  };

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <img
          src={post.featuredImage || 'https://via.placeholder.com/800x450?text=Care4Pets'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => e.target.src = 'https://via.placeholder.com/800x450?text=Care4Pets'}
        />
        
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || 'bg-gray-100 text-gray-800'}`}>
            {categoryLabels[post.category] || post.category}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {post.viewCount || 0}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
              alt={post.author?.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{post.author?.name}</span>
          </div>

          <time className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), { 
              addSuffix: true, locale: vi 
            })}
          </time>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;