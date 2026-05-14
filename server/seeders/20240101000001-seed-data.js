'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const adminId = uuidv4();
const seller1Id = uuidv4();
const seller2Id = uuidv4();
const shop1Id = uuidv4();
const shop2Id = uuidv4();
const cat1Id = uuidv4();
const cat2Id = uuidv4();
const cat3Id = uuidv4();
const cat4Id = uuidv4();
const cat5Id = uuidv4();

module.exports = {
  async up(queryInterface) {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const sellerHash = await bcrypt.hash('seller123', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@smart-ozon.ru',
        password_hash: adminHash,
        role: 'admin',
        seller_request: 'none',
        gender: 'male',
        birth_date: '1990-01-01',
        created_at: new Date(),
      },
      {
        id: seller1Id,
        first_name: 'Александр',
        last_name: 'Петров',
        email: 'seller1@smart-ozon.ru',
        password_hash: sellerHash,
        role: 'seller',
        seller_request: 'approved',
        gender: 'male',
        birth_date: '1988-05-15',
        created_at: new Date(),
      },
      {
        id: seller2Id,
        first_name: 'Мария',
        last_name: 'Иванова',
        email: 'seller2@smart-ozon.ru',
        password_hash: sellerHash,
        role: 'seller',
        seller_request: 'approved',
        gender: 'female',
        birth_date: '1992-09-22',
        created_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('categories', [
      { id: cat1Id, name: 'Электроника', color: '#6C63FF' },
      { id: cat2Id, name: 'Одежда', color: '#FF6B35' },
      { id: cat3Id, name: 'Дом и сад', color: '#4CAF50' },
      { id: cat4Id, name: 'Спорт', color: '#FF4081' },
      { id: cat5Id, name: 'Красота', color: '#9C27B0' },
    ]);

    await queryInterface.bulkInsert('shops', [
      {
        id: shop1Id,
        user_id: seller1Id,
        name: 'ТехноМаркет',
        description: 'Лучшая электроника и гаджеты по доступным ценам. Гарантия качества на все товары.',
        logo_url: null,
      },
      {
        id: shop2Id,
        user_id: seller2Id,
        name: 'МодаСтиль',
        description: 'Современная одежда, аксессуары и товары для красоты. Следуем последним трендам.',
        logo_url: null,
      },
    ]);

    const products1 = [
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Смартфон Samsung Galaxy S24',
        description: 'Флагманский смартфон с AMOLED дисплеем 6.2", процессором Exynos 2400, камерой 50 МП. Поддержка 5G, быстрая зарядка 25W.',
        price: 79990.00, weight: 167, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Ноутбук Lenovo IdeaPad 5',
        description: 'Мощный ноутбук на AMD Ryzen 5 7530U, 16GB RAM, SSD 512GB. Дисплей 15.6" IPS Full HD. Отличный выбор для работы и учёбы.',
        price: 54990.00, weight: 1750, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Беспроводные наушники Sony WH-1000XM5',
        description: 'Премиальные наушники с активным шумоподавлением, 30 часов автономной работы, кодек LDAC для Hi-Res Audio.',
        price: 29990.00, weight: 250, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Планшет iPad 10-го поколения',
        description: '10.9" Liquid Retina дисплей, чип A14 Bionic, 64GB. Идеален для учёбы, творчества и развлечений.',
        price: 44990.00, weight: 477, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Умные часы Amazfit GTR 4',
        description: 'Спортивные смарт-часы с GPS, мониторингом здоровья, 150+ режимами тренировок. Автономность до 14 дней.',
        price: 14990.00, weight: 34, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat3Id,
        name: 'Робот-пылесос Xiaomi Robot Vacuum S10',
        description: 'Умный робот-пылесос с лазерной навигацией, мощностью всасывания 4000 Па, функцией влажной уборки. Площадь до 250м².',
        price: 34990.00, weight: 3800, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Портативная колонка JBL Charge 5',
        description: 'Водонепроницаемая Bluetooth колонка IP67, 20 часов работы, мощность 40Вт. Встроенный повербанк для зарядки устройств.',
        price: 12990.00, weight: 960, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop1Id, category_id: cat1Id,
        name: 'Веб-камера Logitech C920 HD Pro',
        description: 'Профессиональная веб-камера Full HD 1080p/30fps, автофокус, стереозвук. Идеальна для видеоконференций и стриминга.',
        price: 8990.00, weight: 162, created_at: new Date(),
      },
    ];

    const products2 = [
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat2Id,
        name: 'Кроссовки Nike Air Max 270',
        description: 'Культовые кроссовки с крупнейшей воздушной подушкой Air. Максимальный комфорт для повседневной носки. Размеры 36-47.',
        price: 12990.00, weight: 400, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat2Id,
        name: 'Джинсы Levi\'s 501 Original',
        description: 'Классические прямые джинсы из 100% хлопка. Легендарный крой 501, который не выходит из моды уже более 140 лет.',
        price: 7990.00, weight: 650, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat5Id,
        name: 'Сыворотка Ordinary Niacinamide 10%',
        description: 'Концентрированная сыворотка с 10% ниацинамида и 1% цинка. Сужает поры, выравнивает тон кожи, контролирует жирность.',
        price: 1290.00, weight: 30, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat4Id,
        name: 'Йога-мат Manduka PRO',
        description: 'Профессиональный коврик для йоги 6мм, 180х61см. Материал ECO-PU, пожизненная гарантия. Не скользит даже при сильном потоотделении.',
        price: 8990.00, weight: 2200, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat2Id,
        name: 'Пальто женское H&M Premium',
        description: 'Элегантное пальто из смеси шерсти и полиэстера. Двубортное, с поясом. Цвет: кэмел. Размеры XS-XL.',
        price: 9990.00, weight: 1200, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat5Id,
        name: 'Парфюм Chanel Chance Eau Tendre',
        description: 'Легкий флоральный аромат с нотами грейпфрута, жасмина и белого мускуса. Объём 100мл. Оригинальный флакон.',
        price: 18990.00, weight: 250, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat4Id,
        name: 'Гантели разборные 20кг',
        description: 'Набор разборных гантелей от 2 до 20кг. Чугунные диски, хромированный гриф. Хранение на подставке в комплекте.',
        price: 5990.00, weight: 20000, created_at: new Date(),
      },
      {
        id: uuidv4(), shop_id: shop2Id, category_id: cat3Id,
        name: 'Диффузор аромат Muji',
        description: 'Ультразвуковой аромадиффузор 400мл. Бесшумная работа, таймер 1/3/6 часов, ночник с регулировкой цвета. Комплект с 3 маслами.',
        price: 3490.00, weight: 450, created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('products', [...products1, ...products2]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('shops', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
