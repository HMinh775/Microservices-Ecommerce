import { useState } from 'react';
import axios from 'axios';
import './ProductModal.css';

const CATEGORIES = ['Áo', 'Quần', 'Váy', 'Phụ kiện', 'Giày dép', 'Túi xách', 'Đồ thể thao'];
const emptyVariant = () => ({ size: '', color: '', price: '', stockQuantity: '' });

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product || { productName: '', brand: '', material: '', category: '', imageUrl: '', variants: [] }
  );
  const [variants, setVariants] = useState(product?.variants || []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!product?.id;

  const addVariant    = ()        => setVariants(v => [...v, emptyVariant()]);
  const delVariant    = (i)       => setVariants(v => v.filter((_, idx) => idx !== i));
  const setVariant    = (i, k, v) => setVariants(vs => vs.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSubmit = async () => {
    const formData = new FormData();

    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }

    const productData = {
      productName:  form.productName,
      brand:        form.brand,
      material:     form.material,
      category:     form.category,
      description:  form.description || '',
      variants: variants.map(v => ({
        ...v,
        price:         parseFloat(v.price)         || 0,
        stockQuantity: parseInt(v.stockQuantity)   || 0,
      })),
    };

    formData.append('product', JSON.stringify(productData));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      await axios.post('http://localhost:8810/products', formData, config);
      onSave('Thêm sản phẩm thành công!');
    } catch (error) {
      console.error('Lỗi:', error.response?.data);
      onSave(null);
    }
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
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) set('imageFile', file);
              }}
            />
            {form.imageFile && (
              <div className="img-preview-container">
                <img
                  src={URL.createObjectURL(form.imageFile)}
                  alt="Preview"
                  className="img-preview"
                />
              </div>
            )}
          </div>

          {/* Variant Editor */}
          <div className="variant-editor">
            <div className="variant-editor-title">
              <span>🏷️ Biến thể (Size / Màu / Giá / Kho)</span>
              <button className="btn-add-variant btn-add-variant-small" onClick={addVariant}>
                + Thêm
              </button>
            </div>

            {variants.length === 0 && (
              <p className="variants-empty-msg">
                Chưa có biến thể nào.
              </p>
            )}

            {variants.map((v, i) => (
              <div className="variant-row" key={i}>
                <input className="variant-input" placeholder="Size"   value={v.size}          onChange={e => setVariant(i, 'size',          e.target.value)} />
                <input className="variant-input" placeholder="Màu"    value={v.color}         onChange={e => setVariant(i, 'color',         e.target.value)} />
                <input className="variant-input" placeholder="Giá ($)" type="number" value={v.price}  onChange={e => setVariant(i, 'price',         e.target.value)} />
                <input className="variant-input" placeholder="Kho"    type="number" value={v.stockQuantity} onChange={e => setVariant(i, 'stockQuantity', e.target.value)} />
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