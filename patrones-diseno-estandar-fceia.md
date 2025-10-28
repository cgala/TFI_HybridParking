# Documentación de Patrones de Diseño - Estándar FCEIA
## Casual Parkin

**Autores:** Equipo de Desarrollo
**Materia:** Ingeniería de Software
**Año:** 2025

---

## Resumen

A continuación se presenta la documentación del uso de patrones de diseño en el sistema Casual Parking, una aplicación web para la gestión garages. Se documentan cuatro patrones principales: **Singleton** (conexión a base de datos), **MVC** (arquitectura general), **Observer** (sistema de eventos y logging), y **Chain of Responsibility** (middleware de Express). Esta documentación sigue el estándar propuesto por Maximiliano Cristiá para la materia Ingeniería de Software de la FCEIA-UNR.

---

## 1. Patrón Singleton - Conexión a Base de Datos

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern ConexionBaseDatos                                                  │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Singleton                                                         │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Cambio de proveedor de base de datos (MySQL, PostgreSQL, SQLite)      │
│   - Modificación de parámetros de conexión (pool size, timeouts)          │
│   - Migración entre ambientes (desarrollo, testing, producción)           │
│   - Implementación de réplicas o clustering de base de datos              │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Proveer una única instancia de conexión a la base de datos MySQL      │
│   - Gestionar el pool de conexiones de forma centralizada                 │
│   - Permitir que todos los modelos (Usuario, Propiedad, Categoria,        │
│     Precio) compartan la misma configuración de base de datos              │
│   - Sincronizar esquema de base de datos con los modelos Sequelize        │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Debe existir una única instancia de conexión en toda la aplicación    │
│   - La configuración debe ser externa (variables de entorno)               │
│   - Todos los modelos deben usar la misma instancia de Sequelize          │
│   - Optimización de recursos: evitar múltiples conexiones innecesarias    │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Singleton            is db (instancia de Sequelize en config/db.js)     │
│   getInstance()        is import db from './config/db.js'                 │
│   uniqueInstance       is new Sequelize(DB_NOMBRE, DB_USER, DB_PASS)      │
│   singletonOperation() is db.authenticate()                               │
│   singletonOperation() is db.sync()                                       │
│   singletonOperation() is db.define()                                     │
│   Client               is Usuario (models/Usuario.js)                     │
│   Client               is Propiedad (models/Propiedad.js)                 │
│   Client               is Categoria (models/Categoria.js)                 │
│   Client               is Precio (models/Precio.js)                       │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   En JavaScript/ES6, el uso de 'export default db' combinado con el       │
│   sistema de módulos de Node.js garantiza que la instancia de Sequelize   │
│   sea única. Cuando múltiples módulos ejecutan 'import db from            │
│   ./config/db.js', todos reciben la misma referencia al objeto.           │
│                                                                            │
│   El archivo config/db.js (líneas 5-18) crea una única instancia de       │
│   Sequelize con configuración de pool (max: 5, min: 0, acquire: 30000,    │
│   idle: 10000) que es compartida por todos los modelos.                   │
│                                                                            │
│   Los cuatro modelos del sistema (Usuario, Propiedad, Categoria, Precio)  │
│   importan 'db' y lo utilizan para definir sus esquemas mediante          │
│   db.define(), garantizando que todos usen la misma conexión.             │
│                                                                            │
│   En index.js (líneas 23-29) se realiza la autenticación y sincronización │
│   de la base de datos una única vez al iniciar la aplicación.             │
└────────────────────────────────────────────────────────────────────────────┘
```

**Referencias al código:**
- Singleton: `config/db.js:5-18`
- Uso en Usuario: `models/Usuario.js:5`
- Uso en Propiedad: `models/Propiedad.js:2`
- Uso en Categoria: `models/Categoria.js:2`
- Uso en Precio: `models/Precio.js:2`
- Inicialización: `index.js:23-29`

---

## 2. Patrón MVC - Arquitectura General del Sistema

### 2.1 Modelo (Model)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern ModelosDatos                                                       │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Model (del patrón MVC)                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Modificación de esquema de base de datos (agregar/quitar campos)      │
│   - Cambio de validaciones de datos                                        │
│   - Implementación de nuevas relaciones entre entidades                    │
│   - Agregar nuevos modelos (Mensaje, Favorito, Comentario, etc.)          │
│   - Cambio de ORM o migración a otro motor de base de datos               │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Encapsular la lógica de acceso a datos y persistencia                 │
│   - Definir la estructura de las entidades del dominio                    │
│   - Gestionar relaciones entre entidades (1:N entre Usuario-Propiedad)    │
│   - Implementar validaciones de negocio a nivel de datos                  │
│   - Proveer métodos para CRUD de entidades                                │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Los modelos no deben contener lógica de presentación                  │
│   - Deben ser independientes del framework de UI                          │
│   - Encapsular reglas de negocio relacionadas con datos                   │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Model           is Usuario (models/Usuario.js)                          │
│   Model           is Propiedad (models/Propiedad.js)                      │
│   Model           is Categoria (models/Categoria.js)                      │
│   Model           is Precio (models/Precio.js)                            │
│   attributes      is nombre, email, password, token, confirmado           │
│                      (Usuario.js:6-19)                                     │
│   attributes      is titulo, descripcion, techado, alarma, expensa,       │
│                      calle, lat, lng, imagen, publicado                    │
│                      (Propiedad.js:11-51)                                  │
│   operations      is Usuario.findByPk()                                   │
│   operations      is Usuario.findAll()                                    │
│   operations      is Propiedad.create()                                   │
│   operations      is Propiedad.destroy()                                  │
│   customMethod()  is Usuario.verificarPassword() (Usuario.js:40-42)       │
│   hooks           is beforeCreate (Usuario.js:22-25)                      │
│   associations    is Propiedad.belongsTo(Usuario)                         │
│                      (models/index.js:10)                                  │
│   associations    is Propiedad.belongsTo(Precio)                          │
│                      (models/index.js:8)                                   │
│   associations    is Propiedad.belongsTo(Categoria)                       │
│                      (models/index.js:9)                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   Los modelos están implementados usando Sequelize ORM, que proporciona   │
│   una abstracción sobre SQL y facilita el cambio de motor de BD.          │
│                                                                            │
│   El modelo Usuario incluye un hook beforeCreate (línea 22) que hashea    │
│   automáticamente la contraseña usando bcrypt antes de guardarla, y un    │
│   método personalizado verificarPassword() (línea 40) para autenticación. │
│                                                                            │
│   El modelo Propiedad usa UUID como clave primaria (línea 6-9) para       │
│   mayor seguridad y evitar enumeración de propiedades.                    │
│                                                                            │
│   Las relaciones se definen centralizadamente en models/index.js usando   │
│   belongsTo, estableciendo que cada Propiedad pertenece a un Usuario,     │
│   una Categoría y un rango de Precio.                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Vista (View)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern VistasPresentacion                                                 │
├────────────────────────────────────────────────────────────────────────────┤
│ based on View (del patrón MVC)                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Rediseño de interfaz de usuario (cambio de estilos, layouts)          │
│   - Adaptación responsive para diferentes dispositivos                     │
│   - Cambio de motor de templates (de Pug a otro template engine)          │
│   - Internacionalización (múltiples idiomas)                               │
│   - Implementación de nuevas páginas o vistas                             │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Renderizar la interfaz de usuario en formato HTML                     │
│   - Presentar datos recibidos de los controladores                        │
│   - Mostrar formularios para entrada de datos                             │
│   - Visualizar listas de propiedades y detalles                           │
│   - Presentar mensajes de error y validación al usuario                   │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Las vistas no deben contener lógica de negocio                        │
│   - No deben acceder directamente a los modelos                           │
│   - Deben ser independientes de la fuente de datos                        │
│   - Renderizado server-side usando Pug template engine                    │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   View              is views/auth/login.pug                               │
│   View              is views/auth/registro.pug                            │
│   View              is views/auth/olvide-password.pug                     │
│   View              is views/propiedades/admin.pug                        │
│   View              is views/propiedades/crear.pug                        │
│   View              is views/propiedades/editar.pug                       │
│   View              is views/propiedades/agregar-imagen.pug               │
│   Layout            is views/layout/index.pug                             │
│   TemplateEngine    is Pug (configurado en index.js:32-33)               │
│   renderView()      is res.render('nombre-vista', datos)                  │
│   viewData          is { pagina, csrfToken, categorias, precios }         │
│   viewData          is { propiedades, errores, usuario }                  │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   Las vistas están organizadas por módulo funcional: 'auth/' para         │
│   autenticación y 'propiedades/' para gestión de propiedades.             │
│                                                                            │
│   Pug es configurado como motor de vistas en index.js (línea 32-33),      │
│   permitiendo sintaxis simplificada de HTML con indentación.              │
│                                                                            │
│   Todas las vistas reciben csrfToken para protección CSRF, generado       │
│   por el middleware csurf y pasado desde los controladores.               │
│                                                                            │
│   El layout principal (views/layout/index.pug) define la estructura       │
│   común HTML, incluyendo Tailwind CSS para estilos y secciones que        │
│   son reutilizadas por todas las vistas específicas.                      │
│                                                                            │
│   Los datos son pasados desde controladores mediante el segundo           │
│   parámetro de res.render(), ejemplo: propiedadesController.js:43-48      │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Controlador (Controller)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern ControladorPropiedades                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Controller (del patrón MVC)                                       │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Modificación de flujo de navegación entre páginas                     │
│   - Cambio de reglas de validación de formularios                         │
│   - Implementación de nuevas acciones CRUD                                │
│   - Modificación de lógica de autorización                                │
│   - Integración con servicios externos (APIs, storage, email)             │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Intermediar entre modelos (datos) y vistas (presentación)             │
│   - Procesar solicitudes HTTP (GET, POST) de propiedades                  │
│   - Validar datos de entrada de formularios                               │
│   - Coordinar operaciones de creación, edición y eliminación              │
│   - Gestionar subida de imágenes de propiedades                           │
│   - Manejar errores y redireccionamientos                                 │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Los controladores no deben contener lógica de presentación            │
│   - No deben acceder directamente a la base de datos (usan modelos)       │
│   - Cada controlador maneja un conjunto coherente de funcionalidades      │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Controller          is propiedadesController (controllers/              │
│                          propiedadesController.js)                         │
│   Controller          is usuarioController (controllers/                  │
│                          usuarioControllers.js)                            │
│   controllerAction()  is admin (propiedadesController.js:8-31)            │
│   controllerAction()  is crear (propiedadesController.js:34-50)           │
│   controllerAction()  is guardar (propiedadesController.js:52-106)        │
│   controllerAction()  is agregarImagen (propiedadesController.js:108-135) │
│   controllerAction()  is almacenarImagen (propiedadesController.js:       │
│                          137-172)                                          │
│   controllerAction()  is editar (propiedadesController.js:174-205)        │
│   controllerAction()  is guardarCambios (propiedadesController.js:        │
│                          207-268)                                          │
│   controllerAction()  is eliminar (propiedadesController.js:270-299)      │
│   handleRequest()     is async (req, res) => { ... }                      │
│   updateModel()       is Propiedad.create(datos)                          │
│   updateModel()       is propiedad.save()                                 │
│   updateModel()       is propiedad.destroy()                              │
│   renderView()        is res.render('propiedades/crear', datos)           │
│   redirect()          is res.redirect('/mis-propiedades')                 │
│   validation          is validationResult(req) (línea 55)                 │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   PropiedadesController coordina las operaciones CRUD de propiedades.     │
│   Cada método del controlador es una función async que recibe (req, res). │
│                                                                            │
│   El método 'admin' (línea 8) consulta propiedades del usuario usando     │
│   Propiedad.findAll() con relaciones include (Categoria, Precio).         │
│                                                                            │
│   El método 'guardar' (línea 52) valida datos con express-validator,      │
│   crea la propiedad en BD, emite evento Observer (línea 96-99) y          │
│   redirige a agregar imagen.                                              │
│                                                                            │
│   La subida de imágenes se divide en dos métodos: 'agregarImagen'         │
│   (muestra formulario) y 'almacenarImagen' (procesa archivo).             │
│                                                                            │
│   UsuarioController (usuarioControllers.js) maneja autenticación,         │
│   registro, recuperación de contraseña, usando helpers como EmailHelper   │
│   y TokenHelper para funcionalidades auxiliares.                          │
│                                                                            │
│   Los controladores están conectados a rutas en routes/                   │
│   propiedadesRoutes.js y routes/usuarioRoutes.js mediante Router de       │
│   Express.                                                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern ControladorUsuarios                                                │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Controller (del patrón MVC)                                       │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos: modificación de flujo de autenticación, cambio de    │
│   proveedor de email, implementación de OAuth, cambio de estrategia de    │
│   tokens (JWT a sesiones), integración con servicios de autenticación     │
│   externos (Google, Facebook).                                            │
│                                                                            │
│   Funcionalidad: gestionar registro de usuarios, autenticación (login),   │
│   cierre de sesión, recuperación de contraseña, confirmación de cuenta    │
│   por email, generación y validación de tokens JWT.                       │
│                                                                            │
│   Restricciones de diseño: la contraseña debe hashearse antes de guardar, │
│   los tokens deben tener expiración, el email de confirmación debe        │
│   enviarse automáticamente, la sesión se gestiona mediante JWT en         │
│   cookies HTTP-only.                                                       │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Controller          is usuarioController (controllers/                  │
│                          usuarioControllers.js)                            │
│   controllerAction()  is formularioLogin                                  │
│   controllerAction()  is autenticar                                       │
│   controllerAction()  is cerrarSesion                                     │
│   controllerAction()  is formularioRegistro                               │
│   controllerAction()  is registrar                                        │
│   controllerAction()  is confirmar                                        │
│   controllerAction()  is formularioOlvidePassword                         │
│   controllerAction()  is resetPassword                                    │
│   controllerAction()  is comprobarToken                                   │
│   controllerAction()  is nuevoPassword                                    │
│   updateModel()       is Usuario.create()                                 │
│   updateModel()       is usuario.save()                                   │
│   authenticateUser()  is usuario.verificarPassword(password)              │
│   generateToken()     is generarJWT({id: usuario.id})                     │
│   sendEmail()         is emailRegistro(datos)                             │
│   sendEmail()         is emailOlvidePassword(datos)                       │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   UsuarioController usa helpers externos (EmailHelper para envío de       │
│   correos, TokenHelper para generación de tokens JWT y IDs únicos).       │
│                                                                            │
│   El método verificarPassword() es un método personalizado del modelo     │
│   Usuario que usa bcrypt.compareSync() para comparar contraseñas.         │
│                                                                            │
│   Los tokens JWT se almacenan en cookies HTTP-only configuradas en el     │
│   método 'autenticar', proporcionando seguridad contra XSS.               │
└────────────────────────────────────────────────────────────────────────────┘
```

