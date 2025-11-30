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
graph LR
    Actor((👤 Usuario))

    %% BOUNDARIES
    B1((Formulario<br/>Registro))
    B2((Email<br/>Confirmación))

    %% CONTROLS
    C1((Validar<br/>Datos))
    C2((Registrar<br/>Usuario))
    C3((Enviar<br/>Email))

    %% ENTITIES
    E1((Usuario<br/>DB))

    Actor -->|Ingresa datos| B1
    B1 -->|Envía formulario| C1
    C1 -->|Datos válidos| C2
    C2 -->|Crea usuario| E1
    E1 -->|Usuario creado| C2
    C2 -->|Solicita envío| C3
    C3 -->|Envía email| B2
    B2 -.->|Recibe| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3 control
    class E1 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario | - | Persona que desea crear cuenta |
| **Boundary** | Formulario Registro | `views/auth/registro.pug` | Interfaz de entrada |
| **Boundary** | Email Confirmación | Template SMTP | Email con token |
| **Control** | Validar Datos | `express-validator` | Verbo: **Validar** |
| **Control** | Registrar Usuario | `UsuarioController.registrar()` | Verbo: **Registrar** |
| **Control** | Enviar Email | `EmailHelper.emailRegistro()` | Verbo: **Enviar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Base de datos |

---

## 2. Caso de Uso: Iniciar Sesión

**Actor**: Usuario registrado
**Descripción**: El usuario ingresa sus credenciales y accede al sistema.

```mermaid
graph LR
    Actor((👤 Usuario))

    %% BOUNDARIES
    B1((Formulario<br/>Login))
    B2((Dashboard))

    %% CONTROLS
    C1((Validar<br/>Credenciales))
    C2((Autenticar<br/>Usuario))
    C3((Generar<br/>JWT))

    %% ENTITIES
    E1((Usuario<br/>DB))

    Actor -->|Ingresa email/password| B1
    B1 -->|Envía credenciales| C1
    C1 -->|Valida formato| C2
    C2 -->|Busca usuario| E1
    E1 -->|Retorna datos| C2
    C2 -->|Password válido| C3
    C3 -->|Crea token| C2
    C2 -->|Autoriza acceso| B2
    B2 -.->|Visualiza| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3 control
    class E1 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario | - | Usuario con cuenta activa |
| **Boundary** | Formulario Login | `views/auth/login.pug` | Pantalla de autenticación |
| **Boundary** | Dashboard | `views/propiedades/admin.pug` | Pantalla principal |
| **Control** | Validar Credenciales | `express-validator` | Verbo: **Validar** |
| **Control** | Autenticar Usuario | `UsuarioController.autenticar()` | Verbo: **Autenticar** |
| **Control** | Generar JWT | `TokenHelper.generarJWT()` | Verbo: **Generar** |
| **Entity** | Usuario DB | `models/Usuario.js` | Base de datos |

---

## 3. Caso de Uso: Crear Propiedad

**Actor**: Usuario autenticado
**Descripción**: El usuario crea una nueva propiedad con sus datos y luego puede agregar una imagen.

```mermaid
graph LR
    Actor((👤 Usuario))

    %% BOUNDARIES
    B1((Formulario<br/>Crear))
    B2((Vista<br/>Imagen))

    %% CONTROLS
    C1((Cargar<br/>Catálogos))
    C2((Validar<br/>Datos))
    C3((Crear<br/>Propiedad))

    %% ENTITIES
    E1((Categoría<br/>DB))
    E2((Precio<br/>DB))
    E3((Propiedad<br/>DB))

    Actor -->|Solicita crear| C1
    C1 -->|Obtiene| E1
    C1 -->|Obtiene| E2
    E1 -->|Lista| C1
    E2 -->|Lista| C1
    C1 -->|Muestra| B1
    B1 -.->|Visualiza| Actor
    Actor -->|Completa datos| B1
    B1 -->|Envía| C2
    C2 -->|Valida| C3
    C3 -->|Inserta| E3
    E3 -->|ID creado| C3
    C3 -->|Redirige| B2
    B2 -.->|Muestra| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3 control
    class E1,E2,E3 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario | - | Usuario logueado con JWT |
| **Boundary** | Formulario Crear | `views/propiedades/crear.pug` | Interfaz de creación |
| **Boundary** | Vista Imagen | `views/propiedades/agregar-imagen.pug` | Pantalla de imagen |
| **Control** | Cargar Catálogos | `PropiedadController.crear()` | Verbo: **Cargar** |
| **Control** | Validar Datos | `express-validator` | Verbo: **Validar** |
| **Control** | Crear Propiedad | `PropiedadController.guardar()` | Verbo: **Crear** |
| **Entity** | Categoría DB | `models/Categoria.js` | Catálogo |
| **Entity** | Precio DB | `models/Precio.js` | Catálogo |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Tabla principal |

