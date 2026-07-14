-- 外卖团购菜单 / Takeout Group Order Menu
-- Run this in Supabase SQL Editor

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
    'Choice of pickled pepper (tangy & spicy) or dry-fried (numbing & bold) — both versions feature crisp, tender pork kidneys',
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
    'Braised Pork Belly with Preserved Mustard',
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
    'Cured Pork with Fern, Dried Radish & Smoked Tofu',
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
