// ==================== ImageUploadCloudinary.jsx ====================
// Location: src/components/admin/ImageUploadCloudinary.jsx

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ImageUploadCloudinary = ({ value, onChange, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || (multiple ? [] : ''));

  // ✅ Cloudinary config - ĐÃ CẤU HÌNH SẴN
  const CLOUD_NAME = 'dbfkfgrgp'; // ← Your cloud name
  const UPLOAD_PRESET = 'petcare-products'; // ← Tạo preset này trong Cloudinary

  // ✅ Fallback placeholder image as data URL (works offline)
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23f3f4f6" width="150" height="150"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'products');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        const newPreviews = [...(preview || []), ...urls];
        setPreview(newPreviews);
        onChange(newPreviews);
      } else {
        setPreview(urls[0]);
        onChange(urls);
      }

      toast.success(`✅ Đã upload ${files.length} ảnh thành công!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Upload ảnh thất bại! Kiểm tra Upload Preset trong Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    if (multiple) {
      const newPreviews = preview.filter((_, index) => index !== indexToRemove);
      setPreview(newPreviews);
      onChange(newPreviews);
    } else {
      setPreview('');
      onChange([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label
          htmlFor="file-upload-cloudinary"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang upload...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Chọn ảnh
            </>
          )}
        </label>
        <input
          id="file-upload-cloudinary"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {multiple ? (
        // Multiple images preview
        preview && preview.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {preview.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        // Single image preview
        preview && (
          <div className="relative group w-48">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(0)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500">
        Upload lên Cloudinary. Chấp nhận: JPG, PNG, GIF, WEBP.
        {multiple && ' Chọn nhiều ảnh cùng lúc.'}
      </p>
    </div>
  );
};

export default ImageUploadCloudinary;