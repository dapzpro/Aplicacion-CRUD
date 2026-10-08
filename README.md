# Sistema de Gestión de Productos con Autenticación y Roles

**Aplicación web full stack** desarrollada con **NestJS**, **React** y **PostgreSQL**.

| | |
|---|---|
| **Autor** | _David Proaño_ |
| **Materia** | _Ingenieria Web_ |
| **Docente** | _Juan Jose Leon_ |
| **Fecha** | _07/10/2026_ |

---

## 1. Introducción

Este proyecto es una aplicación web para administrar un inventario de productos. Permite que los usuarios se registren, inicien sesión y trabajen con un catálogo de productos, con **permisos distintos según el rol** de cada persona.

Se construyó para practicar los conceptos fundamentales del desarrollo web moderno:

- Separación entre **frontend** y **backend** que se comunican mediante una **API REST**.
- Operaciones **CRUD** (Create, Read, Update, Delete) sobre una base de datos relacional.
- **Autenticación** con tokens JWT.
- **Autorización por roles** (qué puede hacer cada tipo de usuario).

## 2. Objetivos

**Objetivo general:** desarrollar una aplicación web con inicio de sesión y un CRUD de productos, controlando el acceso según el rol del usuario.

**Objetivos específicos:**

1. Implementar una API REST con NestJS conectada a una base de datos PostgreSQL.
2. Implementar registro e inicio de sesión seguros (contraseñas encriptadas y tokens JWT).
3. Restringir las operaciones de editar y eliminar únicamente al rol administrador.
4. Construir una interfaz con React y Tailwind CSS que consuma la API.

## 3. Funcionalidades

- **Registro** de nuevos usuarios desde la pantalla de inicio de sesión.
- **Inicio de sesión** con correo y contraseña.
- **Listado de productos** con tarjetas que muestran nombre, descripción, precio, stock y quién lo creó.
- **Búsqueda** de productos por nombre o descripción.
- **Creación** de productos (cualquier usuario con sesión iniciada).
- **Edición y eliminación** de productos (solo el administrador).
- **Cierre de sesión**.
- **Validación de datos** en el servidor (correo válido, contraseña de mínimo 6 caracteres, precio y stock no negativos, stock entero).

### Roles y permisos

| Rol | Ver productos | Crear | Editar | Eliminar |
|---|:---:|:---:|:---:|:---:|
| **Usuario** (se registra desde la pantalla) | Sí | Sí | No | No |
| **Administrador** | Sí | Sí | Sí | Sí |

Todo usuario que se registra queda con el rol **usuario**. El administrador se crea automáticamente la primera vez que arranca el backend:

- **Correo:** `admin@admin.com`
- **Contraseña:** `admin123`

## 4. Tecnologías utilizadas

| Capa | Tecnología | Para qué se usa |
|---|---|---|
| Frontend | **React 19** + **Vite** | Construir la interfaz por componentes |
| Frontend | **Tailwind CSS** | Dar estilo a la interfaz con clases utilitarias |
| Frontend | **React Router** | Navegar entre login y productos, y proteger rutas |
| Frontend | **Axios** | Hacer las peticiones HTTP al backend |
| Backend | **NestJS 11** (TypeScript) | Framework para organizar la API en módulos, controladores y servicios |
| Backend | **TypeORM** | Mapear clases de TypeScript a tablas de la base de datos (ORM) |
| Backend | **Passport + JWT** | Autenticación mediante tokens |
| Backend | **bcrypt** | Encriptar las contraseñas |
| Backend | **class-validator** | Validar los datos que llegan a la API |
| Base de datos | **PostgreSQL** | Almacenar usuarios y productos |

## 5. Arquitectura



### Organización del backend en NestJS

NestJS organiza el código en **módulos**. Cada módulo agrupa las piezas de una funcionalidad:

- **Controller:** recibe las peticiones HTTP y define las rutas (por ejemplo `GET /products`).
- **Service:** contiene la lógica de negocio y habla con la base de datos.
- **Entity:** clase que representa una tabla de la base de datos.
- **DTO** (Data Transfer Object): define y valida qué datos se aceptan en una petición.
- **Guard:** decide si una petición puede continuar o debe rechazarse.

## 6. Autenticación y autorización

Son dos conceptos distintos que la aplicación aplica en secuencia:

- **Autenticación:** comprobar *quién eres* (login).
- **Autorización:** comprobar *qué puedes hacer* (rol).

### Flujo de inicio de sesión

1. El usuario envía su correo y contraseña a `POST /auth/login`.
2. El backend busca al usuario y compara la contraseña con el hash guardado usando **bcrypt**. Las contraseñas **nunca se guardan en texto plano**.
3. Si es correcto, el backend genera un **token JWT** firmado que incluye el id, el correo y el rol del usuario. El token vence en 1 día.
4. React guarda el token en `localStorage`.
5. Desde ese momento, **Axios agrega el token** en el header `Authorization: Bearer <token>` de cada petición.
6. En cada ruta protegida, el **JwtAuthGuard** verifica que el token sea válido, y el **RolesGuard** revisa que el rol tenga permiso.