**Referencias al código MVC:**
- Modelos: `models/Usuario.js`, `models/Propiedad.js`, `models/Categoria.js`, `models/Precio.js`
- Relaciones: `models/index.js:8-10`
- Vistas: `views/auth/`, `views/propiedades/`
- Controladores: `controllers/propiedadesController.js`, `controllers/usuarioControllers.js`
- Configuración Pug: `index.js:32-33`
- Rutas: `routes/propiedadesRoutes.js`, `routes/usuarioRoutes.js`

---

## 3. Patrón Observer - Sistema de Eventos y Logging

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern SistemaEventosLogging                                              │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Observer                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Agregar nuevos observadores (envío de emails, notificaciones push,    │
│     analytics, auditoría de seguridad)                                     │
│   - Modificar destino de logs (archivo, base de datos, servicio externo)  │
│   - Implementar nuevos eventos del sistema (userRegistered,               │
│     propertyPublished, imageUploaded, etc.)                                │
│   - Cambiar formato de logs (JSON, CSV, syslog)                           │
│   - Remover observadores sin afectar la lógica de negocio                 │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Registrar eventos importantes del sistema (creación de propiedad,     │
│     eliminación, login de usuarios)                                        │
│   - Escribir logs en archivo de texto (logs/log.txt)                      │
│   - Desacoplar la lógica de logging de los controladores                  │
│   - Permitir múltiples observadores para un mismo evento                  │
│   - Facilitar auditoría y debugging del sistema                           │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Los observadores no deben bloquear la ejecución de los controladores  │
│   - El sistema debe funcionar correctamente aunque fallen los observers   │
│   - Los eventos deben ser síncronos pero no afectar el flujo principal    │
│   - El emisor de eventos no debe conocer a los observadores concretos     │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Subject             is emitter (EventEmitter en helpers/eventEmitter.js)│
│   Observer            is writeLog function (eventEmitter.js:22-26)        │
│   ConcreteObserver    is propertyCreated listener (eventEmitter.js:31-37) │
│   ConcreteObserver    is propertyDeleted listener (eventEmitter.js:40-45) │
│   ConcreteObserver    is userLoggedIn listener (eventEmitter.js:48-53)    │
│   attach()            is emitter.on('eventName', callback)                │
│   notify()            is emitter.emit('eventName', data)                  │
│   update()            is function(data) { writeLog(...) }                 │
│   observerState       is logFilePath (eventEmitter.js:13)                 │
│   subjectState        is payload de evento {id, titulo} o {email, nombre} │
│   Publisher           is PropiedadController (propiedadesController.js:1) │
│   Publisher           is UsuarioController (usuarioControllers.js)        │
│   notifyObservers()   is emitter.emit('propertyCreated', propiedad)       │
│                          (propiedadesController.js:96-99)                  │
│   notifyObservers()   is emitter.emit('propertyDeleted', propiedad)       │
│                          (propiedadesController.js:290-293)                │
│   notifyObservers()   is emitter.emit('userLoggedIn', usuario)            │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   El patrón Observer está implementado usando la clase EventEmitter       │
│   nativa de Node.js (helpers/eventEmitter.js línea 4), que proporciona    │
│   los métodos on() para suscribir observadores y emit() para notificarlos.│
│                                                                            │
│   Los observadores se suscriben explícitamente en el archivo              │
│   eventEmitter.js (líneas 31, 40, 48) usando emitter.on('evento',        │
│   callback), estableciendo qué función se ejecutará cuando ocurra el      │
│   evento específico.                                                       │
│                                                                            │
│   La función writeLog() (línea 22-26) es el comportamiento común de todos │
│   los observadores: recibe el nombre del evento y los datos, genera un    │
│   timestamp ISO, formatea la entrada como JSON y la escribe en el archivo │
│   logs/log.txt usando fs.appendFileSync().                                │
│                                                                            │
│   Los controladores actúan como Publishers: PropiedadController emite     │
│   'propertyCreated' después de crear una propiedad (línea 96-99) y        │
│   'propertyDeleted' antes de destruirla (línea 290-293). Estos            │
│   controladores importan el emitter y llaman emit() en momentos clave.    │
│                                                                            │
│   El desacoplamiento es completo: los controladores solo conocen el       │
│   emitter y los nombres de eventos, no saben qué observadores están       │
│   suscritos. Se pueden agregar nuevos observers (envío de emails,         │
│   notificaciones) sin modificar los controladores.                        │
│                                                                            │
│   Ejemplo de log generado: "2025-01-15T10:30:00.000Z [propertyCreated]    │
│   {"id":"a1b2c3","titulo":"Garage en Centro"}"                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Referencias al código:**
- Subject (EventEmitter): `helpers/eventEmitter.js:9`
- Observers (listeners): `helpers/eventEmitter.js:31-53`
- Función writeLog: `helpers/eventEmitter.js:22-26`
- Emisión propertyCreated: `controllers/propiedadesController.js:96-99`
- Emisión propertyDeleted: `controllers/propiedadesController.js:290-293`
- Import en controller: `controllers/propiedadesController.js:2`

