# Guía de Configuración de Base de Datos - VENDE TU LEASING

## Descripción General

Esta base de datos está diseñada para un portal inmobiliario con sistema de leasing que incluye gestión de propiedades, usuarios, transacciones y billeteras digitales.

## Estructura de la Base de Datos

### Tablas Principales

1. **profiles** - Perfiles de usuario vinculados a Supabase Auth
2. **wallets** - Billeteras digitales para transacciones
3. **properties** - Propiedades inmobiliarias
4. **property_images** - Imágenes de propiedades
5. **property_amenities** - Comodidades de propiedades
6. **price_alerts** - Alertas de precio para usuarios
7. **transactions** - Transacciones de billetera

## Instrucciones de Instalación

### Opción 1: Usando el archivo SQL completo

1. Abre tu proyecto en Supabase Dashboard
2. Ve a SQL Editor
3. Copia todo el contenido de `supabase_backup_completo.sql`
4. Pega en el editor y ejecuta
5. Verifica que todas las tablas se hayan creado correctamente

### Opción 2: Usando scripts individuales

Ejecuta los scripts en este orden:

1. `scripts/001_create_tables.sql`
2. `scripts/002_create_triggers.sql`
3. `scripts/003_fix_user_trigger.sql`

## Características de Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

- **Perfiles**: Los usuarios pueden ver todos los perfiles pero solo editar el suyo
- **Propiedades**: Todos pueden ver, solo el propietario puede editar/eliminar
- **Billeteras**: Solo el propietario puede ver y modificar su billetera
- **Transacciones**: Solo el propietario puede ver sus transacciones

### Triggers Automáticos

1. **on_auth_user_created**: Crea automáticamente un perfil y billetera cuando un usuario se registra
2. **generate_property_code**: Genera un código único (RTD + 7 dígitos) para cada propiedad
3. **update_updated_at**: Actualiza automáticamente el timestamp de modificación

## Tipos de Datos Personalizados

\`\`\`sql
user_role: 'user', 'premium', 'admin'
property_type: 'house', 'apartment', 'office', 'villa', 'townhome', 'bungalow', 'condo', 'land', 'commercial'
property_status: 'for_sale', 'for_rent', 'sold', 'rented'
transaction_type: 'deposit', 'withdrawal', 'property_payment', 'subscription'
transaction_status: 'pending', 'completed', 'failed'
\`\`\`

## Variables de Entorno Requeridas

Crea un archivo `.env.local` con las siguientes variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Redirect URL para desarrollo
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Configuración de Storage

Para las imágenes de propiedades, crea un bucket en Supabase:

1. Ve a Storage en Supabase Dashboard
2. Crea un nuevo bucket llamado "property-images"
3. Configura políticas de acceso público para lectura
4. Permite subida solo para usuarios autenticados

## Consultas Útiles

### Ver todas las propiedades con sus imágenes principales

\`\`\`sql
SELECT p.*, pi.image_url
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = true;
\`\`\`

### Ver usuarios con sus billeteras

\`\`\`sql
SELECT pr.full_name, pr.email, w.balance
FROM profiles pr
JOIN wallets w ON pr.id = w.user_id;
\`\`\`

### Ver propiedades por ciudad

\`\`\`sql
SELECT city, COUNT(*) as total, AVG(price) as precio_promedio
FROM properties
GROUP BY city
ORDER BY total DESC;
\`\`\`

## Mantenimiento

### Limpiar registros antiguos

\`\`\`sql
-- Eliminar alertas inactivas de hace más de 6 meses
DELETE FROM price_alerts 
WHERE active = false 
AND updated_at < NOW() - INTERVAL '6 months';
\`\`\`

### Actualizar contadores de vistas

\`\`\`sql
-- Incrementar vistas de una propiedad
UPDATE properties 
SET views = views + 1 
WHERE id = 'property-uuid';
\`\`\`

## Soporte

Para problemas o preguntas:
- Revisa la documentación de Supabase: https://supabase.com/docs
- Verifica los logs de errores en Supabase Dashboard
- Asegúrate de que RLS esté configurado correctamente

## Diagrama de Base de Datos

Ver archivo `database-diagram.jpg` para visualización gráfica de las relaciones entre tablas.
