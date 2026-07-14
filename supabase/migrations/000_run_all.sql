-- ============================================
-- 一键运行：建表 + 取餐点 + 优惠 + 菜单
-- 复制全部内容粘贴到 Supabase SQL Editor 运行
-- ============================================

-- 1. 建表

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  preferred_language TEXT DEFAULT 'zh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  image_url TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discount_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_people INT NOT NULL,
  discount_percent INT NOT NULL,
  label_zh TEXT,
  label_en TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_location_id UUID REFERENCES pickup_locations(id),
  status TEXT DEFAULT 'open',
  closes_at TIMESTAMPTZ NOT NULL,
  min_people INT DEFAULT 3,
  current_people INT DEFAULT 0,
  applied_discount_percent INT DEFAULT 0,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID REFERENCES group_orders(id),
  user_id UUID REFERENCES users(id),
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  pickup_location_id UUID REFERENCES pickup_locations(id),
  order_type TEXT DEFAULT 'group',
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10,2),
  discount_percent INT DEFAULT 0,
  total_amount DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 权限设置

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "public_read_locations" ON pickup_locations FOR SELECT USING (true);
CREATE POLICY "public_read_groups" ON group_orders FOR SELECT USING (true);
CREATE POLICY "public_read_tiers" ON discount_tiers FOR SELECT USING (true);
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_own_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- 3. 取餐地点（改成你实际的取餐点）

INSERT INTO pickup_locations (name_zh, name_en, address, sort_order) VALUES
  ('取餐点 A', 'Pickup Location A', 'TBD - Seattle, WA', 1),
  ('取餐点 B', 'Pickup Location B', 'TBD - Bellevue, WA', 2);

-- 4. 团购优惠阶梯

INSERT INTO discount_tiers (min_people, discount_percent, label_zh, label_en, sort_order) VALUES
  (3,  5,  '3人团 95折', '3 people: 5% off',  1),
  (5,  10, '5人团 九折', '5 people: 10% off', 2),
  (10, 20, '10人团 八折', '10 people: 20% off', 3);

-- 5. 外卖团购菜单

INSERT INTO menu_items (name_zh, name_en, description_zh, description_en, base_price, category, sort_order) VALUES
  (
    '姜葱鸡',
    'Ginger Scallion Chicken',
    '专属团购价，鲜嫩鸡肉配姜葱香料，清爽不腻',
    'Exclusive group price — tender chicken with fresh ginger and scallions',
    6.99, '外卖团购', 10
  ),
  (
    '樟茶鸭',
    'Camphor Tea Smoked Duck',
    '四川传统熏鸭，茶香樟木味浓郁，皮酥肉嫩',
    'Sichuan-style smoked duck with camphor and tea, crispy skin and juicy meat',
    25.99, '外卖团购', 11
  ),
  (
    '泡椒腰花 / 火爆腰花',
    'Pickled Pepper Kidneys / Spicy Stir-Fried Kidneys',
    '泡椒版酸辣开胃，火爆版麻辣鲜香，腰花脆嫩爽口',
    'Choice of pickled pepper (tangy & spicy) or dry-fried (numbing & bold) — crisp, tender pork kidneys',
    21.99, '外卖团购', 12
  ),
  (
    '湘炒肥牛',
    'Hunan-Style Stir-Fried Fatty Beef',
    '湖南风味，肥牛与辣椒大火爆炒，鲜辣下饭',
    'Hunan-style fatty beef stir-fried with chilies and aromatics, bold and fiery',
    21.99, '外卖团购', 13
  ),
  (
    '梅菜扣肉',
    'Braised Pork with Preserved Mustard',
    '五花肉与梅干菜慢炖，肥而不腻，咸香入味',
    'Slow-braised pork belly layered with preserved mustard greens — rich, savory, melt-in-your-mouth',
    21.99, '外卖团购', 14
  ),
  (
    '红烧肉',
    'Red-Braised Pork Belly',
    '经典红烧，入口即化，甜咸平衡，下饭首选',
    'Classic Hong Shao Rou — slow-braised to silky perfection with a sweet-savory glaze',
    19.99, '外卖团购', 15
  ),
  (
    '酸豆角鸡胗 / 肉沫',
    'Pickled Long Beans with Chicken Gizzard or Ground Pork',
    '酸脆豆角配鸡胗或肉沫，酸爽开胃，口感丰富',
    'Tangy pickled long beans stir-fried with your choice of chicken gizzard or ground pork',
    18.99, '外卖团购', 16
  ),
  (
    '腊肉 / 蕨菜、萝卜干、香干',
    'Cured Pork with Fern, Dried Radish or Smoked Tofu',
    '湘式腊肉配蕨菜、萝卜干或香干，烟熏风味浓郁',
    'Smoky cured pork stir-fried with your choice of fern shoots, dried radish, or smoked tofu',
    21.99, '外卖团购', 17
  ),
  (
    '铁板鱿鱼',
    'Sizzling Iron Plate Squid',
    '鱿鱼在铁板上滋滋作响，鲜嫩多汁，香辣过瘾',
    'Fresh squid served sizzling on a hot iron plate, tender and boldly seasoned',
    18.99, '外卖团购', 18
  ),
  (
    '酸萝卜炒鸡',
    'Pickled Radish Stir-Fried Chicken',
    '酸萝卜提鲜解腻，搭配嫩鸡，酸辣爽口',
    'Tender chicken stir-fried with tangy pickled radish — bright, spicy, and refreshing',
    22.99, '外卖团购', 19
  ),
  (
    '红烧玉汁豆腐',
    'Braised Tofu in Rich Sauce',
    '嫩豆腐吸满浓郁酱汁，口感滑嫩，素食友好',
    'Silken tofu slow-braised in a deep, savory sauce — smooth and satisfying',
    21.99, '外卖团购', 20
  ),
  (
    '手撕包菜',
    'Hand-Torn Cabbage',
    '大火爆炒，清脆入味，家常下饭菜',
    'Cabbage hand-torn and wok-tossed over high heat with garlic and chilies',
    14.99, '外卖团购', 21
  ),
  (
    '青椒香干',
    'Green Pepper with Smoked Dried Tofu',
    '青椒与香干同炒，清香微辣，家常经典',
    'Classic stir-fry of green peppers and smoked dried tofu — simple, fragrant, and lightly spicy',
    18.99, '外卖团购', 22
  ),
  (
    '❄️ 冷冻面食团购优惠',
    '❄️ Frozen Dumplings Group Discount',
    '满 $60 即可以团价享受冷冻面食 60% 优惠！请在备注中注明',
    'Spend $60+ on your group order and get frozen dumplings / noodles at 60% off! Add a note at checkout.',
    0.00, '外卖团购', 99
  );
