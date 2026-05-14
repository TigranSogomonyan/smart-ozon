const router = require('express').Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { first_name, last_name, birth_date, gender } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    await user.update({ first_name, last_name, birth_date, gender });
    res.json({ id: user.id, first_name: user.first_name, last_name: user.last_name, birth_date: user.birth_date, gender: user.gender, email: user.email, role: user.role, seller_request: user.seller_request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/me/request-seller', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.seller_request !== 'none') {
      return res.status(400).json({ error: 'Заявка уже была подана' });
    }
    await user.update({ seller_request: 'pending' });
    res.json({ message: 'Заявка отправлена', seller_request: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
