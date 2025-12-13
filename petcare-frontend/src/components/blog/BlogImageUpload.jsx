import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const BlogImageUpload = ({ 
  value, 
  onChange, 
  label = 'Tải ảnh lên',
  maxSize = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const CLOUD_NAME = 'dbfkfgrgp';
  const UPLOAD_PRESET = 'petcare-blog-images'; // ← TẠO PRESET MỚI

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('❌ Chỉ chấp nhận JPG, PNG, GIF, WEBP');
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`❌ Kích thước không vượt quá ${maxSize}MB`);
      return false;
    }
    return true;
  };

  const uploadToCloudinary = async (file) => {
    if (!validateFile(file)) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'blog-posts/user-content');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPreview(data.secure_url);
      onChange(data.secure_url);
      toast.success('✅ Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Tải ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/800x450'}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Đổi ảnh
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-video w-full border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          } ${uploading ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <>
                <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="mt-4 text-sm font-medium text-gray-700">Đang tải ảnh lên...</p>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-base font-medium text-gray-700 mb-1">
                  {dragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây'}
                </p>
                <p className="text-sm text-gray-500 mb-3">hoặc</p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Chọn ảnh từ máy
                </span>
                <p className="mt-4 text-xs text-gray-400">PNG, JPG, GIF, WEBP • Tối đa {maxSize}MB</p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
};

export default BlogImageUpload;