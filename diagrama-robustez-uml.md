# Diagramas de Robustez UML - Sistema de Gestión de Propiedades Inmobiliarias

## Introducción

Los diagramas de robustez son parte de la metodología ICONIX y sirven como puente entre los casos de uso y los diagramas de secuencia. Utilizan **tres estereotipos principales** según la notación UML estándar:

### Notación UML Estándar:

```
┌─────────────────┬──────────────────────────┬─────────────────────────────────────────┐
│   ESTEREOTIPO   │      REPRESENTACIÓN      │              DESCRIPCIÓN                │
├─────────────────┼──────────────────────────┼─────────────────────────────────────────┤
│   BOUNDARY      │      ○ Círculo verde     │ Interfaces de usuario (formularios,    │
│   (Límite)      │      (límite/frontera)   │ pantallas, emails, APIs). Punto de      │
│                 │                          │ contacto entre actor y sistema.         │
├─────────────────┼──────────────────────────┼─────────────────────────────────────────┤
│   CONTROL       │   ⊗ Círculo amarillo     │ Lógica de negocio, coordinación entre   │
│   (Control)     │   (con flecha/símbolo)   │ boundaries y entities. **Nombrados en   │
│                 │                          │ VERBO INFINITIVO** (Validar, Registrar, │
│                 │                          │ Autenticar, Crear, Eliminar).           │
├─────────────────┼──────────────────────────┼─────────────────────────────────────────┤
│   ENTITY        │  ▭ Círculo/Rectángulo    │ Objetos del dominio, modelos de datos,  │
│   (Entidad)     │  azul (con línea abajo)  │ bases de datos, archivos, repositorios. │
└─────────────────┴──────────────────────────┴─────────────────────────────────────────┘
```

### Reglas de Interacción UML:
1. Los **Actores** solo interactúan con **Boundaries**
2. Los **Boundaries** se comunican con **Controls** (nunca directamente con Entities)
3. Los **Controls** orquestan la lógica y acceden a **Entities**
4. Las **Entities** solo responden a **Controls** (nunca a Boundaries ni Actores)

---

## 1. Caso de Uso: Registrar Usuario

**Actor**: Usuario no registrado
**Descripción**: El usuario completa el formulario de registro y recibe un email de confirmación.

