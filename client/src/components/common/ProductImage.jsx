import React, { useState } from 'react';
import { FaUtensils } from 'react-icons/fa';

/**
 * Shows a product's photo if available, otherwise a polished default
 * "plate and utensils" icon instead of a blank gray box. Falls back
 * automatically if the image URL is broken/dead too.
 */
const ProductImage = ({ src, alt, size = 96, rounded = 'rounded-lg' }) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  const dimension = `${size}px`;

  if (showFallback) {
    return (
      <div
        className={`${rounded} bg-gray-800 flex items-center justify-center flex-shrink-0`}
        style={{ width: dimension, height: dimension }}
      >
        <FaUtensils
          className="text-gray-400"
          style={{ fontSize: `${Math.round(size * 0.4)}px` }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${rounded} object-contain bg-gray-50 border border-gray-200 flex-shrink-0`}
      style={{ width: dimension, height: dimension }}
      onError={() => setFailed(true)}
    />
  );
};

export default ProductImage;