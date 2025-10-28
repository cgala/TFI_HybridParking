# Patrones de Diseño 

Este documento describe los principales patrones de diseño implementados en el proyecto casualTFI, una aplicación web de gestión de propiedades inmobiliarias.

---

## 1. Patrón Singleton - Conexión a Base de Datos

### Descripción
El patrón **Singleton** garantiza que una clase tenga una única instancia y proporciona un punto de acceso global a ella. En este proyecto, se usa para la conexión a la base de datos MySQL.

### Implementación
Archivo: `config/db.js`

```javascript
import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const db = new Sequelize(process.env.DB_NOMBRE, process.env.DB_USER, process.env.DB_PASS,{
    host:process.env.DB_HOST,
    port:3306,
    dialect: 'mysql',
    define: {
        timestamps:true
    },
    pool: {
        max:5,
        min:0,
        acquire: 30000,
        idle:10000
    },
});

export default db;
```

### Diagrama de Clases

```mermaid
classDiagram
    class Sequelize {
        <<Singleton>>
        -static instance: Sequelize
        +constructor(database, user, password, options)
        +authenticate()
        +sync()
        +define(modelName, attributes)
    }

    class DatabaseConfig {
        -host: String
        -port: Number
        -dialect: String
        -pool: Object
        +getConnection() Sequelize
    }

    class Usuario {
        +static db: Sequelize
    }

    class Propiedad {
        +static db: Sequelize
    }

    class Categoria {
        +static db: Sequelize
    }

    class Precio {
        +static db: Sequelize
    }

    DatabaseConfig --> Sequelize : usa única instancia
    Usuario --> Sequelize : importa
    Propiedad --> Sequelize : importa
    Categoria --> Sequelize : importa
    Precio --> Sequelize : importa

    note for Sequelize "Una única instancia de conexión\nse comparte en toda la aplicación"
```

### Beneficios
- **Única conexión**: Todos los modelos comparten la misma instancia de Sequelize
- **Pool de conexiones**: Optimiza el uso de recursos con un pool configurado (max: 5, min: 0)
- **Configuración centralizada**: Todos los parámetros de conexión en un solo lugar
- **Reutilización**: Se importa en todos los modelos sin crear nuevas instancias

### Diagrama de Flujo

```mermaid
flowchart TD
    A[Aplicación inicia] --> B[Carga config/db.js]
    B --> C{¿Existe instancia<br/>de Sequelize?}
    C -->|No| D[Crea nueva instancia<br/>con configuración]
    C -->|Sí| E[Usa instancia existente]
    D --> F[Exporta instancia única]
    E --> F
    F --> G[Modelos importan db]
    G --> H[Usuario.js usa db]
    G --> I[Propiedad.js usa db]
    G --> J[Categoria.js usa db]
    G --> K[Precio.js usa db]
    H --> L[Todos usan la misma conexión]
    I --> L
    J --> L
    K --> L
```

---

## 2. Patrón MVC (Model-View-Controller)

### Descripción
El patrón **MVC** separa la aplicación en tres componentes principales:
- **Model (Modelo)**: Gestión de datos y lógica de negocio
- **View (Vista)**: Presentación e interfaz de usuario
- **Controller (Controlador)**: Intermediario que maneja la lógica de aplicación

### Arquitectura del Proyecto

```mermaid
graph TB
    subgraph Cliente
        A[Navegador Web]
    end

    subgraph "Capa de Enrutamiento"
        B[Routes<br/>propiedadesRoutes.js<br/>usuarioRoutes.js]
    end

    subgraph "Controladores - Controller"
        C[PropiedadController]
        D[UsuarioController]
    end

    subgraph "Modelos - Model"
        E[(Usuario)]
        F[(Propiedad)]
        G[(Categoria)]
        H[(Precio)]
    end

    subgraph "Vistas - View"
        I[Templates Pug<br/>auth/, propiedades/]
    end

    subgraph "Base de Datos"
        J[(MySQL)]
    end

    A -->|HTTP Request| B
    B --> C
    B --> D
    C --> E
    C --> F
    C --> G
    C --> H
    D --> E
    E --> J
    F --> J
    G --> J
    H --> J
    C -->|Renderiza| I
    D -->|Renderiza| I
    I -->|HTTP Response| A

    style C fill:#90EE90
    style D fill:#90EE90
    style E fill:#FFB6C1
    style F fill:#FFB6C1
    style G fill:#FFB6C1
    style H fill:#FFB6C1
    style I fill:#87CEEB
```

