-- Pickup locations
INSERT INTO pickup_locations (name_zh, name_en, address, sort_order) VALUES
  ('西雅图大学附近', 'Near Seattle University', '1234 E Cherry St, Seattle, WA 98122', 1),
  ('贝尔维尤广场', 'Bellevue Square Area', '575 Bellevue Square, Bellevue, WA 98004', 2),
  ('联邦快递停车场', 'Federal Way Parking', '31600 Pacific Hwy S, Federal Way, WA 98003', 3);

-- Discount tiers
INSERT INTO discount_tiers (min_people, discount_percent, label_zh, label_en, sort_order) VALUES
  (3,  5,  '3人团 95折', '3 people: 5% off',  1),
  (5,  10, '5人团 九折', '5 people: 10% off', 2),
  (10, 20, '10人团 八折', '10 people: 20% off', 3);

-- Sample menu items
INSERT INTO menu_items (name_zh, name_en, description_zh, description_en, base_price, category, sort_order) VALUES
  ('红烧肉', 'Braised Pork Belly', '入口即化的东坡红烧肉', 'Slow-braised pork belly, melt-in-your-mouth tender', 18.99, '主菜', 1),
  ('宫保鸡丁', 'Kung Pao Chicken', '香辣下饭，经典川菜', 'Spicy Sichuan classic with peanuts and chilies', 16.99, '主菜', 2),
  ('蒸饺（10个）', 'Steamed Dumplings (10pc)', '新鲜手工皮，猪肉白菜馅', 'Fresh handmade wrappers, pork & cabbage filling', 12.99, '小吃', 3),
  ('锅贴（8个）', 'Pan-Fried Potstickers (8pc)', '底部金黄酥脆', 'Crispy golden bottom, juicy filling', 13.99, '小吃', 4),
  ('炒饭', 'Fried Rice', '蛋炒饭，香喷喷', 'Classic egg fried rice', 11.99, '主食', 5),
  ('珍珠奶茶', 'Bubble Tea', '香浓奶茶配大珍珠', 'Rich milk tea with tapioca pearls', 6.99, '饮料', 6),
  ('豆浆', 'Soy Milk', '每日新鲜现磨', 'Freshly ground daily', 3.99, '饮料', 7);
