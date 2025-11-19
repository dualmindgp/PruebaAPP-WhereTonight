-- Añadir campos adicionales a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN birth_date DATE,
ADD COLUMN age INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN birth_date IS NOT NULL THEN 
      CASE 
        WHEN birth_date > CURRENT_DATE THEN NULL
        ELSE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))
      END
    ELSE NULL
  END
) STORED,
ADD COLUMN city TEXT,
ADD COLUMN music_genres TEXT[] DEFAULT '{}',
ADD COLUMN custom_handle TEXT;

-- Crear índice para el handle personalizado
CREATE INDEX idx_profiles_custom_handle ON profiles(custom_handle);

-- Añadir restricción para que el username sea obligatorio
ALTER TABLE profiles 
ADD CONSTRAINT check_username_not_null 
CHECK (username IS NOT NULL AND username != '');

-- Comentario para los nuevos campos
COMMENT ON COLUMN profiles.birth_date IS 'Fecha de nacimiento del usuario (opcional)';
COMMENT ON COLUMN profiles.age IS 'Edad calculada automáticamente desde birth_date';
COMMENT ON COLUMN profiles.city IS 'Ciudad del usuario (opcional)';
COMMENT ON COLUMN profiles.music_genres IS 'Array de géneros musicales preferidos (opcional)';
COMMENT ON COLUMN profiles.custom_handle IS 'Handle personalizado para @username (opcional, se genera automáticamente si no se proporciona)';
