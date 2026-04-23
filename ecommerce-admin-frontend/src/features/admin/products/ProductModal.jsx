import React, { useState } from 'react';
import axios from 'axios';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='68'%3E%3Crect width='54' height='68' fill='%23242429'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237a7a8a' font-family='sans-serif' font-size='14'%3E%E2%80%94%3C/text%3E%3C/svg%3E";
const emptyVariant = () => ({ size: '', color: '', price: '', stockQuantity: '' });

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    productName: '', brand: '', material: '', category: '', imageUrl: '', variants: []
  });
  const [variants, setVariants] = useState(product?.variants || []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!product?.id;

  const addVariant = () => setVariants(v => [...v, emptyVariant()]);
  const delVariant = i => setVariants(v => v.filter((_, idx) => idx !== i));
  const setVariant = (i, k, v) => setVariants(vs => vs.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSubmit = async () => {
    if (!form.productName || form.productName.length < 2) {
      alert("Tên sản phẩm phải có ít nhất 2 ký tự!");
      return;
    }
    if (!form.category) {
      alert("Vui lòng chọn danh mục cho sản phẩm!");
      return;
    }
    for (let i = 0; i < variants.length; i++) {
        let v = variants[i];
      if (v.price === '' || parseFloat(v.price) < 0) {
        alert("Giá sản phẩm ở các biến thể không được để trống hoặc là số âm!");
        return;
      }
      if (v.stockQuantity === '' || parseInt(v.stockQuantity) < 0) {
        alert("Số lượng kho ở các biến thể không được để trống hoặc là số âm!");
        return;
      }
    }

    const formData = new FormData();
    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }
    const productData = {
      productName: form.productName,
      brand: form.brand,
      material: form.material,
      category: form.category,
      description: form.description || '',
      image: form.image,
      variants: variants.map(v => ({
        ...v, price: parseFloat(v.price) || 0, stockQuantity: parseInt(v.stockQuantity) || 0
      }))
    };
    formData.append('product', JSON.stringify(productData));
    try {
      if (isEdit) {
        await axios.post(`${API_GATEWAY}/product-catalog-service/products/${product.id}`, formData);
      } else {
        await axios.post(`${API_GATEWAY}/product-catalog-service/products`, formData);
      }
      onSave(isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
    } catch { onSave(null); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3>{isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input className="form-input" placeholder="Áo thun oversize..." value={form.productName} onChange={e => set('productName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Thương hiệu</label>
              <input className="form-input" placeholder="Nike, Zara..." value={form.brand || ''} onChange={e => set('brand', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Chất liệu</label>
              <input className="form-input" placeholder="Cotton, Polyester..." value={form.material || ''} onChange={e => set('material', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-select" value={form.category || ''} onChange={e => set('category', e.target.value)}>
                <option value="">-- Chọn --</option>
                {['Áo', 'Quần', 'Váy', 'Phụ kiện', 'Giày dép', 'Túi xách', 'Đồ thể thao'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <div className="image-upload-wrapper">
              <input
                type="file"
                id="productImageInput"
                className="form-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) set('imageFile', file);
                }}
              />
              <div className="image-upload-controls">
                <button className="btn-upload-trigger" onClick={() => document.getElementById('productImageInput').click()}>
                  {form.imageFile ? '🔄 Đổi ảnh khác' : (form.image ? '🔄 Thay đổi ảnh' : '📁 Chọn ảnh sản phẩm')}
                </button>
                {(form.imageFile || form.image) && (
                  <button className="btn-remove-image" onClick={() => { set('imageFile', null); set('image', null); }}>
                    ❌ Gỡ bỏ ảnh
                  </button>
                )}
              </div>
            </div>
            
            {(form.imageFile || (form.image && !form.imageFile)) && (
              <div className="image-preview-container" style={{ marginTop: 15, position: 'relative', width: 'fit-content' }}>
                <img 
                  src={form.imageFile ? URL.createObjectURL(form.imageFile) : `${API_GATEWAY}/product-catalog-service/products/images/${form.image}`} 
                  alt="Preview" 
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--lux-accent)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }} 
                />
              </div>
            )}
          </div>

          <div className="variant-editor">
            <div className="variant-editor-title">
              <span>🏷️ Biến thể (Size / Màu / Giá / Kho)</span>
              <button className="btn-add-variant" style={{ width: 'auto', padding: '4px 12px' }} onClick={addVariant}>+ Thêm</button>
            </div>
            {variants.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>Chưa có biến thể nào.</p>}
            {variants.map((v, i) => (
              <div className="variant-row" key={i}>
                <input className="variant-input" placeholder="Size" value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} />
                <input className="variant-input" placeholder="Màu" value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} />
                <input className="variant-input" placeholder="Giá ($)" type="number" value={v.price} onChange={e => setVariant(i, 'price', e.target.value)} />
                <input className="variant-input" placeholder="Kho" type="number" value={v.stockQuantity} onChange={e => setVariant(i, 'stockQuantity', e.target.value)} />
                <button className="btn-del-variant" onClick={() => delVariant(i)}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>💾 Lưu Sản Phẩm</button>
        </div>
      </div>
    </div>
  );
}