---

## 4. Patrón Chain of Responsibility - Middleware de Express

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Pattern CadenaMiddlewarePropiedades                                        │
├────────────────────────────────────────────────────────────────────────────┤
│ based on Chain of Responsibility                                           │
├────────────────────────────────────────────────────────────────────────────┤
│ because                                                                    │
│                                                                            │
│   Cambios previstos:                                                       │
│   - Agregar nuevos middlewares (rate limiting, compression, logging)      │
│   - Modificar orden de ejecución de middlewares                           │
│   - Cambiar estrategia de autenticación (JWT a OAuth)                     │
│   - Implementar middlewares de caché o transformación de respuestas       │
│   - Remover middlewares sin afectar otros en la cadena                    │
│   - Agregar validaciones personalizadas por ruta                          │
│                                                                            │
│   Funcionalidad:                                                           │
│   - Procesar solicitudes HTTP en múltiples etapas secuenciales            │
│   - Parsear cookies para autenticación (CookieParser)                     │
│   - Validar tokens CSRF para prevenir ataques (CSRF)                      │
│   - Verificar autenticación JWT del usuario (ProtegerRuta)                │
│   - Validar campos de formularios (Express-Validator)                     │
│   - Procesar subida de archivos/imágenes (Multer)                         │
│   - Ejecutar controlador final si todas las validaciones pasan            │
│                                                                            │
│   Restricciones de diseño:                                                 │
│   - Cada middleware debe ser independiente y reutilizable                 │
│   - Un middleware puede terminar la cadena (enviar respuesta) o           │
│     continuar al siguiente (llamar next())                                 │
│   - El orden de middlewares es crítico (ej: cookieParser antes de CSRF)  │
│   - Los middlewares deben poder modificar req/res para siguientes         │
│   - Manejo de errores sin romper la cadena                                │
├────────────────────────────────────────────────────────────────────────────┤
│ where                                                                      │
│                                                                            │
│   Handler               is Middleware (concepto general de Express)       │
│   ConcreteHandler       is cookieParser (middleware, index.js:17)         │
│   ConcreteHandler       is csurf (middleware, index.js:20)                │
│   ConcreteHandler       is protegerRuta (middleware/protegerRuta.js)      │
│   ConcreteHandler       is express-validator (body validations,           │
│                            propiedadesRoutes.js:15-22)                     │
│   ConcreteHandler       is upload.single('imagen') (middleware/           │
│                            subirimagen.js, propiedadesRoutes.js:29)        │
│   ConcreteHandler       is PropiedadController.guardar (controlador       │
│                            final, propiedadesController.js:52)             │
│   handleRequest()       is (req, res, next) => { ... }                    │
│   setSuccessor()        is app.use(middleware) o router.METHOD(path, mw)  │
│   successor             is next (función callback de Express)             │
│   canHandle()           is condiciones if dentro de cada middleware       │
│   passToSuccessor()     is next() o next(error)                           │
│   terminateChain()      is res.send(), res.redirect(), res.render()       │
├────────────────────────────────────────────────────────────────────────────┤
│ where (ejemplo cadena específica: POST /propiedades/crear)                │
│                                                                            │
│   Handler1              is cookieParser (parsea cookies del request)      │
│   Handler2              is csurf (valida token CSRF de cookie)            │
│   Handler3              is protegerRuta (verifica JWT, carga usuario)     │
│   Handler4              is body('titulo').notEmpty() (valida título)      │
│   Handler5              is body('descripcion').notEmpty() (valida desc)   │
│   Handler6              is body('categoria').isNumeric() (valida cat)     │
│   Handler7              is body('precio').isNumeric() (valida precio)     │
│   Handler8              is body('techado').isIn() (valida techado)        │
│   Handler9              is body('alarma').isIn() (valida alarma)          │
│   Handler10             is body('expensa').isIn() (valida expensa)        │
│   Handler11             is body('lat').isNumeric() (valida ubicación)     │
│   Handler12             is guardar (controlador final que procesa todo)   │
├────────────────────────────────────────────────────────────────────────────┤
│ comments                                                                   │
│                                                                            │
│   Express implementa Chain of Responsibility mediante su sistema de       │
│   middlewares. Cada middleware recibe (req, res, next) donde 'next' es    │
│   la función que invoca al siguiente manejador en la cadena.              │
│                                                                            │
│   MIDDLEWARE GLOBAL (index.js):                                           │
│   Los middlewares globales (líneas 13, 17, 20) se aplican a todas las    │
│   rutas: express.urlencoded() parsea body, cookieParser() parsea cookies, │
│   csurf() valida tokens CSRF. Estos forman la base de la cadena.          │
│                                                                            │
│   MIDDLEWARE PROTEGERRUTA (middleware/protegerRuta.js):                   │
│   Implementa tres verificaciones secuenciales: 1) Verifica existencia del │
│   token _token en cookies (línea 7-10), si no existe termina la cadena   │
│   con redirect. 2) Verifica validez del JWT usando jwt.verify (línea 14). │
│   3) Carga usuario desde BD (línea 15). Si todo pasa, adjunta req.usuario │
│   (línea 19) y llama next() (línea 23) continuando la cadena.             │
│                                                                            │
│   MIDDLEWARE VALIDACIONES (propiedadesRoutes.js:15-22):                   │
│   Express-validator agrega múltiples middlewares de validación en cadena. │
│   Cada body('campo') agrega un middleware que valida ese campo. Todos se  │
│   ejecutan y acumulan errores en req. El controlador los verifica con     │
│   validationResult(req) (propiedadesController.js:55).                    │
│                                                                            │
│   MIDDLEWARE SUBIRIMAGEN (middleware/subirimagen.js):                     │
│   Usa Multer para procesar multipart/form-data. Configura storage con     │
│   diskStorage definiendo destination (./public/uploads/) y filename       │
│   (timestamp + nombre original). upload.single('imagen') procesa un       │
│   archivo y lo adjunta a req.file, luego llama next().                    │
│                                                                            │
│   CONTROLADOR FINAL:                                                       │
│   El controlador es el último en la cadena. Puede: 1) Terminar con éxito  │
│   (res.redirect), 2) Renderizar vista con errores (res.render), 3) Llamar │
│   next() si hay más middlewares (como en almacenarImagen que llama next() │
│   en línea 167 después de guardar la imagen).                             │
│                                                                            │
│   MANEJO DE ERRORES:                                                       │
│   Si un middleware lanza error o llama next(error), Express salta todos   │
│   los handlers normales y busca middleware de manejo de errores           │
│   (signature: (err, req, res, next) => {}). En protegerRuta, el catch     │
│   (línea 25-27) limpia la cookie y redirige en caso de JWT inválido.      │
│                                                                            │
│   EJEMPLO DE FLUJO COMPLETO:                                               │
│   POST /propiedades/crear → cookieParser → csurf → protegerRuta →         │
│   [si no autenticado: redirect /auth/login, termina cadena]               │
│   [si autenticado: req.usuario = {...}, continúa] →                       │
│   11 validadores de express-validator → guardar (controlador) →           │
│   [si errores validación: renderiza crear.pug con errores, termina]       │
│   [si todo OK: Propiedad.create(), emit event, redirect, termina]         │
└────────────────────────────────────────────────────────────────────────────┘
```

**Referencias al código:**
- Middleware global cookieParser: `index.js:17`
- Middleware global CSRF: `index.js:20`
- Middleware protegerRuta: `middleware/protegerRuta.js:4-32`
- Middleware subirImagen (Multer): `middleware/subirimagen.js:3-13`
- Cadena de validadores: `routes/propiedadesRoutes.js:15-23`
- Uso de next(): `middleware/protegerRuta.js:23`
- Controlador final: `controllers/propiedadesController.js:52-106`

---

## 5. Relaciones entre Patrones

Los cuatro patrones documentados interactúan entre sí formando la arquitectura completa del sistema:

1. **Singleton (BD) ← Model (MVC)**: Los modelos del patrón MVC usan la instancia única de Sequelize del Singleton para acceder a la base de datos.

2. **Controller (MVC) → Observer**: Los controladores actúan como Publishers en el patrón Observer, emitiendo eventos después de operaciones importantes.

3. **Chain of Responsibility → Controller (MVC)**: Los middlewares procesan y validan las solicitudes antes de que lleguen a los controladores del patrón MVC.

4. **Chain of Responsibility → Observer**: El middleware protegerRuta adjunta req.usuario, que luego es usado por controladores que emiten eventos Observer.

5. **Model (MVC) ← Singleton**: Usuario, Propiedad, Categoria y Precio importan 'db' del Singleton para definir sus esquemas.

6. **Controller (MVC) → View (MVC)**: Los controladores pasan datos procesados a las vistas mediante res.render().

```
Diagrama de interacciones:

     ┌──────────────┐
     │   Request    │
     └──────┬───────┘
            │
            v
     ┌──────────────────────────────────────┐
     │  Chain of Responsibility             │
     │  (Middleware)                        │
     │  ┌─────────────────────────────────┐ │
     │  │ cookieParser → csurf →          │ │
     │  │ protegerRuta → validators       │ │
     │  └─────────────────────────────────┘ │
     └──────────────┬───────────────────────┘
                    │
                    v
     ┌──────────────────────────────────────┐
     │  MVC - Controller                    │
     │  (PropiedadController,               │
     │   UsuarioController)                 │
     └──────┬──────────────┬────────────────┘
            │              │
            │              └──────────────────┐
            v                                 v
     ┌─────────────┐                   ┌─────────────┐
     │  Observer   │                   │  MVC Model  │
     │  (Emitter)  │                   │  (Entidades)│
     │             │                   │             │
     │  emit()     │                   │  find()     │
     │  events     │                   │  create()   │
     │             │                   │  destroy()  │
     └─────────────┘                   └──────┬──────┘
                                              │
                                              v
                                       ┌─────────────┐
                                       │  Singleton  │
                                       │  (db)       │
                                       │             │
                                       │  Sequelize  │
                                       │  instance   │
                                       └──────┬──────┘
                                              │
                                              v
                                       ┌─────────────┐
                                       │   MySQL     │
                                       │  Database   │
                                       └─────────────┘
            ┌────────────────────────────────┘
            v
     ┌──────────────┐
     │  MVC - View  │
     │  (Pug)       │
     └──────┬───────┘
            │
            v
     ┌──────────────┐
     │   Response   │
     └──────────────┘
