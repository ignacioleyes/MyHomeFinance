# MyHomeFinance - Contexto del Proyecto

## Descripción
Aplicación PWA para administración de gastos del hogar con soporte para múltiples usuarios por household.

## Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Chakra UI v3
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **PWA**: vite-plugin-pwa + Workbox
- **Deploy**: Render

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthPage.tsx        # Página de autenticación
│   │   ├── LoginForm.tsx       # Formulario de login
│   │   └── RegisterForm.tsx    # Formulario de registro
│   ├── forms/
│   │   └── FormularioGasto.tsx # Formulario para agregar/editar gastos
│   ├── gastos/
│   │   ├── ListaGastos.tsx     # Lista de gastos
│   │   ├── ResumenMensual.tsx  # Resumen mensual
│   │   └── TarjetaGasto.tsx    # Tarjeta individual de gasto
│   ├── household/
│   │   └── HouseholdMembers.tsx # Gestión de miembros del hogar
│   ├── ui/
│   │   ├── Layout.tsx          # Layout principal
│   │   └── SelectorMes.tsx     # Selector de mes
│   └── index.ts                # Barrel exports
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticación
├── hooks/
│   ├── useGastos.ts            # Hook local (legacy, no usado)
│   ├── useHousehold.ts         # Hook para gestión de households
│   ├── useLocalStorage.ts      # Hook de localStorage
│   └── useSupabaseGastos.ts    # Hook principal de gastos con Supabase
├── lib/
│   └── supabase.ts             # Cliente de Supabase
├── theme/
│   └── system.ts               # Configuración de Chakra UI
├── types/
│   ├── auth.types.ts           # Tipos de autenticación
│   ├── database.types.ts       # Tipos de Supabase
│   └── gasto.types.ts          # Tipos de gastos
├── utils/
│   ├── auth-validators.ts      # Validadores de auth
│   ├── constants.ts            # Constantes (categorías, etc.)
│   ├── formatters.ts           # Formateadores (moneda, fecha)
│   └── validators.ts           # Validadores de formularios
├── App.tsx                     # Componente principal
├── main.tsx                    # Entry point + PWA register
└── index.css                   # Estilos globales
```

## Base de Datos (Supabase)

### Tablas

#### `households`
- `id` (UUID, PK)
- `name` (VARCHAR)
- `created_by` (UUID, FK → auth.users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `household_members`
- `id` (UUID, PK)
- `household_id` (UUID, FK → households)
- `user_id` (UUID, FK → auth.users)
- `role` ('admin' | 'member')
- `joined_at` (TIMESTAMP)

#### `expenses`
- `id` (UUID, PK)
- `household_id` (UUID, FK → households)
- `user_id` (UUID, FK → auth.users)
- `amount` (DECIMAL)
- `category` (VARCHAR)
- `description` (TEXT, nullable)
- `expense_date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `pending_invitations`
- `id` (UUID, PK)
- `email` (VARCHAR)
- `household_id` (UUID, FK → households)
- `invited_by` (UUID, FK → auth.users)
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP, default NOW() + 7 days)
- UNIQUE(email, household_id)

### Políticas RLS

#### `expenses`
| Política | Operación | Condición |
|----------|-----------|-----------|
| Members can view household expenses | SELECT | household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()) |
| Members can create expenses | INSERT | household_id IN (...) AND user_id = auth.uid() |
| Users can update their own expenses | UPDATE | user_id = auth.uid() |
| Users can delete their own expenses | DELETE | user_id = auth.uid() |

#### `household_members`
| Política | Operación | Condición |
|----------|-----------|-----------|
| Members can view household members | SELECT | is_household_member(household_id) |
| Admins can add members | INSERT | is_household_admin(household_id) OR user_id = auth.uid() |
| Users or admins can delete memberships | DELETE | user_id = auth.uid() OR is_household_admin(household_id) |

