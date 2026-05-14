import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm: '', birth_date: '', gender: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!form.first_name) e.first_name = 'Обязательное поле';
    if (!form.last_name) e.last_name = 'Обязательное поле';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Введите корректный email';
    if (!form.password || form.password.length < 6) e.password = 'Минимум 6 символов';
    if (form.password !== form.confirm) e.confirm = 'Пароли не совпадают';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');
    setLoading(true);
    try {
      await register({
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, password: form.password,
        birth_date: form.birth_date || undefined, gender: form.gender || undefined,
      });
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Ошибка регистрации');
    }
    setLoading(false);
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        type={type} value={form[name]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="input-dark"
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-3xl font-bold text-white">
            Smart<span className="text-coral-500">Ozon</span>
          </Link>
          <p className="text-gray-500 mt-2">Создайте аккаунт</p>
        </div>

        <div className="bg-navy-700 rounded-2xl p-8 border border-white/5 shadow-2xl">
          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {field('first_name', 'Имя', 'text', 'Александр')}
              {field('last_name', 'Фамилия', 'text', 'Петров')}
            </div>
            {field('email', 'Email', 'email', 'your@email.com')}
            <div className="grid grid-cols-2 gap-4">
              {field('password', 'Пароль', 'password', '••••••••')}
              {field('confirm', 'Подтвердите пароль', 'password', '••••••••')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Дата рождения</label>
                <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Пол</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-dark">
                  <option value="">Выберите</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                  <option value="other">Другой</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-coral-500 hover:text-coral-400 font-medium">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
