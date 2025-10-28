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

    Usuario "1" --> "0..*" Propiedad : posee
    Precio "1" --> "0..*" Propiedad : categoriza
    Categoria "1" --> "0..*" Propiedad : clasifica

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

### Relaciones de Modelos:
- **Usuario → Propiedad (1:N)**: Un usuario puede tener múltiples propiedades
- **Precio → Propiedad (1:N)**: Un precio puede estar asociado a múltiples propiedades
- **Categoría → Propiedad (1:N)**: Una categoría puede tener múltiples propiedades

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
