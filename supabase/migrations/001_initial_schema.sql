-- Users (optional registration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  preferred_language TEXT DEFAULT 'zh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
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

-- Discount tiers
CREATE TABLE IF NOT EXISTS discount_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_people INT NOT NULL,
  discount_percent INT NOT NULL,
  label_zh TEXT,
  label_en TEXT,
  sort_order INT DEFAULT 0
);

-- Pickup locations
CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

-- Group orders
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

-- Orders
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

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update current_people on group_orders when a new paid order is added
CREATE OR REPLACE FUNCTION update_group_people_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_order_id IS NOT NULL AND NEW.status = 'paid' THEN
    UPDATE group_orders
    SET current_people = current_people + 1
    WHERE id = NEW.group_order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_group_people ON orders;
CREATE TRIGGER trg_update_group_people
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION update_group_people_count();

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for menu/locations/groups/tiers
CREATE POLICY "public_read_menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "public_read_locations" ON pickup_locations FOR SELECT USING (true);
CREATE POLICY "public_read_groups" ON group_orders FOR SELECT USING (true);
CREATE POLICY "public_read_tiers" ON discount_tiers FOR SELECT USING (true);

-- Orders: public insert (guest checkout), read own by email match
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_own_orders" ON orders FOR SELECT USING (
  guest_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR auth.uid() = user_id
);

-- Order items: readable if order is readable
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE group_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