---

## 4. Caso de Uso: Editar Propiedad

**Actor**: Usuario autenticado (dueño)
**Descripción**: El usuario modifica los datos de una propiedad existente.

```mermaid
graph LR
    Actor((👤 Usuario))

    %% BOUNDARIES
    B1((Lista<br/>Propiedades))
    B2((Formulario<br/>Editar))

    %% CONTROLS
    C1((Verificar<br/>Propiedad))
    C2((Cargar<br/>Datos))
    C3((Validar<br/>Cambios))
    C4((Actualizar<br/>Propiedad))

    %% ENTITIES
    E1((Propiedad<br/>DB))
    E2((Categoría<br/>DB))
    E3((Precio<br/>DB))

    Actor -->|Selecciona| B1
    B1 -->|ID propiedad| C1
    C1 -->|Busca| E1
    E1 -->|Retorna datos| C1
    C1 -->|Autorizado| C2
    C2 -->|Obtiene| E2
    C2 -->|Obtiene| E3
    E2 -->|Lista| C2
    E3 -->|Lista| C2
    C2 -->|Muestra| B2
    B2 -.->|Visualiza| Actor
    Actor -->|Modifica| B2
    B2 -->|Envía| C3
    C3 -->|Valida| C4
    C4 -->|UPDATE| E1
    E1 -->|Actualizado| C4
    C4 -->|Redirige| B1

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3,C4 control
    class E1,E2,E3 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario | - | Propietario de la propiedad |
| **Boundary** | Lista Propiedades | `views/propiedades/admin.pug` | Dashboard |
| **Boundary** | Formulario Editar | `views/propiedades/editar.pug` | Pantalla de edición |
| **Control** | Verificar Propiedad | `PropiedadController.editar()` | Verbo: **Verificar** |
| **Control** | Cargar Datos | Lógica en `editar()` | Verbo: **Cargar** |
| **Control** | Validar Cambios | `express-validator` | Verbo: **Validar** |
| **Control** | Actualizar Propiedad | `PropiedadController.guardarCambios()` | Verbo: **Actualizar** |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Registro a editar |
| **Entity** | Categoría DB | `models/Categoria.js` | Catálogo |
| **Entity** | Precio DB | `models/Precio.js` | Catálogo |

---

## 5. Caso de Uso: Eliminar Propiedad

**Actor**: Usuario autenticado (dueño)
**Descripción**: El usuario elimina una propiedad y su imagen asociada del sistema.

```mermaid
graph LR
    Actor((👤 Usuario))

    %% BOUNDARIES
    B1((Lista<br/>Propiedades))
    B2((Mensaje<br/>Confirmación))

    %% CONTROLS
    C1((Verificar<br/>Propiedad))
    C2((Eliminar<br/>Archivo))
    C3((Eliminar<br/>Registro))

    %% ENTITIES
    E1((Propiedad<br/>DB))
    E2((FileSystem))

    Actor -->|Solicita eliminar| B1
    B1 -->|ID propiedad| C1
    C1 -->|Busca| E1
    E1 -->|Retorna datos| C1
    C1 -->|Autorizado| C2
    C2 -->|Elimina imagen| E2
    E2 -->|Confirmación| C2
    C2 -->|Procede| C3
    C3 -->|DELETE| E1
    E1 -->|Eliminado| C3
    C3 -->|Muestra| B2
    B2 -.->|Visualiza| Actor

    classDef boundary fill:#90EE90,stroke:#2d5016,stroke-width:3px,color:#000
    classDef control fill:#FFD700,stroke:#8B7500,stroke-width:3px,color:#000
    classDef entity fill:#87CEEB,stroke:#00008B,stroke-width:3px,color:#000
    classDef actor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000

    class B1,B2 boundary
    class C1,C2,C3 control
    class E1,E2 entity
    class Actor actor