```mermaid
graph TB
    Actor([👤 Usuario No<br/>Registrado])

    %% BOUNDARIES - Círculos verdes
    B1((Formulario<br/>Registro))
    B2((Email de<br/>Confirmación))

    %% CONTROLS - Círculos amarillos con símbolo ⊗
    C1{⊗<br/>Validar<br/>Datos}
    C2{⊗<br/>Registrar<br/>Usuario}
    C3{⊗<br/>Generar<br/>Token}
    C4{⊗<br/>Enviar<br/>Email}

    %% ENTITIES - Rectángulos azules
    E1[(Usuario<br/>DB)]
    E2[(Token<br/>DB)]

    Actor -->|1. Ingresa datos| B1
    B1 -->|2. Envía formulario| C1
    C1 -->|3. Datos válidos| C2
    C2 -->|4. Solicita token| C3
    C3 -->|5. Guarda token| E2
    C2 -->|6. Crea usuario| E1
    E1 -->|7. Usuario creado| C2
    C2 -->|8. Solicita envío| C4
    C4 -->|9. Envía| B2
    B2 -.->|10. Recibe email| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4 control
    class E1,E2 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario No Registrado | - | Persona que desea crear cuenta |
| **Boundary** | Formulario Registro | `views/auth/registro.pug` | Interfaz de entrada de datos |
| **Boundary** | Email Confirmación | Template email SMTP | Interfaz de salida al usuario |
| **Control** | Validar Datos | `express-validator` en routes | Verbo: **Validar** |
| **Control** | Registrar Usuario | `UsuarioController.registrar()` | Verbo: **Registrar** |
| **Control** | Generar Token | `TokenHelper.generarId()` | Verbo: **Generar** |
| **Control** | Enviar Email | `EmailHelper.emailRegistro()` | Verbo: **Enviar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Base de datos de usuarios |
| **Entity** | Token DB | Campo `token` en Usuario | Almacenamiento de token |

---

## 2. Caso de Uso: Iniciar Sesión

**Actor**: Usuario registrado
**Descripción**: El usuario ingresa sus credenciales y accede al sistema.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Registrado])

    %% BOUNDARIES
    B1((Formulario<br/>Login))
    B2((Dashboard<br/>Propiedades))

    %% CONTROLS
    C1{⊗<br/>Validar<br/>Credenciales}
    C2{⊗<br/>Autenticar<br/>Usuario}
    C3{⊗<br/>Generar<br/>JWT}
    C4{⊗<br/>Proteger<br/>Ruta}
    C5{⊗<br/>Registrar<br/>Evento}

    %% ENTITIES
    E1[(Usuario<br/>DB)]
    E2[(Sesión<br/>JWT)]
    E3[(Log de<br/>Eventos)]

    Actor -->|1. Ingresa email/password| B1
    B1 -->|2. Envía credenciales| C1
    C1 -->|3. Valida formato| C2
    C2 -->|4. Busca usuario| E1
    E1 -->|5. Usuario + hash| C2
    C2 -->|6. Password válido| C3
    C3 -->|7. Crea JWT| E2
    E2 -->|8. Token generado| C3
    C3 -->|9. Notifica login| C5
    C5 -->|10. Registra| E3
    C3 -->|11. Autoriza acceso| C4
    C4 -->|12. Muestra| B2
    B2 -.->|13. Visualiza| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4,C5 control
    class E1,E2,E3 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Registrado | - | Usuario con cuenta activa |
| **Boundary** | Formulario Login | `views/auth/login.pug` | Pantalla de autenticación |
| **Boundary** | Dashboard Propiedades | `views/propiedades/admin.pug` | Pantalla principal del usuario |
| **Control** | Validar Credenciales | `express-validator` | Verbo: **Validar** |
| **Control** | Autenticar Usuario | `UsuarioController.autenticar()` | Verbo: **Autenticar** |
| **Control** | Generar JWT | `TokenHelper.generarJWT()` | Verbo: **Generar** |
| **Control** | Proteger Ruta | `middleware/protegerRuta.js` | Verbo: **Proteger** |
| **Control** | Registrar Evento | `EventEmitter.emit('userLoggedIn')` | Verbo: **Registrar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Base de datos |
| **Entity** | Sesión JWT | Cookie/LocalStorage | Token de sesión |
| **Entity** | Log de Eventos | `helpers/eventEmitter.js` | Registro de auditoría |

---

## 3. Caso de Uso: Crear Propiedad

**Actor**: Usuario autenticado
**Descripción**: El usuario crea una nueva propiedad ingresando título, descripción, ubicación, etc.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Autenticado])

    %% BOUNDARIES
    B1((Formulario<br/>Crear))
    B2((Formulario<br/>Imagen))

    %% CONTROLS
    C1{⊗<br/>Cargar<br/>Catálogos}
    C2{⊗<br/>Validar<br/>Datos}
    C3{⊗<br/>Crear<br/>Propiedad}
    C4{⊗<br/>Asociar<br/>Usuario}
    C5{⊗<br/>Notificar<br/>Creación}

    %% ENTITIES
    E1[(Categoría<br/>DB)]
    E2[(Precio<br/>DB)]
    E3[(Propiedad<br/>DB)]
    E4[(Usuario<br/>DB)]

    Actor -->|1. Solicita crear| B1
    B1 -->|2. Solicita datos| C1
    C1 -->|3. Obtiene| E1
    C1 -->|4. Obtiene| E2
    E1 -->|5. Lista categorías| C1
    E2 -->|6. Lista precios| C1
    C1 -->|7. Muestra formulario| B1
    B1 -.->|8. Visualiza| Actor

    Actor -->|9. Completa datos| B1
    B1 -->|10. Envía| C2
    C2 -->|11. Valida| C3
    C3 -->|12. Obtiene usuario_id| E4
    C3 -->|13. Crea con FK| C4
    C4 -->|14. Inserta registro| E3
    E3 -->|15. ID generado| C4
    C4 -->|16. Emite evento| C5
    C5 -->|17. Redirige| B2
    B2 -.->|18. Muestra| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4,C5 control
    class E1,E2,E3,E4 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Autenticado | - | Usuario logueado con JWT |
| **Boundary** | Formulario Crear | `views/propiedades/crear.pug` | Interfaz de creación |
| **Boundary** | Formulario Imagen | `views/propiedades/agregar-imagen.pug` | Pantalla de carga de imagen |
| **Control** | Cargar Catálogos | `PropiedadController.crear()` | Verbo: **Cargar** |
| **Control** | Validar Datos | `express-validator` | Verbo: **Validar** |
| **Control** | Crear Propiedad | `PropiedadController.guardar()` | Verbo: **Crear** |
| **Control** | Asociar Usuario | Lógica en `guardar()` | Verbo: **Asociar** |
| **Control** | Notificar Creación | `EventEmitter.emit('propertyCreated')` | Verbo: **Notificar** |
| **Entity** | Categoría DB | `models/Categoria.js` | Catálogo |
| **Entity** | Precio DB | `models/Precio.js` | Catálogo |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Tabla principal |
| **Entity** | Usuario DB | `models/Usuario.js` | FK usuario_id |

---

## 4. Caso de Uso: Editar Propiedad

**Actor**: Usuario autenticado (dueño de la propiedad)
**Descripción**: El usuario modifica los datos de una propiedad existente.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Dueño])

    %% BOUNDARIES
    B1((Lista<br/>Propiedades))
    B2((Formulario<br/>Editar))

    %% CONTROLS
    C1{⊗<br/>Verificar<br/>Propiedad}
    C2{⊗<br/>Cargar<br/>Datos}
    C3{⊗<br/>Validar<br/>Cambios}
    C4{⊗<br/>Actualizar<br/>Propiedad}
    C5{⊗<br/>Verificar<br/>Permisos}

    %% ENTITIES
    E1[(Propiedad<br/>DB)]
    E2[(Categoría<br/>DB)]
    E3[(Precio<br/>DB)]
    E4[(Usuario<br/>DB)]

    Actor -->|1. Selecciona| B1
    B1 -->|2. ID propiedad| C1
    C1 -->|3. Busca por ID| E1
    E1 -->|4. Datos propiedad| C1
    C1 -->|5. Verifica owner| C5
    C5 -->|6. Compara usuario_id| E4
    E4 -->|7. Autorizado| C5
    C5 -->|8. Permite editar| C2
    C2 -->|9. Carga catálogos| E2
    C2 -->|10. Carga catálogos| E3
    E2 -->|11. Categorías| C2
    E3 -->|12. Precios| C2
    C2 -->|13. Muestra formulario| B2
    B2 -.->|14. Visualiza| Actor

    Actor -->|15. Modifica datos| B2
    B2 -->|16. Envía cambios| C3
    C3 -->|17. Valida| C4
    C4 -->|18. UPDATE| E1
    E1 -->|19. Actualizado| C4
    C4 -->|20. Redirige| B1
    B1 -.->|21. Muestra lista| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4,C5 control
    class E1,E2,E3,E4 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Dueño | - | Propietario de la propiedad |
| **Boundary** | Lista Propiedades | `views/propiedades/admin.pug` | Dashboard del usuario |
| **Boundary** | Formulario Editar | `views/propiedades/editar.pug` | Pantalla de edición |
| **Control** | Verificar Propiedad | `PropiedadController.editar()` | Verbo: **Verificar** |
| **Control** | Cargar Datos | Lógica en `editar()` | Verbo: **Cargar** |
| **Control** | Validar Cambios | `express-validator` | Verbo: **Validar** |
| **Control** | Actualizar Propiedad | `PropiedadController.guardarCambios()` | Verbo: **Actualizar** |
| **Control** | Verificar Permisos | `middleware/protegerRuta.js` | Verbo: **Verificar** |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Registro a editar |
| **Entity** | Categoría DB | `models/Categoria.js` | Catálogo |
| **Entity** | Precio DB | `models/Precio.js` | Catálogo |
| **Entity** | Usuario DB | `models/Usuario.js` | Verificación owner |

---

## 5. Caso de Uso: Agregar Imagen a Propiedad

**Actor**: Usuario autenticado (dueño de la propiedad)
**Descripción**: El usuario sube una imagen para una propiedad previamente creada.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Dueño])

    %% BOUNDARIES
    B1((Formulario<br/>Subir Imagen))
    B2((Lista<br/>Propiedades))

    %% CONTROLS
    C1{⊗<br/>Verificar<br/>Propiedad}
    C2{⊗<br/>Validar<br/>Archivo}
    C3{⊗<br/>Procesar<br/>Imagen}
    C4{⊗<br/>Guardar<br/>Imagen}
    C5{⊗<br/>Actualizar<br/>Registro}
    C6{⊗<br/>Publicar<br/>Propiedad}

    %% ENTITIES
    E1[(Propiedad<br/>DB)]
    E2[(Sistema de<br/>Archivos<br/>public/uploads/)]
    E3[(Usuario<br/>DB)]

    Actor -->|1. Selecciona propiedad| B1
    B1 -->|2. ID propiedad| C1
    C1 -->|3. Busca| E1
    E1 -->|4. Datos| C1
    C1 -->|5. Verifica owner| E3
    E3 -->|6. Autorizado| C1
    C1 -->|7. Muestra formulario| B1
    B1 -.->|8. Visualiza| Actor

    Actor -->|9. Selecciona archivo| B1
    B1 -->|10. Sube archivo| C2
    C2 -->|11. Valida tipo/tamaño| C3
    C3 -->|12. Procesa multipart| C4
    C4 -->|13. Guarda físicamente| E2
    E2 -->|14. Ruta archivo| C4
    C4 -->|15. Actualiza campo imagen| C5
    C5 -->|16. UPDATE| E1
    C5 -->|17. Marca publicada| C6
    C6 -->|18. UPDATE publicado=1| E1
    E1 -->|19. Guardado| C6
    C6 -->|20. Redirige| B2
    B2 -.->|21. Muestra lista| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4,C5,C6 control
    class E1,E2,E3 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Dueño | - | Propietario de la propiedad |
| **Boundary** | Formulario Subir Imagen | `views/propiedades/agregar-imagen.pug` | Interfaz de carga |
| **Boundary** | Lista Propiedades | `views/propiedades/admin.pug` | Dashboard |
| **Control** | Verificar Propiedad | `PropiedadController.agregarImagen()` | Verbo: **Verificar** |
| **Control** | Validar Archivo | Multer config | Verbo: **Validar** |
| **Control** | Procesar Imagen | `middleware/subirimagen.js` | Verbo: **Procesar** |
| **Control** | Guardar Imagen | `PropiedadController.almacenarImagen()` | Verbo: **Guardar** |
| **Control** | Actualizar Registro | Lógica en `almacenarImagen()` | Verbo: **Actualizar** |
| **Control** | Publicar Propiedad | Lógica en `almacenarImagen()` | Verbo: **Publicar** |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Campo imagen |
| **Entity** | Sistema de Archivos | `/public/uploads/` | Almacenamiento físico |
| **Entity** | Usuario DB | `models/Usuario.js` | Verificación |

---

## 6. Caso de Uso: Eliminar Propiedad

**Actor**: Usuario autenticado (dueño de la propiedad)
**Descripción**: El usuario elimina una propiedad y su imagen asociada del sistema.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Dueño])

    %% BOUNDARIES
    B1((Lista<br/>Propiedades))
    B2((Mensaje<br/>Confirmación))

    %% CONTROLS
    C1{⊗<br/>Verificar<br/>Propiedad}
    C2{⊗<br/>Verificar<br/>Permisos}
    C3{⊗<br/>Eliminar<br/>Imagen}
    C4{⊗<br/>Eliminar<br/>Registro}
    C5{⊗<br/>Notificar<br/>Eliminación}

    %% ENTITIES
    E1[(Propiedad<br/>DB)]
    E2[(Sistema de<br/>Archivos<br/>unlink)]
    E3[(Usuario<br/>DB)]
    E4[(Log de<br/>Eventos)]

    Actor -->|1. Selecciona eliminar| B1
    B1 -->|2. ID propiedad| C1
    C1 -->|3. Busca| E1
    E1 -->|4. Datos + imagen| C1
    C1 -->|5. Verifica owner| C2
    C2 -->|6. Compara usuario_id| E3
    E3 -->|7. Autorizado| C2
    C2 -->|8. Procede a eliminar| C3
    C3 -->|9. unlink(imagen)| E2
    E2 -->|10. Archivo eliminado| C3
    C3 -->|11. Continúa| C4
    C4 -->|12. DELETE FROM| E1
    E1 -->|13. Registro eliminado| C4
    C4 -->|14. Emite evento| C5
    C5 -->|15. Registra| E4
    C5 -->|16. Muestra mensaje| B2
    B2 -.->|17. Visualiza| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4,C5 control
    class E1,E2,E3,E4 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Dueño | - | Propietario de la propiedad |
| **Boundary** | Lista Propiedades | `views/propiedades/admin.pug` | Dashboard |
| **Boundary** | Mensaje Confirmación | Alert/Flash message | Feedback al usuario |
| **Control** | Verificar Propiedad | `PropiedadController.eliminar()` | Verbo: **Verificar** |
| **Control** | Verificar Permisos | `middleware/protegerRuta.js` | Verbo: **Verificar** |
| **Control** | Eliminar Imagen | `fs.unlink()` en `eliminar()` | Verbo: **Eliminar** |
| **Control** | Eliminar Registro | `Propiedad.destroy()` | Verbo: **Eliminar** |
| **Control** | Notificar Eliminación | `EventEmitter.emit('propertyDeleted')` | Verbo: **Notificar** |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Registro a eliminar |
| **Entity** | Sistema de Archivos | `fs.unlink()` | Archivo físico |
| **Entity** | Usuario DB | `models/Usuario.js` | Verificación owner |
| **Entity** | Log de Eventos | `helpers/eventEmitter.js` | Auditoría |

---

## 7. Caso de Uso: Recuperar Contraseña

**Actor**: Usuario registrado que olvidó su contraseña
**Descripción**: El usuario solicita restablecer su contraseña y recibe un email con un enlace único.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Sin Acceso])

    %% BOUNDARIES
    B1((Formulario<br/>Olvidé Password))
    B2((Email<br/>Reset))
    B3((Formulario<br/>Nueva Password))
    B4((Formulario<br/>Login))

    %% CONTROLS
    C1{⊗<br/>Validar<br/>Email}
    C2{⊗<br/>Generar<br/>Token}
    C3{⊗<br/>Enviar<br/>Email}
    C4{⊗<br/>Comprobar<br/>Token}
    C5{⊗<br/>Actualizar<br/>Password}
    C6{⊗<br/>Hashear<br/>Password}

    %% ENTITIES
    E1[(Usuario<br/>DB)]
    E2[(Token<br/>Reset)]

    Actor -->|1. Solicita reset| B1
    B1 -->|2. Ingresa email| C1
    C1 -->|3. Busca email| E1
    E1 -->|4. Usuario encontrado| C1
    C1 -->|5. Válido| C2
    C2 -->|6. Genera token único| E2
    E2 -->|7. Token temporal| C2
    C2 -->|8. Guarda en usuario| E1
    C2 -->|9. Solicita envío| C3
    C3 -->|10. Envía link| B2
    B2 -.->|11. Recibe email| Actor

    Actor -->|12. Click en link| C4
    C4 -->|13. Valida token| E2
    E2 -->|14. Token válido| C4
    C4 -->|15. Busca usuario| E1
    E1 -->|16. Usuario encontrado| C4
    C4 -->|17. Muestra formulario| B3
    B3 -.->|18. Visualiza| Actor

    Actor -->|19. Ingresa nueva password| B3
    B3 -->|20. Envía password| C6
    C6 -->|21. Hashea bcrypt| C5
    C5 -->|22. UPDATE password| E1
    C5 -->|23. Limpia token| E2
    E1 -->|24. Actualizado| C5
    C5 -->|25. Redirige| B4
    B4 -.->|26. Muestra login| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2,B3,B4 boundary
    class C1,C2,C3,C4,C5,C6 control
    class E1,E2 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Sin Acceso | - | Usuario que olvidó password |
| **Boundary** | Formulario Olvidé Password | `views/auth/olvide-password.pug` | Solicitud de reset |
| **Boundary** | Email Reset | Template email | Email con link |
| **Boundary** | Formulario Nueva Password | `views/auth/reset-password.pug` | Cambio de password |
| **Boundary** | Formulario Login | `views/auth/login.pug` | Pantalla final |
| **Control** | Validar Email | `UsuarioController.resetPassword()` | Verbo: **Validar** |
| **Control** | Generar Token | `TokenHelper.generarId()` | Verbo: **Generar** |
| **Control** | Enviar Email | `EmailHelper.emailOlvidePassword()` | Verbo: **Enviar** |
| **Control** | Comprobar Token | `UsuarioController.comprobarToken()` | Verbo: **Comprobar** |
| **Control** | Hashear Password | `bcrypt.hash()` | Verbo: **Hashear** |
| **Control** | Actualizar Password | `UsuarioController.nuevoPassword()` | Verbo: **Actualizar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Tabla de usuarios |
| **Entity** | Token Reset | Campo `token` en Usuario | Token temporal |

---

## 8. Caso de Uso: Listar Propiedades del Usuario

**Actor**: Usuario autenticado
**Descripción**: El usuario visualiza todas sus propiedades con opciones de editar, eliminar o agregar imagen.

```mermaid
graph TB
    Actor([👤 Usuario<br/>Autenticado])

    %% BOUNDARIES
    B1((Dashboard<br/>Mis Propiedades))

    %% CONTROLS
    C1{⊗<br/>Verificar<br/>JWT}
    C2{⊗<br/>Obtener<br/>Propiedades}
    C3{⊗<br/>Cargar<br/>Relaciones}
    C4{⊗<br/>Renderizar<br/>Vista}

    %% ENTITIES
    E1[(Usuario<br/>DB)]
    E2[(Propiedad<br/>DB)]
    E3[(Categoría<br/>DB)]
    E4[(Precio<br/>DB)]

    Actor -->|1. Accede a dashboard| C1
    C1 -->|2. Valida token| E1
    E1 -->|3. Usuario válido| C1
    C1 -->|4. Obtiene usuario_id| C2
    C2 -->|5. WHERE usuario_id| E2
    E2 -->|6. Lista propiedades| C2
    C2 -->|7. Solicita relaciones| C3
    C3 -->|8. JOIN categorías| E3
    C3 -->|9. JOIN precios| E4
    E3 -->|10. Datos categoría| C3
    E4 -->|11. Datos precio| C3
    C3 -->|12. Dataset completo| C4
    C4 -->|13. Renderiza| B1
    B1 -.->|14. Visualiza lista| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1 boundary
    class C1,C2,C3,C4 control
    class E1,E2,E3,E4 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario Autenticado | - | Usuario con sesión activa |
