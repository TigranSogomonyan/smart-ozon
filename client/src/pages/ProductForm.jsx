import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', weight: '', category_id: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${accessToken}` };

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data));
    if (isEdit) {
      axios.get(`/api/products/${id}`, { headers, withCredentials: true }).then(r => {
        const p = r.data;
        setForm({ name: p.name || '', description: p.description || '', price: p.price || '', weight: p.weight || '', category_id: p.category_id || '' });
        if (p.photo_url) setPhotoPreview(p.photo_url);
      });
    }
  }, [id]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      setError('Заполните обязательные поля: название, цена, категория');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photoFile) fd.append('photo', photoFile);

      const config = { headers: { ...headers, 'Content-Type': 'multipart/form-data' }, withCredentials: true };
      if (isEdit) {
        await axios.put(`/api/products/${id}`, fd, config);
      } else {
        await axios.post('/api/products', fd, config);
      }
      navigate('/my-shop');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
    setLoading(false);
  }

  return (
    <div className="page-fade max-w-2xl mx-auto px-6 py-10">
      <Link to="/my-shop" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Назад в магазин
      </Link>
      <h1 className="font-heading text-3xl font-bold text-white mb-8">
        {isEdit ? 'Редактировать товар' : 'Новый товар'}
      </h1>

      <div className="bg-navy-700 rounded-2xl p-6 border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Название *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Наименование товара" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Описание</label>
            <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-dark resize-none" placeholder="Подробное описание товара..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Цена (₽) *</label>
              <input type="number" required min="1" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-dark" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Вес (граммы)</label>
              <input type="number" min="1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-dark" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Категория *</label>
            <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-dark">
              <option value="">Выберите категорию</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Фото товара</label>
            {photoPreview && (
              <div className="mb-3 w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="input-dark text-sm" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary py-3 px-8">
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{isEdit ? 'Сохранение...' : 'Создание...'}</span>
              ) : (isEdit ? 'Сохранить' : 'Создать товар')}
            </button>
            <Link to="/my-shop" className="btn-outline py-3 px-6">Отмена</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
