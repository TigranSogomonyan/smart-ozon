import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const sellerRequestInfo = {
  none: null,
  pending: { label: 'Заявка на рассмотрении', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: '⏳' },
  approved: { label: 'Заявка одобрена', cls: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '✅' },
  rejected: { label: 'Заявка отклонена', cls: 'bg-red-500/15 text-red-400 border-red-500/30', icon: '❌' },
};

export default function Account() {
  const { user, accessToken, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ first_name: '', last_name: '', birth_date: '', gender: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [sellerReq, setSellerReq] = useState(user?.seller_request || 'none');

  const headers = { Authorization: `Bearer ${accessToken}` };

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
      });
      setSellerReq(user.seller_request);
    }
  }, [user]);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    try {
      const { data } = await axios.put('/api/users/me', profile, { headers, withCredentials: true });
      updateUser(data);
      setProfileMsg('Профиль сохранён!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Ошибка сохранения');
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pwForm.new_password !== pwForm.confirm) { setPwErr('Пароли не совпадают'); return; }
    if (pwForm.new_password.length < 6) { setPwErr('Минимум 6 символов'); return; }
    try {
      await axios.post('/api/auth/change-password', { old_password: pwForm.old_password, new_password: pwForm.new_password }, { headers, withCredentials: true });
      setPwMsg('Пароль изменён!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Ошибка смены пароля');
    }
  }

  async function requestSeller() {
    setRequesting(true);
    try {
      await axios.post('/api/users/me/request-seller', {}, { headers, withCredentials: true });
      setSellerReq('pending');
      updateUser({ seller_request: 'pending' });
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
    setRequesting(false);
  }

  const srInfo = sellerRequestInfo[sellerReq];

  return (
    <div className="page-fade max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-white mb-8">Личный кабинет</h1>

      {/* Profile */}
      <div className="bg-navy-700 rounded-2xl p-6 border border-white/5 mb-6">
        <h2 className="font-heading text-lg font-bold text-white mb-5">Личные данные</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Имя</label>
              <input type="text" value={profile.first_name} onChange={e => setProfile(f => ({ ...f, first_name: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Фамилия</label>
              <input type="text" value={profile.last_name} onChange={e => setProfile(f => ({ ...f, last_name: e.target.value }))} className="input-dark" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Дата рождения</label>
              <input type="date" value={profile.birth_date} onChange={e => setProfile(f => ({ ...f, birth_date: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Пол</label>
              <select value={profile.gender} onChange={e => setProfile(f => ({ ...f, gender: e.target.value }))} className="input-dark">
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-dark opacity-50 cursor-not-allowed" />
          </div>
          {profileErr && <p className="text-red-400 text-sm">{profileErr}</p>}
          {profileMsg && <p className="text-green-400 text-sm">{profileMsg}</p>}
          <button type="submit" className="btn-primary py-2.5">Сохранить</button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-navy-700 rounded-2xl p-6 border border-white/5 mb-6">
        <h2 className="font-heading text-lg font-bold text-white mb-5">Смена пароля</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Текущий пароль</label>
            <input type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} className="input-dark" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Новый пароль</label>
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} className="input-dark" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Подтвердите пароль</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="input-dark" placeholder="••••••••" />
            </div>
          </div>
          {pwErr && <p className="text-red-400 text-sm">{pwErr}</p>}
          {pwMsg && <p className="text-green-400 text-sm">{pwMsg}</p>}
          <button type="submit" className="btn-primary py-2.5">Изменить пароль</button>
        </form>
      </div>

      {/* Seller request */}
      {user?.role === 'user' && (
        <div className="bg-navy-700 rounded-2xl p-6 border border-white/5">
          <h2 className="font-heading text-lg font-bold text-white mb-3">Стать продавцом</h2>
          <p className="text-sm text-gray-400 mb-4">Подайте заявку, чтобы открыть свой магазин и начать продавать товары на платформе.</p>
          {srInfo ? (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${srInfo.cls}`}>
              <span>{srInfo.icon}</span>
              {srInfo.label}
            </div>
          ) : (
            <button onClick={requestSeller} disabled={requesting} className="btn-primary py-2.5">
              {requesting ? 'Отправляем...' : 'Стать продавцом'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
