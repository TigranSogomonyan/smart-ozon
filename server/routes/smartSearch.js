const router = require('express').Router();
const { Product, Category, Shop } = require('../models');

function parsePriceLimits(query) {
  const q = query.toLowerCase();
  let min = null, max = null;
  const maxMatch = q.match(/(?:до|не дороже|дешевле|максимум|макс\.?)\s*(\d[\d\s]*\d|\d+)/);
  if (maxMatch) max = parseInt(maxMatch[1].replace(/\s/g, ''));
  const minMatch = q.match(/(?:от|не дешевле|дороже|минимум|мин\.?)\s*(\d[\d\s]*\d|\d+)/);
  if (minMatch) min = parseInt(minMatch[1].replace(/\s/g, ''));
  return { min, max };
}

router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'Запрос не может быть пустым' });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'MISTRAL_API_KEY не настроен' });

  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'description', 'price'],
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: Shop, as: 'shop', attributes: ['name'] },
      ],
      limit: 150,
    });

    if (products.length === 0) return res.json([]);

    const productList = products.map((p, i) =>
      `${i + 1}. [${p.id}] ${p.name} | ${p.price}₽ | ${p.category?.name || '—'} | ${(p.description || '').slice(0, 120)}`
    ).join('\n');

    const prompt = `Ты помощник маркетплейса SmartOzon. Пользователь ищет товары по запросу: "${query.trim()}"

Список товаров (формат: номер. [ID] Название | Цена₽ | Категория | Описание):
${productList}

Выбери товары, которые подходят под запрос пользователя. Учитывай:
- смысл запроса и назначение товара
- бюджет если указан (фильтруй по цене строго)
- категорию и описание

Верни ТОЛЬКО JSON-массив с ID подходящих товаров без каких-либо пояснений и без markdown. Пример: ["id1","id2","id3"]
Если ничего не подходит — верни [].`;

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!mistralRes.ok) {
      const errText = await mistralRes.text();
      console.error('Mistral error:', errText);
      return res.status(502).json({ error: `Mistral API: ${errText}` });
    }

    const mistralData = await mistralRes.json();
    const rawText = mistralData.choices?.[0]?.message?.content || '[]';

    const match = rawText.match(/\[[\s\S]*\]/);
    let ids = [];
    if (match) {
      try { ids = JSON.parse(match[0]); } catch {}
    }

    const productMap = new Map(products.map(p => [p.id, p]));
    const result = ids.map(id => productMap.get(id)).filter(Boolean);

    if (result.length === 0) return res.json([]);

    const full = await Product.findAll({
      where: { id: ids.filter(id => productMap.has(id)) },
      include: [
        { model: Category, as: 'category' },
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo_url'] },
      ],
    });

    const fullMap = new Map(full.map(p => [p.id, p]));
    let ordered = ids.map(id => fullMap.get(id)).filter(Boolean);

    const { min, max } = parsePriceLimits(query.trim());
    if (min !== null) ordered = ordered.filter(p => Number(p.price) >= min);
    if (max !== null) ordered = ordered.filter(p => Number(p.price) <= max);

    res.json(ordered);
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