| **Boundary** | Dashboard Mis Propiedades | `views/propiedades/admin.pug` | Pantalla principal |
| **Control** | Verificar JWT | `middleware/protegerRuta.js` | Verbo: **Verificar** |
| **Control** | Obtener Propiedades | `PropiedadController.admin()` | Verbo: **Obtener** |
| **Control** | Cargar Relaciones | Sequelize `include` | Verbo: **Cargar** |
| **Control** | Renderizar Vista | `res.render()` | Verbo: **Renderizar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Autenticación |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Propiedades del usuario |
| **Entity** | Categoría DB | `models/Categoria.js` | Relación |
| **Entity** | Precio DB | `models/Precio.js` | Relación |

---

## Resumen: Mapeo Completo del Sistema

### Tabla de BOUNDARIES (Límites/Interfaces)

| Boundary | Tipo | Archivo | Casos de Uso |
|----------|------|---------|--------------|
| Formulario Registro | Vista HTML | `views/auth/registro.pug` | CU1 |
| Formulario Login | Vista HTML | `views/auth/login.pug` | CU2, CU7 |
| Formulario Olvidé Password | Vista HTML | `views/auth/olvide-password.pug` | CU7 |
| Formulario Reset Password | Vista HTML | `views/auth/reset-password.pug` | CU7 |
| Email Confirmación | Email | Template SMTP | CU1 |
| Email Reset Password | Email | Template SMTP | CU7 |
| Dashboard Mis Propiedades | Vista HTML | `views/propiedades/admin.pug` | CU2, CU3, CU4, CU5, CU6, CU8 |
| Formulario Crear Propiedad | Vista HTML | `views/propiedades/crear.pug` | CU3 |
| Formulario Editar Propiedad | Vista HTML | `views/propiedades/editar.pug` | CU4 |
| Formulario Agregar Imagen | Vista HTML | `views/propiedades/agregar-imagen.pug` | CU3, CU5 |
| Mensaje Confirmación | Flash Message | Alert/Toast | CU6 |