```

---

## Referencias

[1] Gamma, E., Helm, R., Johnson, R., Vlissides, J. *Patrones de diseño*. Addison Wesley, 2003.

[2] Cristiá, M. *Estándar para documentar el uso de patrones de diseño en un diseño de software*. FCEIA-UNR, 2015.

[3] Express.js Documentation. *Using middleware*. https://expressjs.com/en/guide/using-middleware.html

[4] Sequelize Documentation. *Getting Started*. https://sequelize.org/docs/v6/getting-started/

[5] Node.js Documentation. *Events*. https://nodejs.org/api/events.html

---

## Apéndice: Estructura de Directorios

```
casualTFI/
├── config/
│   └── db.js                  # Patrón Singleton
├── controllers/
│   ├── propiedadesController.js   # MVC Controller + Observer Publisher
│   └── usuarioControllers.js      # MVC Controller
├── middleware/
│   ├── protegerRuta.js        # Chain of Responsibility
│   └── subirimagen.js         # Chain of Responsibility
├── models/
│   ├── Usuario.js             # MVC Model
│   ├── Propiedad.js           # MVC Model
│   ├── Categoria.js           # MVC Model
│   ├── Precio.js              # MVC Model
│   └── index.js               # Relaciones entre modelos
├── views/
│   ├── auth/                  # MVC View
│   ├── propiedades/           # MVC View
│   └── layout/                # MVC View
├── helpers/
│   ├── eventEmitter.js        # Patrón Observer
│   ├── emails.js
│   └── tokens.js
├── routes/
│   ├── propiedadesRoutes.js   # Define cadenas de middleware
│   └── usuarioRoutes.js
├── logs/
│   └── log.txt                # Destino de Observer
└── index.js                   # Configuración global de middlewares
```

---

**Fin del documento**
