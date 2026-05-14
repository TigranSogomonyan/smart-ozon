const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signAccess(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
  );
}

function signRefresh(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, birth_date, gender } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email уже зарегистрирован' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ first_name, last_name, email, password_hash, birth_date, gender });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(201).json({
      accessToken,
      user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, seller_request: user.seller_request },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Введите email и пароль' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({
      accessToken,
      user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, seller_request: user.seller_request },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Нет refresh токена' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Недействительный refresh токен' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Выход выполнен' });
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) return res.status(400).json({ error: 'Заполните все поля' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });

    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Неверный текущий пароль' });

    user.password_hash = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