### Tabla de CONTROLS (Lógica de Negocio - Verbos Infinitivos)

| Control | Verbo | Implementación | Responsabilidad |
|---------|-------|----------------|-----------------|
| Validar Datos | **Validar** | `express-validator` | Validación de formularios |
| Validar Credenciales | **Validar** | `express-validator` | Validación login |
| Validar Email | **Validar** | `express-validator` | Validación email |
| Validar Archivo | **Validar** | Multer config | Validación de imágenes |
| Validar Cambios | **Validar** | `express-validator` | Validación de edición |
| Registrar Usuario | **Registrar** | `UsuarioController.registrar()` | Crear cuenta |
| Autenticar Usuario | **Autenticar** | `UsuarioController.autenticar()` | Login |
| Generar Token | **Generar** | `TokenHelper.generarId()` | Tokens únicos |
| Generar JWT | **Generar** | `TokenHelper.generarJWT()` | Tokens de sesión |
| Verificar JWT | **Verificar** | `middleware/protegerRuta.js` | Autenticación |
| Verificar Propiedad | **Verificar** | Controllers | Validar existencia |
| Verificar Permisos | **Verificar** | Middleware | Autorización |
| Enviar Email | **Enviar** | `EmailHelper` | Correos electrónicos |
| Crear Propiedad | **Crear** | `PropiedadController.guardar()` | Nueva propiedad |
| Actualizar Propiedad | **Actualizar** | `PropiedadController.guardarCambios()` | Editar propiedad |
| Actualizar Password | **Actualizar** | `UsuarioController.nuevoPassword()` | Cambio de contraseña |
| Actualizar Registro | **Actualizar** | Lógica de actualización | UPDATE |
| Eliminar Propiedad | **Eliminar** | `PropiedadController.eliminar()` | Borrar propiedad |
| Eliminar Imagen | **Eliminar** | `fs.unlink()` | Borrar archivo |
| Cargar Catálogos | **Cargar** | Controllers | Obtener datos de catálogos |
| Cargar Datos | **Cargar** | Controllers | Obtener datos |
| Cargar Relaciones | **Cargar** | Sequelize `include` | JOIN |
| Obtener Propiedades | **Obtener** | `PropiedadController.admin()` | SELECT |
| Asociar Usuario | **Asociar** | Lógica FK | Relaciones |
| Proteger Ruta | **Proteger** | Middleware | Seguridad |
| Procesar Imagen | **Procesar** | `middleware/subirimagen.js` | Multipart |
| Guardar Imagen | **Guardar** | Controllers | Almacenar archivo |
| Publicar Propiedad | **Publicar** | Lógica | Marcar como publicada |
| Hashear Password | **Hashear** | `bcrypt.hash()` | Encriptación |
| Comprobar Token | **Comprobar** | Controllers | Validar token |
| Notificar Creación | **Notificar** | `EventEmitter` | Eventos |
| Notificar Eliminación | **Notificar** | `EventEmitter` | Eventos |
| Registrar Evento | **Registrar** | `EventEmitter` | Logging |
| Renderizar Vista | **Renderizar** | `res.render()` | Respuesta HTML |