### Componentes Detallados

#### Modelos (Model)
Ubicación: `models/`

```mermaid
classDiagram
    class Usuario {
        +String nombre
        +String email
        +String password
        +String token
        +Boolean confirmado
        +verificarPassword(password)
    }

    class Propiedad {
        +UUID id
        +String titulo
        +String descripcion
        +String techado
        +String alarma
        +String expensa
        +String calle
        +String lat, lng
        +String imagen
        +Boolean publicado
    }

    class Categoria {
        +String nombre
    }

    class Precio {
        +String nombre
    }

    Usuario "1" --> "0..*" Propiedad : posee
    Categoria "1" --> "0..*" Propiedad : clasifica
    Precio "1" --> "0..*" Propiedad : categoriza
```

#### Vistas (View)
Ubicación: `views/`

```
views/
├── auth/
│   ├── login.pug
│   ├── registro.pug
│   └── olvide-password.pug
├── propiedades/
│   ├── admin.pug
│   ├── crear.pug
│   ├── editar.pug
│   └── agregar-imagen.pug
├── layout/
│   └── index.pug
└── templates/
```

#### Controladores (Controller)
Ubicación: `controllers/`

```mermaid
classDiagram
    class PropiedadController {
        +admin(req, res)
        +crear(req, res)
        +guardar(req, res)
        +agregarImagen(req, res)
        +almacenarImagen(req, res)
        +editar(req, res)
        +guardarCambios(req, res)
        +eliminar(req, res)
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
```

### Flujo de Datos MVC

```mermaid
sequenceDiagram
    participant U as Usuario
    participant R as Router
    participant C as Controller
    participant M as Model
    participant V as View
    participant DB as Database

    U->>R: GET /propiedades/crear
    R->>C: propiedadesController.crear()
    C->>M: Categoria.findAll()
    M->>DB: SELECT * FROM categorias
    DB-->>M: Datos de categorías
    M-->>C: Retorna categorías
    C->>M: Precio.findAll()
    M->>DB: SELECT * FROM precios
    DB-->>M: Datos de precios
    M-->>C: Retorna precios
    C->>V: render('propiedades/crear', datos)
    V-->>U: HTML renderizado

    U->>R: POST /propiedades/crear
    R->>C: propiedadesController.guardar()
    C->>C: validationResult(req)
    C->>M: Propiedad.create(datos)
    M->>DB: INSERT INTO propiedades
    DB-->>M: Propiedad creada
    M-->>C: Retorna propiedad
    C-->>U: redirect('/propiedades/agregar-imagen/:id')
```

---

## 3. Patrón Observer - Event Emitter

### Descripción
El patrón **Observer** define una dependencia uno-a-muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados automáticamente.

### Implementación
Archivo: `helpers/eventEmitter.js`

```javascript
import { EventEmitter } from 'events';
import fs from 'fs';

// Sujeto del patrón Observer
const emitter = new EventEmitter();

// Observador: escribe logs cuando ocurren eventos
function writeLog(eventName, payload) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${eventName}] ${JSON.stringify(payload)}\n`;
  fs.appendFileSync(logFilePath, logEntry);
}

// Suscripción de observadores
emitter.on('propertyCreated', function(propiedad) {
  writeLog('propertyCreated', {
    id: propiedad.id,
    titulo: propiedad.titulo
  });
});

emitter.on('propertyDeleted', function(propiedad) {
  writeLog('propertyDeleted', {
    id: propiedad.id,
    titulo: propiedad.titulo
  });
});

emitter.on('userLoggedIn', function(usuario) {
  writeLog('userLoggedIn', {
    email: usuario.email,
    nombre: usuario.nombre
  });
});

export default emitter;
```

### Diagrama de Clases

```mermaid
classDiagram
    class EventEmitter {
        <<Subject>>
        +on(event, listener)
        +emit(event, data)
        +removeListener(event, listener)
    }

    class PropiedadController {
        <<Publisher>>
        -emitter: EventEmitter
        +guardar()
        +eliminar()
    }

    class UsuarioController {
        <<Publisher>>
        -emitter: EventEmitter
        +autenticar()
    }

    class LogObserver {
        <<Observer>>
        +writeLog(eventName, payload)
        +handlePropertyCreated(propiedad)
        +handlePropertyDeleted(propiedad)
        +handleUserLoggedIn(usuario)
    }

    class FileSystem {
        +appendFileSync(path, data)
    }

    EventEmitter <-- PropiedadController : usa
    EventEmitter <-- UsuarioController : usa
    EventEmitter --> LogObserver : notifica
    LogObserver --> FileSystem : escribe

    note for EventEmitter "Mantiene lista de observers\ny los notifica cuando\nocurre un evento"
    note for LogObserver "Reacciona a eventos\nescribiendo en log.txt"
