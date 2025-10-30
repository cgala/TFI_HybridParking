# Diagrama de Clases - Casual Parking

## Diagrama en Mermaid

```mermaid
classDiagram
    class Usuario {
        +Integer id
        +String nombre
        +String email
        +String password
        +String token
        +Boolean confirmado
        +DateTime createdAt
        +DateTime updatedAt
        +verificarPassword(password) Boolean
    }

    class Propiedad {
        +UUID id
        +String titulo
        +String descripcion
        +String techado
        +String alarma
        +String expensa
        +String calle
        +String lat
        +String lng
        +String imagen
        +Boolean publicado
        +Integer precioId
        +Integer categoriaId
        +Integer usuarioId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Categoria {
        +Integer id
        +String nombre
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Precio {
        +Integer id
        +String nombre
        +DateTime createdAt
        +DateTime updatedAt
    }

    class UsuarioController {
        +formularioLogin(req, res)
        +autenticar(req, res)
        +cerrarSesion(req, res)
        +formularioRegistro(req, res)
        +registrar(req, res)
        +confirmar(req, res)
        +formularioOlvidePassword(req, res)
        +resetPassword(req, res)
        +comprobarToken(req, res)
        +nuevoPassword(req, res)
    }

    class PropiedadController {
        +admin(req, res)
        +crear(req, res)
        +guardar(req, res)
        +agregarImagen(req, res)
        +almacenarImagen(req, res)
        +editar(req, res)
        +guardarCambios(req, res)
        +eliminar(req, res)
        +cambiarEstado(req, res)
        +mostrarPropiedad(req, res)
    }

    class EmailHelper {
        +emailRegistro(datos)
        +emailOlvidePassword(datos)
    }

    class TokenHelper {
        +generarId() String
        +generarJWT(datos) String
    }

    class ProtegerRutaMiddleware {
        +protegerRuta(req, res, next)
    }

    class SubirImagenMiddleware {
        +upload(field, maxCount)
    }

    %% Relaciones entre Modelos (Entidades de Dominio)
    Usuario "1" *-- "0..*" Propiedad : posee
    Precio "1" o-- "0..*" Propiedad : categoriza
    Categoria "1" o-- "0..*" Propiedad : clasifica

    %% Dependencias de Controladores con Modelos
    UsuarioController ..> Usuario : usa
    UsuarioController ..> EmailHelper : usa
    UsuarioController ..> TokenHelper : usa

    PropiedadController ..> Propiedad : usa
    PropiedadController ..> Precio : usa
    PropiedadController ..> Categoria : usa
    PropiedadController ..> Usuario : usa
    PropiedadController ..> SubirImagenMiddleware : usa
    PropiedadController ..> ProtegerRutaMiddleware : usa

    note for Usuario "Hooks: beforeCreate - hashea password con bcrypt\nScopes: eliminarPassword - excluye campos sensibles"
    note for Propiedad "UUID como primary key\nPublicado por defecto: false"
```

## Descripción de Relaciones

### Relaciones entre Modelos (Entidades de Dominio):

#### 1. Usuario *-- Propiedad (Composición 1:N)
- **Tipo**: Composición (diamante negro relleno)
- **Cardinalidad**: 1 Usuario posee 0 o muchas Propiedades
- **Justificación**: Las propiedades PERTENECEN a un usuario y su ciclo de vida está controlado por él. Una propiedad sin usuario propietario no tiene sentido en el contexto del sistema.
- **Implementación**: `Propiedad.belongsTo(Usuario, { foreignKey: 'usuarioId' })` (models/index.js:10)
- **Foreign Key**: `usuarioId` en tabla Propiedad

#### 2. Precio o-- Propiedad (Agregación 1:N)
- **Tipo**: Agregación (diamante blanco)
- **Cardinalidad**: 1 Precio categoriza 0 o muchas Propiedades
- **Justificación**: Precio es un catálogo de rangos de valores (ej: "$0-100k", "$100k-500k"). Las propiedades referencian un precio pero pueden existir independientemente. Si se elimina un rango de precio del catálogo, las propiedades no se eliminan.
- **Implementación**: `Propiedad.belongsTo(Precio, { foreignKey: 'precioId' })` (models/index.js:8)
- **Foreign Key**: `precioId` en tabla Propiedad

#### 3. Categoria o-- Propiedad (Agregación 1:N)
- **Tipo**: Agregación (diamante blanco)
- **Cardinalidad**: 1 Categoría clasifica 0 o muchas Propiedades
- **Justificación**: Categoría es un catálogo de tipos (ej: "Casa", "Departamento", "Garage"). Similar a Precio, las propiedades solo referencian categorías del catálogo pero mantienen su existencia independiente.
- **Implementación**: `Propiedad.belongsTo(Categoria, { foreignKey: 'categoriaId' })` (models/index.js:9)
- **Foreign Key**: `categoriaId` en tabla Propiedad

### Relaciones de Dependencia (Controllers y Helpers):

#### 4. Controllers ..> Modelos/Helpers (Dependencia)
- **Tipo**: Dependencia (línea punteada con flecha)
- **Justificación**: Los controladores USAN los modelos y helpers para realizar operaciones, pero no los contienen ni controlan su ciclo de vida.
- **Ejemplos**:
  - `UsuarioController ..> Usuario`: El controller importa y usa el modelo Usuario
  - `PropiedadController ..> Propiedad`: El controller realiza operaciones CRUD sobre Propiedad
  - `UsuarioController ..> EmailHelper`: El controller usa el helper para enviar emails
  - `PropiedadController ..> SubirImagenMiddleware`: El controller usa el middleware Multer

### Notación UML utilizada:

| Símbolo | Tipo de Relación | Significado |
|---------|------------------|-------------|
| `*--` | Composición | El contenedor controla el ciclo de vida (el todo posee las partes) |
| `o--` | Agregación | El contenedor tiene las partes pero no controla su ciclo de vida |
| `--` | Asociación | Relación entre objetos independientes |
| `..>` | Dependencia | Un elemento usa otro pero no lo contiene |
| `--|>` | Herencia | Relación es-un (no usada en este diagrama) |
| `..|>` | Realización/Implementación | Una clase implementa una interfaz (no usada) |

### Componentes del Sistema:

#### Modelos (Sequelize ORM):
1. **Usuario**: Gestión de usuarios con autenticación bcrypt
2. **Propiedad**: Propiedades inmobiliarias con geolocalización
3. **Categoría**: Clasificación de propiedades (casa, departamento, etc.)
4. **Precio**: Rangos de precios para filtrado

#### Controladores:
1. **UsuarioController**: Maneja autenticación, registro y recuperación de contraseña
2. **PropiedadController**: CRUD de propiedades, gestión de imágenes y publicación

#### Helpers:
1. **EmailHelper**: Envío de correos de registro y recuperación
2. **TokenHelper**: Generación de tokens JWT y IDs únicos

#### Middleware:
1. **ProtegerRutaMiddleware**: Verifica autenticación JWT
2. **SubirImagenMiddleware**: Gestión de carga de imágenes con Multer

## Características Especiales:

- **Seguridad**:
  - Contraseñas hasheadas con bcrypt
  - Protección CSRF  (Cross-Site Request Forgery, o Falsificación de Petición entre Sitios) por token entre el server y foormularios o pages
  - Autenticación JWT

- **Validación**: Express-validator en controladores

- **Almacenamiento**: Imágenes con Multer, carpeta public/

- **Base de datos**: MySQL con Sequelize ORM