### Tabla de ENTITIES (Entidades/Datos)

| Entity | Tipo | Implementación | Descripción |
|--------|------|----------------|-------------|
| Usuario DB | Base de Datos | `models/Usuario.js` | Tabla usuarios |
| Propiedad DB | Base de Datos | `models/Propiedad.js` | Tabla propiedades |
| Categoría DB | Base de Datos | `models/Categoria.js` | Catálogo categorías |
| Precio DB | Base de Datos | `models/Precio.js` | Catálogo precios |
| Token DB | Campo BD | Campo `token` en Usuario | Tokens de verificación |
| Token Reset | Campo BD | Campo `token` en Usuario | Tokens de reset |
| Sesión JWT | Cookie/Storage | JWT en cookie | Token de sesión |
| Sistema de Archivos | File System | `/public/uploads/` | Almacenamiento de imágenes |
| Log de Eventos | Event Log | `helpers/eventEmitter.js` | Auditoría |

---

## Diferencias Clave con el Archivo Anterior

### ✅ Mejoras Implementadas:

1. **Controls en Verbo Infinitivo**:
   - ❌ Antes: `UsuarioController.registrar`
   - ✅ Ahora: `Registrar Usuario` (verbo infinitivo)

2. **Distinción Visual Clara**:
   - **Boundaries**: Círculos verdes `((nombre))`
   - **Controls**: Rombos amarillos con símbolo `{⊗ nombre}`
   - **Entities**: Rectángulos azules `[(nombre)]`
   - **Actores**: Círculos rosa `([👤 nombre])`

