# FitSatus — MVP / POC

Aplicación web (con diseño estilo app móvil) que implementa el MVP de **FitSatus**,
proyecto semestral de Ingeniería de Software (Grupo 7). Este código es la
implementación del diseño presentado en la Entrega 2 (arquitectura por capas,
diagrama de secuencia y de componentes) y de los requerimientos de la Entrega 1
(user stories y backlog MoSCoW).

## 1. Cómo se traduce la arquitectura del informe a este código

| Capa del informe        | Dónde vive en este repo                                              |
|--------------------------|------------------------------------------------------------------------|
| Capa de Presentación     | `src/pages/*.jsx`, `src/components/*.jsx` (React)                     |
| Capa de Negocio          | `src/lib/business.js` (cálculo de IMC/TDEE, generación de planes, logros) |
| Capa de Persistencia     | `src/lib/supabaseClient.js` + llamadas `supabase.from(...)` en cada página |
| Capa de Datos            | Base de datos Postgres administrada por Supabase (`supabase/schema.sql`) |

Se eligió **React + Supabase** en vez de una app nativa (Android/iOS) porque para
un MVP/POC de presentación permite mostrar el flujo completo funcionando en
minutos, sin necesitar Android Studio/Xcode ni emuladores, y corre igual en el
notebook del equipo, en el proyector de la sala, o en el celular de cualquiera
(es responsive). La lógica de negocio y el modelo de datos son los mismos que
se usarían en una app nativa; si más adelante quieren pasar a React Native, la
capa de negocio (`business.js`) y el esquema de Supabase se reutilizan tal cual.

## 2. Funcionalidades incluidas (backlog completo)

**Must have:** registro/login, ingreso de datos personales, definición de
objetivos, generación de plan de entrenamiento, generación de plan alimenticio.

**Should have:** registro de calorías, visualización de progreso (gráfico de
peso).

**Could have:** recordatorios (notificaciones del navegador), visualización de
ejercicios (ficha con descripción y grupo muscular), sistema de logros.

## 3. Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).
- Una cuenta gratuita en [Supabase](https://supabase.com/) (esto reemplaza
  tener que instalar y administrar una base de datos propia).
- Una cuenta de [GitHub](https://github.com/) para compartir el repo con tu equipo.
- [VS Code](https://code.visualstudio.com/) (o el editor que prefieran).

## 4. Configurar Supabase (una sola vez, lo hace cualquier integrante del equipo)

1. Entra a [supabase.com](https://supabase.com/) y crea un proyecto nuevo
   (elige una región cercana, por ejemplo São Paulo).
2. Ve a **SQL Editor → New query**, pega el contenido completo de
   `supabase/schema.sql` y ejecuta (`Run`). Esto crea todas las tablas y las
   reglas de seguridad (RLS) descritas en el diagrama de clases.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
4. En **Authentication → Providers**, confirma que "Email" esté habilitado
   (viene activado por defecto). Para el MVP puedes desactivar la confirmación
   por correo en **Authentication → Settings → Email Auth** (útil para probar
   más rápido en la presentación).

## 5. Configurar el proyecto en tu computador

```bash
# 1. Clonar el repo (después de subirlo a GitHub, ver sección 7)
git clone https://github.com/TU-ORG/fitsatus.git
cd fitsatus

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Abre .env y pega tu Project URL y anon key de Supabase

# 4. Ejecutar en modo desarrollo
npm run dev
```

Abre el link que aparece en la terminal (por defecto `http://localhost:5173`).
La app se muestra dentro de un "marco de celular" en pantallas grandes y a
pantalla completa en celulares reales.

## 6. Flujo para probar el MVP

1. Entra a `/registro`, crea una cuenta con correo y contraseña.
2. Completa el formulario de datos personales y objetivo (onboarding). Esto
   genera automáticamente tu primer plan de entrenamiento y alimenticio.
3. Explora las pestañas inferiores: **Inicio, Entreno, Comidas, Progreso,
   Logros, Ajustes**.
4. Registra un alimento, marca una sesión de entrenamiento como cumplida,
   registra tu peso y revisa cómo se van desbloqueando logros.

## 7. Subir el proyecto a GitHub para trabajar en equipo

```bash
# Dentro de la carpeta fitsatus
git init
git add .
git commit -m "MVP inicial de FitSatus"

# Crea un repositorio vacío en GitHub (botón "New repository"), luego:
git remote add origin https://github.com/TU-ORG/fitsatus.git
git branch -M main
git push -u origin main
```

Recomendaciones para trabajar en equipo:

- Cada integrante clona el repo y crea su propio `.env` (nunca subir `.env`
  al repositorio; ya está excluido en `.gitignore`).
- Trabajen con ramas por funcionalidad (`git checkout -b feature/logros`) y
  hagan Pull Requests hacia `main`, igual que mencionan en la Entrega 2 sobre
  gestión ágil del backlog.
- Si quieren compartir el mismo proyecto de Supabase, cualquiera puede
  invitar a los demás desde **Project Settings → Team**.

## 8. Estructura del proyecto

```
fitsatus/
├─ src/
│  ├─ pages/            Pantallas (Presentación)
│  ├─ components/        Componentes de UI reutilizables
│  ├─ context/           Contexto de autenticación
│  ├─ lib/
│  │  ├─ business.js     Capa de Negocio (cálculos y generadores de planes)
│  │  └─ supabaseClient.js
│  └─ data/              Catálogo estático de ejercicios
├─ supabase/schema.sql   Capa de Datos (tablas + RLS)
├─ .env.example
└─ README.md
```

## 9. Notas sobre el alcance del MVP (para la presentación)

- Las notificaciones de recordatorios usan el permiso de notificaciones del
  navegador; para producción se recomienda un servicio de notificaciones push
  nativo.
- El catálogo de ejercicios usa descripciones propias en vez de video, para no
  depender de contenido con derechos de autor de terceros.
- Los algoritmos de generación de planes (TDEE, rutina, macros) son reglas
  simples y transparentes, consistentes con lo indicado en el informe: "no se
  exige un sistema productivo, sino un MVP".
