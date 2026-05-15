const router = require('express').Router();
const { User, Shop, Order, OrderItem, Product, Category } = require('../models');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminGuard = [auth, requireRole('admin')];

router.get('/users', ...adminGuard, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', ...adminGuard, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.update({ role });
    res.json({ id: user.id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', ...adminGuard, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.destroy();
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seller-requests', ...adminGuard, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { seller_request: 'pending' },
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/seller-requests/:id/approve', ...adminGuard, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    await user.update({ role: 'seller', seller_request: 'approved' });

    const existingShop = await Shop.findOne({ where: { user_id: user.id } });
    if (!existingShop) {
      await Shop.create({
        user_id: user.id,
        name: `Магазин ${user.first_name}`,
        description: '',
      });
    }
    res.json({ message: 'Заявка одобрена', user: { id: user.id, role: user.role, seller_request: user.seller_request } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/seller-requests/:id/reject', ...adminGuard, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.update({ seller_request: 'rejected' });
    res.json({ message: 'Заявка отклонена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shops', ...adminGuard, async (req, res) => {
  try {
    const shops = await Shop.findAll({
      order: [['name', 'ASC']],
      include: [{ model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/shops/:id', ...adminGuard, async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Магазин не найден' });
    await Product.destroy({ where: { shop_id: shop.id } });
    await shop.destroy();
    res.json({ message: 'Магазин и его товары удалены' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', ...adminGuard, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', ...adminGuard, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    await order.update({ status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', ...adminGuard, async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: Category, as: 'category' },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