3. **Notación UML Estándar**:
   - Respeta las reglas de interacción (Actor → Boundary → Control → Entity)
   - Nunca hay comunicación directa entre Actor y Entity
   - Nunca hay comunicación directa entre Boundary y Entity

4. **Nomenclatura Correcta**:
   - Controls describen **acciones** (Validar, Crear, Eliminar, Actualizar)
   - Boundaries describen **interfaces** (Formulario, Email, Dashboard)
   - Entities describen **datos** (Usuario DB, Propiedad DB, Sistema de Archivos)

5. **Flujos Más Detallados**:
   - Se separan responsabilidades en múltiples controls
   - Por ejemplo: `Hashear Password` es un control separado de `Actualizar Password`
   - Mejor granularidad y trazabilidad

6. **Tablas de Resumen Mejoradas**:
   - Se incluyen tablas de mapeo completas por tipo de elemento
   - Verbos explícitos en la columna de Controls
   - Relación clara con la implementación real del código

---

## Patrones de Diseño Identificados

### 1. **MVC (Model-View-Controller)**
- **Boundaries** = Views (Pug templates)
- **Controls** = Controllers + Middleware
- **Entities** = Models (Sequelize)

### 2. **Middleware Chain (Cadena de Responsabilidad)**
- `Verificar JWT` → `Verificar Permisos` → `Ejecutar Acción`
- `Validar Datos` → `Procesar` → `Guardar`

### 3. **Observer Pattern (Patrón Observador)**
- `EventEmitter` se usa como control para notificar eventos:
  - `propertyCreated`
  - `propertyDeleted`
  - `userLoggedIn`

### 4. **Strategy Pattern (Patrón Estrategia)**
- Diferentes estrategias de validación según el contexto
- Diferentes estrategias de autenticación (JWT, tokens temporales)

### 5. **Repository Pattern (Patrón Repositorio)**
- Models (Entities) actúan como repositorios de datos
- Abstracción de la capa de persistencia

---

## Conclusiones

Este archivo corrige los problemas identificados en el archivo anterior:

✅ **Notación UML correcta** para diagramas de robustez
✅ **Controls en verbo infinitivo** (Validar, Crear, Eliminar, etc.)
✅ **Distinción visual clara** entre Boundaries, Controls y Entities
✅ **Reglas de interacción UML respetadas**
✅ **Mapeo completo** con tablas de resumen
✅ **Trazabilidad** hacia la implementación real del código
✅ **Granularidad adecuada** en la descomposición de responsabilidades

Estos diagramas sirven como **puente perfecto** entre los casos de uso (análisis) y los diagramas de secuencia (diseño detallado), cumpliendo con los estándares de la metodología ICONIX y UML.