```

### Diagrama de Secuencia

```mermaid
sequenceDiagram
    participant PC as PropiedadController
    participant EM as EventEmitter
    participant LO as LogObserver
    participant FS as FileSystem

    Note over PC: Usuario crea propiedad
    PC->>PC: Propiedad.create(datos)
    PC->>EM: emit('propertyCreated', datos)
    EM->>LO: propertyCreated event
    LO->>LO: writeLog('propertyCreated', datos)
    LO->>FS: appendFileSync('log.txt', entry)
    FS-->>LO: Archivo actualizado

    Note over PC: Usuario elimina propiedad
    PC->>PC: propiedad.destroy()
    PC->>EM: emit('propertyDeleted', datos)
    EM->>LO: propertyDeleted event
    LO->>LO: writeLog('propertyDeleted', datos)
    LO->>FS: appendFileSync('log.txt', entry)
    FS-->>LO: Archivo actualizado
```

### Uso en Controladores

**Emisión de eventos** (propiedadesController.js:96-99)
```javascript
// Al crear una propiedad
emitter.emit('propertyCreated', {
    id: id,
    titulo: titulo
});

// Al eliminar una propiedad (línea 290-293)
emitter.emit('propertyDeleted', {
    id: propiedad.id,
    titulo: propiedad.titulo
});
```

### Beneficios
- **Desacoplamiento**: Los controladores no necesitan conocer la lógica de logging
- **Escalabilidad**: Fácil agregar nuevos observadores sin modificar publicadores
- **Mantenibilidad**: Lógica de logging centralizada en un solo lugar
- **Flexibilidad**: Se pueden agregar/quitar observers en tiempo de ejecución

---

## 4. Patrón Cadena de Responsabilidad - Middleware

### Descripción
El patrón **Cadena de Responsabilidad** permite pasar solicitudes a lo largo de una cadena de manejadores. Cada manejador decide si procesa la solicitud o la pasa al siguiente.

### Implementación en Express
Los middlewares en Express implementan este patrón. Cada middleware puede:
1. Procesar la petición
2. Modificar req/res
3. Finalizar el ciclo (enviar respuesta)
4. Pasar al siguiente con `next()`

### Middlewares del Proyecto

```mermaid
classDiagram
    class Middleware {
        <<interface>>
        +handle(req, res, next)
    }

    class CookieParser {
        +handle(req, res, next)
        +parseCookies()
    }

    class CSRF {
        +handle(req, res, next)
        +validateToken()
    }

    class ProtegerRuta {
        +handle(req, res, next)
        +verifyJWT()
        +loadUser()
    }

    class ExpressValidator {
        +handle(req, res, next)
        +validateFields()
    }

    class SubirImagen {
        +handle(req, res, next)
        +processUpload()
    }

    class Controller {
        +handle(req, res)
        +finalResponse()
    }

    Middleware <|.. CookieParser
    Middleware <|.. CSRF
    Middleware <|.. ProtegerRuta
    Middleware <|.. ExpressValidator
    Middleware <|.. SubirImagen
    Middleware <|.. Controller
```

### Cadena de Middlewares en Ruta Protegida

Archivo: `routes/propiedadesRoutes.js`

```javascript
router.post('/propiedades/crear',
    protegerRuta,                    // 1. Verifica autenticación
    body('titulo').notEmpty(),       // 2. Valida título
    body('descripcion').notEmpty(),  // 3. Valida descripción
    body('categoria').isNumeric(),   // 4. Valida categoría
    body('precio').isNumeric(),      // 5. Valida precio
    guardar)                         // 6. Controlador final
```

### Diagrama de Flujo

```mermaid
flowchart TD
    A[Request: POST /propiedades/crear] --> B{cookieParser}
    B -->|next| C{csurf}
    C -->|next| D{protegerRuta}
    D -->|No autenticado| E[redirect /auth/login]
    D -->|Autenticado| F{express-validator<br/>body validations}
    F -->|Errores| G[Renderiza formulario<br/>con errores]
    F -->|Sin errores| H[guardar - Controller]
    H --> I{Validación final}
    I -->|Error| J[Renderiza con errores]
    I -->|Éxito| K[Crea propiedad en DB]
    K --> L[Emite evento Observer]
    L --> M[redirect /propiedades/agregar-imagen/:id]

    style D fill:#FFE4B5
    style F fill:#FFE4B5
    style H fill:#90EE90