```

### Elementos Identificados:

| Tipo | Elemento | Implementación | Descripción |
|------|----------|----------------|-------------|
| **Actor** | Usuario | - | Propietario de la propiedad |
| **Boundary** | Lista Propiedades | `views/propiedades/admin.pug` | Dashboard |
| **Boundary** | Mensaje Confirmación | Flash message | Feedback |
| **Control** | Verificar Propiedad | `PropiedadController.eliminar()` | Verbo: **Verificar** |
| **Control** | Eliminar Archivo | `fs.unlink()` | Verbo: **Eliminar** |
| **Control** | Eliminar Registro | `Propiedad.destroy()` | Verbo: **Eliminar** |
| **Entity** | Propiedad DB | `models/Propiedad.js` | Registro a eliminar |
| **Entity** | FileSystem | `/public/uploads/` | Archivos físicos |

---

## Resumen: Mapeo Completo del Sistema

### Tabla de BOUNDARIES (Límites/Interfaces)

| Boundary | Tipo | Archivo | Casos de Uso |
|----------|------|---------|--------------|
| Formulario Registro | Vista HTML | `views/auth/registro.pug` | CU1 |
| Formulario Login | Vista HTML | `views/auth/login.pug` | CU2 |
| Email Confirmación | Email | Template SMTP | CU1 |
| Dashboard | Vista HTML | `views/propiedades/admin.pug` | CU2, CU4, CU5 |
| Formulario Crear Propiedad | Vista HTML | `views/propiedades/crear.pug` | CU3 |
| Formulario Editar Propiedad | Vista HTML | `views/propiedades/editar.pug` | CU4 |
| Vista Imagen | Vista HTML | `views/propiedades/agregar-imagen.pug` | CU3 |
| Mensaje Confirmación | Flash Message | Alert/Toast | CU5 |

### Tabla de CONTROLS (Lógica de Negocio - Verbos Infinitivos)

| Control | Verbo | Implementación | Responsabilidad |
|---------|-------|----------------|-----------------|
| Validar Datos | **Validar** | `express-validator` | Validación de formularios |
| Validar Credenciales | **Validar** | `express-validator` | Validación login |
| Validar Cambios | **Validar** | `express-validator` | Validación de edición |
| Registrar Usuario | **Registrar** | `UsuarioController.registrar()` | Crear cuenta |
| Autenticar Usuario | **Autenticar** | `UsuarioController.autenticar()` | Login |
| Generar JWT | **Generar** | `TokenHelper.generarJWT()` | Tokens de sesión |
| Verificar Propiedad | **Verificar** | Controllers | Validar existencia y permisos |
| Enviar Email | **Enviar** | `EmailHelper` | Correos electrónicos |
| Crear Propiedad | **Crear** | `PropiedadController.guardar()` | Nueva propiedad |
| Actualizar Propiedad | **Actualizar** | `PropiedadController.guardarCambios()` | Editar propiedad |
| Eliminar Archivo | **Eliminar** | `fs.unlink()` | Borrar archivo |
| Eliminar Registro | **Eliminar** | `PropiedadController.eliminar()` | Borrar propiedad |
| Cargar Catálogos | **Cargar** | Controllers | Obtener catálogos |
| Cargar Datos | **Cargar** | Controllers | Obtener datos |

### Tabla de ENTITIES (Entidades/Datos)

| Entity | Tipo | Implementación | Descripción |
|--------|------|----------------|-------------|
| Usuario DB | Base de Datos | `models/Usuario.js` | Tabla usuarios |
| Propiedad DB | Base de Datos | `models/Propiedad.js` | Tabla propiedades |
| Categoría DB | Base de Datos | `models/Categoria.js` | Catálogo categorías |
| Precio DB | Base de Datos | `models/Precio.js` | Catálogo precios |
| FileSystem | File System | `/public/uploads/` | Almacenamiento de imágenes |

---

## Patrones de Diseño Identificados

### 1. **MVC (Model-View-Controller)**
- **Boundaries** = Views (Pug templates)
- **Controls** = Controllers + Middleware
- **Entities** = Models (Sequelize)

### 2. **Middleware Chain (Cadena de Responsabilidad)**
- `Verificar JWT` → `Verificar Permisos` → `Ejecutar Acción`
- `Validar Datos` → `Procesar` → `Guardar`

### 3. **Repository Pattern (Patrón Repositorio)**
- Models (Entities) actúan como repositorios de datos
- Abstracción de la capa de persistencia

---

## Conclusiones

Este archivo presenta los **5 casos de uso principales** del sistema:

✅ **Notación UML correcta** para diagramas de robustez
✅ **Controls en verbo infinitivo** (Validar, Crear, Eliminar, etc.)
✅ **Distinción visual clara** entre Boundaries, Controls y Entities
✅ **Reglas de interacción UML respetadas**
✅ **Diagramas simplificados** para mejor renderización
✅ **Trazabilidad** hacia la implementación real del código
✅ **Granularidad adecuada** sin complejidad innecesaria

Estos diagramas sirven como **puente perfecto** entre los casos de uso (análisis) y los diagramas de secuencia (diseño detallado), cumpliendo con los estándares de la metodología ICONIX y UML.
