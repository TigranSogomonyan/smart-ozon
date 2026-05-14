const router = require('express').Router();
const { Shop, Product, Category, User } = require('../models');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

router.post('/', auth, requireRole('seller', 'admin'), upload.single('logo'), async (req, res) => {
  try {
    const existing = await Shop.findOne({ where: { user_id: req.user.id } });
    if (existing) return res.status(400).json({ error: 'У вас уже есть магазин' });

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Название магазина обязательно' });

    const logo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const shop = await Shop.create({ user_id: req.user.id, name, description, logo_url });
    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'products', include: [{ model: Category, as: 'category' }] },
        { model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name'] },
      ],
    });
    if (!shop) return res.status(404).json({ error: 'Магазин не найден' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Магазин не найден' });
    if (shop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    const { name, description } = req.body;
    const updates = { name, description };
    if (req.file) updates.logo_url = `/uploads/${req.file.filename}`;
    await shop.update(updates);
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
