const router = require('express').Router();
const { CartItem, Product, Category, Shop } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Product,
        as: 'product',
        include: [
          { model: Category, as: 'category' },
          { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        ],
      }],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id обязателен' });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const existing = await CartItem.findOne({ where: { user_id: req.user.id, product_id } });
    if (existing) {
      await existing.update({ quantity: existing.quantity + parseInt(quantity) });
      return res.json(existing);
    }
    const item = await CartItem.create({ user_id: req.user.id, product_id, quantity: parseInt(quantity) });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all — must be before /:id
router.delete('/', auth, async (req, res) => {
  try {
    await CartItem.destroy({ where: { user_id: req.user.id } });
    res.json({ message: 'Корзина очищена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Количество должно быть не менее 1' });

    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Элемент не найден' });

    await item.update({ quantity: parseInt(quantity) });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Элемент не найден' });
    await item.destroy();
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