### Dónde se controla el rol

En el frontend, los botones **Editar** y **Eliminar** solo se muestran al administrador. Pero eso es solo una mejora de la experiencia de usuario: **la seguridad real está en el backend**. Aunque alguien intente llamar a la API directamente, `RolesGuard` rechaza con un error **403 (Forbidden)** a cualquiera que no sea administrador.

## 7. Modelo de datos

**Tabla `users`**

| Campo | Tipo | Descripción |
|---|---|---|
| id | entero (PK) | Identificador autoincremental |
| name | texto | Nombre del usuario |
| email | texto (único) | Correo, se usa para iniciar sesión |
| password | texto | Contraseña encriptada con bcrypt |
| role | texto | `user` o `admin` (por defecto `user`) |

**Tabla `products`**

| Campo | Tipo | Descripción |
|---|---|---|
| id | entero (PK) | Identificador autoincremental |
| name | texto | Nombre del producto |
| description | texto | Descripción |
| price | decimal | Precio (≥ 0) |
| stock | entero | Unidades disponibles (≥ 0) |
| createdBy | texto | Correo de quien creó el producto |
| createdAt | fecha | Fecha de creación |



## 8. API REST (endpoints)

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/register` | Registrar un usuario | Público |
| POST | `/auth/login` | Iniciar sesión (devuelve el token) | Público |
| GET | `/products` | Listar productos | Sesión iniciada |
| GET | `/products/:id` | Ver un producto | Sesión iniciada |
| POST | `/products` | Crear un producto | Sesión iniciada |
| PATCH | `/products/:id` | Editar un producto | Solo administrador |
| DELETE | `/products/:id` | Eliminar un producto | Solo administrador |

Las rutas protegidas requieren el header: `Authorization: Bearer <access_token>`.

**Códigos de respuesta que devuelve la API:**

| Código | Significado |
|---|---|
| 200 / 201 | Operación correcta / recurso creado |
| 400 | Datos inválidos (falló la validación) |
| 401 | Sin sesión o credenciales incorrectas |
| 403 | Sesión válida pero sin permiso (no es administrador) |
| 404 | Producto no encontrado |
| 409 | El correo ya está registrado |

## 10. Instalación y ejecución

### Requisitos previos

1. **Node.js 20 o superior** (versión LTS): https://nodejs.org
2. **PostgreSQL** con una base de datos llamada `crud_db`, usuario `postgres`, contraseña `postgres` y puerto `5432`.
   - Alternativa: con Docker Desktop, ejecutar `docker compose up -d` en la carpeta del proyecto.

### Pasos

Se necesitan **dos terminales**.

**Terminal 1: Backend** (puerto 3000)

```bash
cd backend
npm install
npm run start:dev
```

Cuando aparezca `Nest application successfully started`, el backend está listo.

**Terminal 2: Frontend** (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

### Cómo probar los roles

1. Iniciar sesión con el administrador (`admin@admin.com` / `admin123`) y crear, editar y eliminar productos.
2. Cerrar sesión, pulsar **Regístrate** y crear una cuenta nueva.
3. Con esa cuenta se pueden ver y crear productos, pero **no aparecen** los botones de editar ni eliminar.

## 11. Conceptos aplicados

- **API REST** y verbos HTTP (GET, POST, PATCH, DELETE).
- **CRUD** completo sobre una base de datos relacional.
- **ORM** (TypeORM) para trabajar con la base de datos usando clases en lugar de SQL.
- **Inyección de dependencias** (propia de NestJS) para conectar controladores y servicios.
- **Hash de contraseñas** con bcrypt.
- **JWT** para mantener la sesión sin guardar estado en el servidor.
- **Control de acceso basado en roles** (RBAC) con decoradores y guards.
- **Validación de datos** de entrada con DTOs.
- **Componentes y estado** en React (`useState`, `useEffect`) y **rutas protegidas**.
- **Diseño responsive** con Tailwind CSS.

## 12. Limitaciones y mejoras futuras

- Mover el secreto del JWT y las credenciales de la base de datos a **variables de entorno** (`.env`).
- Usar **migraciones** en lugar de `synchronize: true`, que solo es recomendable en desarrollo.
- Guardar el token en una **cookie httpOnly** en lugar de `localStorage`, para mayor seguridad.
- Agregar **paginación** al listado de productos.
- Agregar **pruebas automatizadas** (unitarias y end-to-end).
- Permitir que el administrador gestione los roles de otros usuarios desde la interfaz.

## 13. Conclusiones

El proyecto permitió integrar un frontend en React con un backend en NestJS y una base de datos PostgreSQL, aplicando autenticación con JWT y autorización por roles. Se comprobó que la seguridad debe implementarse en el servidor y no solo en la interfaz, y que dividir el backend en módulos facilita mantener y ampliar la aplicación.