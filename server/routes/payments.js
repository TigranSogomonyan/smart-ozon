const router = require('express').Router();
const { Order, OrderItem, Product } = require('../models');
const auth = require('../middleware/auth');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_placeholder') return null;
  return require('stripe')(key);
}

router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findOne({
      where: { id: order_id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const stripe = getStripe();
    if (!stripe) {
      return res.json({ url: `${process.env.CLIENT_URL}/orders/${order.id}?success=1` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/orders/${order.id}?success=1`,
      cancel_url: `${process.env.CLIENT_URL}/orders/${order.id}?cancelled=1`,
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'rub',
          product_data: { name: item.product.name },
          unit_amount: Math.round(parseFloat(item.price_at_purchase) * 100),
        },
        quantity: item.quantity,
      })),
    });

    await order.update({ stripe_payment_id: session.id });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Raw body middleware applied in server.js before this route
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.json({ received: true });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await Order.update({ status: 'paid' }, { where: { stripe_payment_id: session.id } });
  }

  res.json({ received: true });
});

router.get('/success', (req, res) => {
  res.json({ message: 'Оплата прошла успешно' });
});

router.get('/cancel', (req, res) => {
  res.json({ message: 'Оплата отменена' });
});

module.exports = router;
