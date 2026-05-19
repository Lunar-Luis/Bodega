-- ============================================================
-- BodegaOnline — Esquema de Base de Datos para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla: datos clave-valor por usuario (productos, config, historial)
CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- 2. Tabla: ventas
CREATE TABLE IF NOT EXISTS ventas (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_bs DOUBLE PRECISION NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL,
  referencia TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ventas_user_fecha ON ventas (user_id, fecha);

-- 3. Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para user_data
CREATE POLICY "Usuarios ven sus propios datos"
  ON user_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus propios datos"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus propios datos"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Políticas RLS para ventas
CREATE POLICY "Usuarios ven sus propias ventas"
  ON ventas FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus propias ventas"
  ON ventas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus propias ventas"
  ON ventas FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Trigger: actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ventas_updated_at
  BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
