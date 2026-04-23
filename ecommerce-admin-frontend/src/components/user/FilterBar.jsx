import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './FilterBar.css';

export default function FilterBar({ onSearch, onPriceChange, onBrandChange, onReset, brands = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // Đồng bộ searchTerm với URL query nếu đang ở trang search
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = searchParams.get('q') || '';
      setSearchTerm(q);
    }
  }, [location.pathname, searchParams]);

  const handleReset = () => {
    setMin('');
    setMax('');
    setSearchTerm('');
    onReset();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const value = e.target.value.trim();
      if (value) {
        navigate(`/search?q=${encodeURIComponent(value)}`);
      } else {
        navigate('/'); // Nếu rỗng thì về trang chủ
      }
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-container">
        
        {/* Tìm kiếm */}
        <div className="filter-search">
          <input 
            type="text" 
            placeholder="Tìm theo sản phẩm hoặc thương hiệu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Lọc Giá */}
        <div className="filter-group">
          <input 
            type="number" 
            placeholder="Giá từ..." 
            value={min} 
            onChange={e => { setMin(e.target.value); onPriceChange(e.target.value, max); }} 
          />
          <span className="filter-divider">—</span>
          <input 
            type="number" 
            placeholder="đến..." 
            value={max} 
            onChange={e => { setMax(e.target.value); onPriceChange(min, e.target.value); }} 
          />
        </div>

        {/* Lọc Thương Hiệu */}
        <div className="filter-group">
          <select onChange={(e) => onBrandChange(e.target.value)} defaultValue="">
            <option value="">Tất cả thương hiệu</option>
            {Array.isArray(brands) && brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Nut Lam moi */}
        <button className="btn-reset" onClick={handleReset}>
          Làm mới
        </button>

      </div>
    </div>
  );
}
