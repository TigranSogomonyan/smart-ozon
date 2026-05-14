const router = require('express').Router();
const { Product, Shop, Category, Order, OrderItem, User } = require('../models');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/products', auth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { user_id: req.user.id } });
    if (!shop) return res.json([]);

    const products = await Product.findAll({
      where: { shop_id: shop.id },
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', auth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { user_id: req.user.id } });
    if (!shop) return res.json([]);

    const shopProducts = await Product.findAll({ where: { shop_id: shop.id }, attributes: ['id'] });
    const productIds = shopProducts.map(p => p.id);

    const orderItems = await OrderItem.findAll({
      where: { product_id: productIds },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'price'] },
        {
          model: Order,
          include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
        },
      ],
    });

    const ordersMap = {};
    for (const item of orderItems) {
      const oid = item.order_id;
      if (!ordersMap[oid]) {
        ordersMap[oid] = {
          ...item.Order.toJSON(),
          sellerItems: [],
        };
      }
      ordersMap[oid].sellerItems.push(item.toJSON());
    }

    res.json(Object.values(ordersMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
