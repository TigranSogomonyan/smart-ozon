const router = require('express').Router();
const { Favorite, Product, Category, Shop } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
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
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id обязателен' });

    const exists = await Favorite.findOne({ where: { user_id: req.user.id, product_id } });
    if (exists) return res.status(409).json({ error: 'Уже в избранном' });

    const fav = await Favorite.create({ user_id: req.user.id, product_id });
    res.status(201).json(fav);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:product_id', auth, async (req, res) => {
  try {
    const fav = await Favorite.findOne({
      where: { user_id: req.user.id, product_id: req.params.product_id },
    });
    if (!fav) return res.status(404).json({ error: 'Не найдено в избранном' });
    await fav.destroy();
    res.json({ message: 'Удалено из избранного' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