```

### Middleware: protegerRuta

Archivo: `middleware/protegerRuta.js`

```javascript
const protegerRuta = async (req, res, next) => {
    // 1. Verificar existencia de token
    const { _token } = req.cookies
    if(!_token){
        return res.redirect('/auth/login')  // Termina cadena
    }

    try {
        // 2. Verificar validez del token
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)

        // 3. Cargar usuario desde BD
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)

        if(usuario) {
            // 4. Adjuntar usuario al request
            req.usuario = usuario
        } else {
            return res.redirect('/auth/login')  // Termina cadena
        }

        // 5. Pasar al siguiente middleware
        return next();

    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')
    }
}
```

### Middleware: SubirImagen

Archivo: `middleware/subirimagen.js`

```javascript
import multer from 'multer'

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

export default upload
```

### Diagrama de Secuencia Completo

```mermaid
sequenceDiagram
    participant C as Cliente
    participant CP as CookieParser
    participant CS as CSRF
    participant PR as ProtegerRuta
    participant EV as ExpressValidator
    participant SI as SubirImagen
    participant CT as Controller
    participant DB as Database

    C->>CP: POST /propiedades/agregar-imagen/:id
    CP->>CP: Parse cookies
    CP->>CS: next()
    CS->>CS: Validate CSRF token
    CS->>PR: next()
    PR->>PR: Verify JWT from cookie
    PR->>DB: Load user data
    DB-->>PR: Usuario
    PR->>PR: Attach req.usuario
    PR->>SI: next()
    SI->>SI: Process file upload
    SI->>SI: Save to /public/uploads/
    SI->>CT: next()
    CT->>DB: Update propiedad.imagen
    DB-->>CT: Success
    CT-->>C: redirect('/mis-propiedades')
```

### Beneficios del Patrón

- **Separación de responsabilidades**: Cada middleware tiene una única función
- **Reutilización**: Middlewares como `protegerRuta` se usan en múltiples rutas
- **Orden flexible**: Se pueden reorganizar según necesidades
- **Fácil testing**: Cada middleware se puede probar de forma aislada
- **Extensibilidad**: Agregar nuevo middleware sin modificar existentes

### Ejemplo de Cadena Completa

```javascript
// Ruta con cadena de 6 middlewares
router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,              // 1. Autenticación
    upload.single('imagen'),   // 2. Subida de archivo
    almacenarImagen           // 3. Controlador final
)
```

---

## Resumen de Patrones

| Patrón | Ubicación | Propósito | Beneficio Principal |
|--------|-----------|-----------|---------------------|
| **Singleton** | `config/db.js` | Única instancia de BD | Optimización de recursos |
| **MVC** | `models/`, `views/`, `controllers/` | Separación de capas | Mantenibilidad |
| **Observer** | `helpers/eventEmitter.js` | Sistema de eventos | Desacoplamiento |
| **Cadena de Responsabilidad** | `middleware/` | Pipeline de request | Modularidad |

---

## Interacción entre Patrones

```mermaid
graph TB
    subgraph "Patrón MVC"
        V[Views - Pug]
        C[Controllers]
        M[Models]
    end

    subgraph "Patrón Singleton"
        DB[(Database<br/>Sequelize)]
    end

    subgraph "Patrón Observer"
        EE[EventEmitter]
        LOG[Log System]
    end

    subgraph "Patrón Cadena"
        MW1[CookieParser]
        MW2[CSRF]
        MW3[ProtegerRuta]
        MW4[Validators]
    end

    MW1 --> MW2 --> MW3 --> MW4 --> C
    C --> M
    M --> DB
    C --> EE
    EE --> LOG
    C --> V

    style DB fill:#FFE4B5
    style EE fill:#FFB6C1
    style C fill:#90EE90
    style MW3 fill:#87CEEB
```

Este diseño arquitectónico permite:
- **Escalabilidad**: Fácil agregar nuevas funcionalidades
- **Mantenibilidad**: Código organizado y separado
- **Testabilidad**: Componentes independientes
- **Reutilización**: Patrones aplicables en múltiples contextos
