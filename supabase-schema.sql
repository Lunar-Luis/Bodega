-- ============================================================
-- BodegaOnline — Esquema Relacional para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  precio_bs DOUBLE PRECISION NOT NULL DEFAULT 0,
  imagen TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_user ON productos (user_id);

-- 2. Tabla: ventas
CREATE TABLE IF NOT EXISTS ventas (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metodo_pago TEXT NOT NULL,
  referencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_user_fecha ON ventas (user_id, fecha DESC);

-- 3. Tabla: items de cada venta
CREATE TABLE IF NOT EXISTS venta_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  venta_id TEXT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  precio_bs DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_venta_items_venta ON venta_items (venta_id);

-- 4. Tabla: configuracion por usuario
CREATE TABLE IF NOT EXISTS config (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tasa_dolar DOUBLE PRECISION NOT NULL DEFAULT 0,
  ultima_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla: historial de acciones
CREATE TABLE IF NOT EXISTS historial (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_user ON historial (user_id, fecha DESC);

-- 6. Row Level Security
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS
CREATE POLICY "Propios productos" ON productos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Propios productos insert" ON productos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Propias ventas" ON ventas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Propias ventas insert" ON ventas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Propios venta_items" ON venta_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM ventas WHERE ventas.id = venta_items.venta_id AND ventas.user_id = auth.uid())
  );

CREATE POLICY "Propios venta_items insert" ON venta_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ventas WHERE ventas.id = venta_items.venta_id AND ventas.user_id = auth.uid())
  );

CREATE POLICY "Propia config" ON config
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Propia config insert" ON config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Propio historial" ON historial
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Propio historial insert" ON historial
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Trigger: actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