#### `pending_invitations`
| Política | Operación | Condición |
|----------|-----------|-----------|
| Admins can create invitations | INSERT | is_household_admin(household_id) |
| Users can view their invitations | SELECT | email = auth.jwt()->>'email' |
| Admins can view household invitations | SELECT | is_household_admin(household_id) |
| Admins can delete invitations | DELETE | is_household_admin(household_id) |

### Funciones

```sql
-- Verifica si el usuario actual es miembro de un household
is_household_member(hh_id UUID) RETURNS BOOLEAN
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hh_id AND user_id = auth.uid()
  );

-- Verifica si el usuario actual es admin de un household
is_household_admin(hh_id UUID) RETURNS BOOLEAN
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hh_id AND user_id = auth.uid() AND role = 'admin'
  );

-- Actualiza updated_at automáticamente
update_updated_at_column() RETURNS TRIGGER
  NEW.updated_at = NOW();
  RETURN NEW;

-- Obtiene el UUID de un usuario por email
get_user_id_by_email(email_param VARCHAR) RETURNS UUID
  SELECT id FROM auth.users WHERE email = email_param LIMIT 1;

-- Obtiene miembros de un household con sus emails
get_household_members_with_emails(household_id_param UUID) RETURNS TABLE
  SELECT hm.id, hm.user_id, hm.role, hm.joined_at, au.email
  FROM household_members hm
  LEFT JOIN auth.users au ON hm.user_id = au.id
  WHERE hm.household_id = household_id_param;
```

### Triggers

| Trigger | Tabla | Evento | Acción |
|---------|-------|--------|--------|
| update_households_updated_at | households | UPDATE | update_updated_at_column() |
| update_expenses_updated_at | expenses | UPDATE | update_updated_at_column() |

## Categorías de Gastos

```typescript
const CATEGORIAS = [
  "Combustible", "Cuota Colegios", "Deportes", "Supermercado",
  "Panadería", "Verdulería", "Carnicería", "Pollería",
  "Restaurantes", "Ropa", "Cafecito", "Tarjetas de Crédito",
  "Préstamos", "Mascotas", "Servicios", "Farmacia",
  "Entretenimiento", "Depilación", "Alquiler", "Otros"
];
```

## Configuración Regional
- Formato de moneda: `es-AR` (Peso Argentino - ARS)
- Zona horaria: Argentina (UTC-3)

## Características Implementadas
- [x] Autenticación (login/registro)
- [x] Crear gastos
- [x] Listar gastos
- [x] Eliminar gastos
- [x] Editar gastos
- [x] Filtrar por mes
- [x] Resumen mensual por categoría
- [x] Gestión de miembros del hogar
- [x] Invitaciones por email (magic link)
- [x] PWA (instalable, offline-ready)
- [x] Realtime updates

## Flujo de Invitación
1. Admin ingresa email del invitado
2. Si el usuario ya existe → se agrega directamente al household
3. Si es usuario nuevo:
   - Se crea registro en `pending_invitations`
   - Se envía magic link por email (Supabase Auth OTP)
   - Usuario hace clic y es redirigido a la app
   - `useHousehold` detecta la invitación pendiente
   - Usuario es agregado al household automáticamente (no crea uno nuevo)

## URLs
- **Producción**: https://myhomefinance.onrender.com
- **Supabase Dashboard**: (configurar Site URL y Redirect URLs aquí)

## Variables de Entorno
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## Comandos
```bash
yarn start      # Desarrollo (puerto 3000)
yarn dev        # Desarrollo
yarn build      # Build de producción
yarn preview    # Preview del build
```

## Notas Técnicas

### Manejo de Fechas
Las fechas se parsean con `T00:00:00` para evitar problemas de timezone:
```typescript
const fechaLocal = new Date(fecha + "T00:00:00");
```

### Realtime
Los gastos se actualizan en tiempo real usando Supabase Realtime subscriptions en `useSupabaseGastos.ts`.

### PWA
- Service Worker con auto-update
- Cache de fonts de Google (1 año)
- Cache de API Supabase (NetworkFirst, 5 min)
