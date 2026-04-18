import React, { useState, useEffect } from 'react';
import './ProductSelectModal.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect width='400' height='500' fill='%23222222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-family='Georgia, serif' font-size='36' font-weight='bold'%3ELUXE%3C/text%3E%3C/svg%3E";

const ProductSelectModal = ({ product, onConfirm, onClose }) => {
  // Initialize states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color) || [])];

  // Initialize selected size and color on first render
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      if (!selectedSize && sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }
      if (!selectedColor && colors.length > 0) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product, sizes, colors, selectedSize, selectedColor]);

  // Get current selected variant based on size and color
  const selectedVariant = product.variants?.find(v =>
    v.size === selectedSize && v.color === selectedColor
  );

  const currentPrice = selectedVariant?.price || (product.variants?.[0]?.price || 0);
  const currentStock = selectedVariant?.stockQuantity || 0;
  const isOutOfStock = currentStock === 0;

  // Auto-adjust quantity when stock changes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    }
    if (currentStock === 0) {
      setQuantity(0);
    }
  }, [currentStock, quantity]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Check if current color is available with new size
    const colorAvailable = product.variants?.some(v => v.size === size && v.color === selectedColor);
    if (!colorAvailable && colors.length > 0) {
      // Find first available color for this size
      const firstColorForSize = product.variants?.find(v => v.size === size)?.color;
      if (firstColorForSize) {
        setSelectedColor(firstColorForSize);
      }
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Check if current size is available with new color
    const sizeAvailable = product.variants?.some(v => v.color === color && v.size === selectedSize);
    if (!sizeAvailable && sizes.length > 0) {
      // Find first available size for this color
      const firstSizeForColor = product.variants?.find(v => v.color === color)?.size;
      if (firstSizeForColor) {
        setSelectedSize(firstSizeForColor);
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (currentStock > 0 && newQuantity > currentStock) {
      setQuantity(currentStock);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn kích cỡ và màu sắc!');
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      alert('Sản phẩm này đã hết hàng!');
      return;
    }

    if (quantity <= 0) {
      alert('Vui lòng chọn số lượng hợp lệ!');
      return;
    }

    onConfirm(product, selectedVariant, quantity);
    onClose();
  };

  // Get image URL
  const getImageUrl = () => {
    if (product.image) {
      return `${API_GATEWAY}/product-catalog-service/products/images/${product.image}`;
    }
    return fallbackImg;
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <img
            className="modal-product-img"
            src={getImageUrl()}
            onError={(e) => e.target.src = fallbackImg}
            alt={product.productName}
          />
          <div className="modal-info">
            <div className="brand">{product.brand || 'BOUTIQUE'}</div>
            <h2>{product.productName}</h2>
            <div className="current-price">
              {currentPrice.toLocaleString('vi-VN')} ₫
            </div>
            {selectedVariant && (
              <div className={`stock-status ${currentStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {currentStock > 0 ? `✓ Còn ${currentStock} sản phẩm` : '✗ Hết hàng'}
              </div>
            )}
          </div>
        </div>

        <div className="modal-form-group">
          <label>Chọn Kích Cỡ</label>
          <div className="size-color-options">
            {sizes.map(size => (
              <button
                key={size}
                className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => handleSizeSelect(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-form-group">
          <label>Chọn Màu Sắc</label>
          <div className="size-color-options">
            {colors.map(color => (
              <button
                key={color}
                className={`option-btn ${selectedColor === color ? 'selected' : ''}`}
                onClick={() => handleColorSelect(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-form-group">
          <label>Số Lượng</label>
          <div className="quantity-control">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isOutOfStock || quantity <= 1}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min="1"
              max={currentStock > 0 ? currentStock : 1}
              disabled={isOutOfStock}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= currentStock}
            >
              +
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={isOutOfStock || !selectedVariant}
          >
            Thêm Vào Giỏ Hàng
          </button>
          <button className="btn-cancel" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectModal;