const router = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');
const { Product, Shop, Category, OrderItem } = require('../models');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

router.get('/top', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: {
        include: [[fn('COUNT', col('OrderItems.id')), 'order_count']],
      },
      include: [
        { model: OrderItem, attributes: [] },
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo_url'] },
        { model: Category, as: 'category' },
      ],
      group: ['Product.id', 'shop.id', 'category.id'],
      order: [[literal('order_count'), 'DESC']],
      limit: 10,
      subQuery: false,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, category_id, sort, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category_id) where.category_id = category_id;

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo_url'] },
        { model: Category, as: 'category' },
      ],
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Shop, as: 'shop' },
        { model: Category, as: 'category' },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('seller', 'admin'), upload.single('photo'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { user_id: req.user.id } });
    if (!shop) return res.status(400).json({ error: 'Сначала создайте магазин' });

    const { name, description, price, weight, category_id } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Название, цена и категория обязательны' });
    }
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({
      shop_id: shop.id, name, description, price, weight, category_id, photo_url,
    });
    const full = await Product.findByPk(product.id, {
      include: [{ model: Shop, as: 'shop' }, { model: Category, as: 'category' }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('seller', 'admin'), upload.single('photo'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Shop, as: 'shop' }],
    });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    if (req.user.role !== 'admin' && product.shop.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    const { name, description, price, weight, category_id } = req.body;
    const updates = { name, description, price, weight, category_id };
    if (req.file) updates.photo_url = `/uploads/${req.file.filename}`;
    await product.update(updates);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Shop, as: 'shop' }],
    });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    if (req.user.role !== 'admin' && product.shop.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    await product.destroy();
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
