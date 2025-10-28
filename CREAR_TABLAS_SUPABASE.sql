-- ========================================
-- SCRIPT SQL PARA CREAR TABLAS EN SUPABASE
-- Funcionalidades: Push Notifications + Sistema de Puntos
-- ========================================

-- 1. TABLA DE TOKENS DE PUSH NOTIFICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

-- Comentarios
COMMENT ON TABLE push_tokens IS 'Almacena los tokens de push notifications de los usuarios';
COMMENT ON COLUMN push_tokens.token IS 'Token de FCM (Firebase Cloud Messaging)';
COMMENT ON COLUMN push_tokens.platform IS 'Plataforma del dispositivo (android o ios)';


-- 2. TABLA DE PUNTOS DEL USUARIO
-- ========================================
CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para leaderboard (ranking)
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(level DESC);

-- Comentarios
COMMENT ON TABLE user_points IS 'Puntos totales y nivel de cada usuario';
COMMENT ON COLUMN user_points.total_points IS 'Puntos acumulados del usuario';
COMMENT ON COLUMN user_points.level IS 'Nivel calculado basado en puntos';


-- 3. TABLA DE TRANSACCIONES DE PUNTOS
-- ========================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial y estadísticas
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_action ON points_transactions(action);

-- Comentarios
COMMENT ON TABLE points_transactions IS 'Historial de todas las transacciones de puntos';
COMMENT ON COLUMN points_transactions.action IS 'Tipo de acción que generó los puntos';
COMMENT ON COLUMN points_transactions.points IS 'Cantidad de puntos (puede ser negativo si se restan)';
COMMENT ON COLUMN points_transactions.metadata IS 'Información adicional en formato JSON';


-- 4. FUNCIÓN PARA AÑADIR PUNTOS
-- ========================================
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  -- Insertar o actualizar puntos del usuario
  INSERT INTO user_points (user_id, total_points, updated_at)
  VALUES (p_user_id, p_points, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    updated_at = NOW()
  RETURNING total_points INTO v_new_total;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION add_user_points IS 'Añade puntos a un usuario y retorna el nuevo total';


-- 5. FUNCIÓN PARA CALCULAR NIVEL
-- ========================================
CREATE OR REPLACE FUNCTION calculate_user_level(p_points INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_points_required INTEGER := 0;
BEGIN
  -- Cada nivel requiere 100 puntos más que el anterior
  -- Nivel 1: 0-99, Nivel 2: 100-299, Nivel 3: 300-599, etc.
  
  IF p_points < 100 THEN
    RETURN 1;
  END IF;
  
  WHILE v_points_required <= p_points LOOP
    v_level := v_level + 1;
    v_points_required := v_points_required + (v_level * 100);
  END LOOP;
  
  RETURN v_level - 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comentario
COMMENT ON FUNCTION calculate_user_level IS 'Calcula el nivel basado en puntos totales';


-- 6. TRIGGER PARA ACTUALIZAR NIVEL AUTOMÁTICAMENTE
-- ========================================
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_user_level(NEW.total_points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_update_level ON user_points;
CREATE TRIGGER trigger_update_level
  BEFORE INSERT OR UPDATE OF total_points ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Comentario
COMMENT ON FUNCTION update_user_level IS 'Trigger que actualiza el nivel cuando cambian los puntos';


-- 7. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para push_tokens
CREATE POLICY "Los usuarios pueden ver sus propios tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para user_points
CREATE POLICY "Los usuarios pueden ver todos los puntos (para leaderboard)"
  ON user_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propios puntos"
  ON user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sistema puede actualizar puntos"
  ON user_points FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Políticas para points_transactions
CREATE POLICY "Los usuarios pueden ver su propio historial"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede insertar transacciones"
  ON points_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');


-- 8. VISTAS ÚTILES
-- ========================================

-- Vista de leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  up.user_id,
  up.total_points,
  up.level,
  u.email,
  u.raw_user_meta_data->>'username' as username,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank
FROM user_points up
JOIN auth.users u ON u.id = up.user_id
ORDER BY up.total_points DESC;

-- Comentario
COMMENT ON VIEW leaderboard IS 'Vista del ranking de usuarios por puntos';


-- ========================================
-- VERIFICACIÓN DE INSTALACIÓN
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas creadas correctamente:';
  RAISE NOTICE '   - push_tokens';
  RAISE NOTICE '   - user_points';
  RAISE NOTICE '   - points_transactions';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Funciones creadas:';
  RAISE NOTICE '   - add_user_points()';
  RAISE NOTICE '   - calculate_user_level()';
  RAISE NOTICE '   - update_user_level()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Políticas de seguridad (RLS) aplicadas';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Vista leaderboard creada';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Base de datos lista para usar!';
END $$;
