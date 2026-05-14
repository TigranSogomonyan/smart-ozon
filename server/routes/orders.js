const router = require('express').Router();
const { Order, OrderItem, CartItem, Product, Shop, Category, User } = require('../models');
const auth = require('../middleware/auth');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_placeholder') return null;
  return require('stripe')(key);
}

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'product' }],
    });
    if (!cartItems.length) return res.status(400).json({ error: 'Корзина пуста' });

    const total_price = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0
    );

    const order = await Order.create({
      user_id: req.user.id,
      total_price: total_price.toFixed(2),
      status: 'pending',
    });

    await OrderItem.bulkCreate(cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product.price,
    })));

    await CartItem.destroy({ where: { user_id: req.user.id } });

    let checkoutUrl = `${process.env.CLIENT_URL}/orders/${order.id}?success=1`;

    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: `${process.env.CLIENT_URL}/orders/${order.id}?success=1`,
          cancel_url: `${process.env.CLIENT_URL}/orders/${order.id}?cancelled=1`,
          line_items: cartItems.map(item => ({
            price_data: {
              currency: 'rub',
              product_data: { name: item.product.name },
              unit_amount: Math.round(parseFloat(item.product.price) * 100),
            },
            quantity: item.quantity,
          })),
        });
        await order.update({ stripe_payment_id: session.id });
        checkoutUrl = session.url;
      } catch (stripeErr) {
        console.error('Stripe error:', stripeErr.message);
      }
    }

    res.status(201).json({ order, checkoutUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
        },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Called from success_url redirect — verify payment with Stripe and mark as paid
router.post('/:id/verify-payment', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.status === 'paid') return res.json(order);

    const stripe = getStripe();
    if (stripe && order.stripe_payment_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_payment_id);
      if (session.payment_status === 'paid') {
        await order.update({ status: 'paid' });
      }
    } else if (!stripe) {
      // demo mode — treat as paid
      await order.update({ status: 'paid' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Нельзя отменить этот заказ' });
    await order.update({ status: 'cancelled' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
