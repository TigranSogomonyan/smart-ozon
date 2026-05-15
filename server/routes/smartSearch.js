const router = require('express').Router();
const { Product, Category, Shop } = require('../models');

router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'Запрос не может быть пустым' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY не настроен' });

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

    // Build compact product list for the prompt
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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', err);
      return res.status(502).json({ error: 'Ошибка Gemini API' });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // Extract JSON array from response robustly
    const match = rawText.match(/\[[\s\S]*\]/);
    let ids = [];
    if (match) {
      try { ids = JSON.parse(match[0]); } catch {}
    }

    // Return full product data in the order Gemini suggested
    const productMap = new Map(products.map(p => [p.id, p]));
    const result = ids.map(id => productMap.get(id)).filter(Boolean);

    // If Gemini returned nothing useful, fall back to text search
    if (result.length === 0) return res.json([]);

    // Fetch full data (with shop/category) for matched IDs
    const full = await Product.findAll({
      where: { id: ids.filter(id => productMap.has(id)) },
      include: [
        { model: Category, as: 'category' },
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo_url'] },
      ],
    });

    // Preserve Gemini's ordering
    const fullMap = new Map(full.map(p => [p.id, p]));
    const ordered = ids.map(id => fullMap.get(id)).filter(Boolean);

    res.json(ordered);
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
