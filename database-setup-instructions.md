# Instrucciones para configurar la base de datos en Supabase

## 1. Copiar el esquema DBML

1. Ve a [dbdiagram.io](https://dbdiagram.io/)
2. Copia el contenido del archivo `database-schema.dbml`
3. Pégalo en el editor de dbdiagram.io para visualizar el esquema

## 2. Crear las tablas en Supabase

Ejecuta estos scripts SQL en el SQL Editor de Supabase:

### Tabla: usuarios

\`\`\`sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  apellido VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  telefono VARCHAR,
  password_hash VARCHAR NOT NULL,
  rol VARCHAR NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
\`\`\`

### Tabla: inmuebles

\`\`\`sql
CREATE TABLE inmuebles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR NOT NULL,
  descripcion TEXT,
  tipo VARCHAR NOT NULL,
  precio NUMERIC NOT NULL,
  ciudad VARCHAR NOT NULL,
  barrio VARCHAR,
  estrato INT CHECK (estrato >= 1 AND estrato <= 6),
  area_m2 FLOAT,
  habitaciones INT,
  banos INT,
  estado_publicacion VARCHAR NOT NULL DEFAULT 'inactivo' CHECK (estado_publicacion IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar búsquedas y filtros
CREATE INDEX idx_inmuebles_usuario_id ON inmuebles(usuario_id);
CREATE INDEX idx_inmuebles_ciudad ON inmuebles(ciudad);
CREATE INDEX idx_inmuebles_tipo ON inmuebles(tipo);
CREATE INDEX idx_inmuebles_precio ON inmuebles(precio);
CREATE INDEX idx_inmuebles_estado ON inmuebles(estado_publicacion);
CREATE INDEX idx_inmuebles_search_filters ON inmuebles(ciudad, tipo, precio);
\`\`\`

### Tabla: parametros_credito

\`\`\`sql
CREATE TABLE parametros_credito (
  id SERIAL PRIMARY KEY,
  tasa_interes_anual NUMERIC NOT NULL,
  plazo_min_meses INT NOT NULL,
  plazo_max_meses INT NOT NULL,
  porcentaje_cuota_inicial_min NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar parámetros por defecto
INSERT INTO parametros_credito (
  tasa_interes_anual,
  plazo_min_meses,
  plazo_max_meses,
  porcentaje_cuota_inicial_min
) VALUES (
  12.5,  -- 12.5% anual
  12,    -- mínimo 12 meses
  360,   -- máximo 360 meses (30 años)
  20     -- 20% de cuota inicial mínima
);
\`\`\`

## 3. Configurar Row Level Security (RLS)

Para proteger los datos, habilita RLS en Supabase:

### Políticas para usuarios

\`\`\`sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id::text = auth.uid()::text
      AND rol = 'admin'
    )
  );
\`\`\`

### Políticas para inmuebles

\`\`\`sql
-- Habilitar RLS
ALTER TABLE inmuebles ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver inmuebles activos
CREATE POLICY "Anyone can view active properties"
  ON inmuebles FOR SELECT
  USING (estado_publicacion = 'activo');

-- Los usuarios pueden ver sus propios inmuebles
CREATE POLICY "Users can view own properties"
  ON inmuebles FOR SELECT
  USING (usuario_id::text = auth.uid()::text);

-- Los usuarios pueden crear inmuebles
CREATE POLICY "Users can create properties"
  ON inmuebles FOR INSERT
  WITH CHECK (usuario_id::text = auth.uid()::text);

-- Los usuarios pueden actualizar sus propios inmuebles
CREATE POLICY "Users can update own properties"
  ON inmuebles FOR UPDATE
  USING (usuario_id::text = auth.uid()::text);

-- Los usuarios pueden eliminar sus propios inmuebles
CREATE POLICY "Users can delete own properties"
  ON inmuebles FOR DELETE
  USING (usuario_id::text = auth.uid()::text);

-- Los admins pueden ver todos los inmuebles
CREATE POLICY "Admins can view all properties"
  ON inmuebles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id::text = auth.uid()::text
      AND rol = 'admin'
    )
  );
\`\`\`

### Políticas para parametros_credito

\`\`\`sql
-- Habilitar RLS
ALTER TABLE parametros_credito ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer los parámetros de crédito
CREATE POLICY "Anyone can view credit parameters"
  ON parametros_credito FOR SELECT
  TO authenticated, anon
  USING (true);

-- Solo admins pueden modificar parámetros
CREATE POLICY "Only admins can modify credit parameters"
  ON parametros_credito FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id::text = auth.uid()::text
      AND rol = 'admin'
    )
  );
\`\`\`

## 4. Crear función para sincronizar usuario con Auth

\`\`\`sql
-- Función para crear perfil de usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, apellido, password_hash, rol)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', ''),
    COALESCE(new.raw_user_meta_data->>'apellido', ''),
    '', -- El hash se maneja por Supabase Auth
    'usuario'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

## 5. Verificar la configuración

Después de ejecutar todos los scripts:

1. Verifica que las tres tablas existan en el Table Editor
2. Confirma que RLS está habilitado en todas las tablas
3. Prueba crear un usuario y verifica que se cree el perfil automáticamente
4. Verifica que exista al menos un registro en `parametros_credito`

## Notas importantes

- **Roles de usuario**: Por defecto todos son 'usuario'. Para crear un admin, actualiza manualmente el campo `rol` en la tabla `usuarios`.
- **Estado de inmuebles**: Por defecto es 'inactivo'. Cambia a 'activo' para que aparezcan en búsquedas públicas.
- **Parámetros de crédito**: El simulador usará siempre el registro más reciente de esta tabla.
