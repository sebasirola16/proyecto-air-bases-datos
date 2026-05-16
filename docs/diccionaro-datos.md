# Diccionario de Datos - Sistema AIR

## Tablas del Sistema

---

### catalogo_sector
Catálogo de sectores de representación disponibles.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_sector | INT IDENTITY | NO | PK | Identificador único del sector |
| nombre | NVARCHAR(100) | NO | UNIQUE | Nombre del sector (ej: Docente) |

---

### catalogo_puestos
Catálogo de puestos institucionales.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_puesto | INT IDENTITY | NO | PK | Identificador único del puesto |
| nombre_puesto | NVARCHAR(150) | NO | UNIQUE | Nombre del puesto |

---

### catalogo_nivel_reglamento
Niveles jerárquicos de la normativa (Título, Capítulo, Artículo, Inciso).

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_nivel_reglamento | INT IDENTITY | NO | PK | Identificador del nivel |
| nombre | VARCHAR(50) | NO | UNIQUE | Nombre del nivel jerárquico |

---

### catalogo_estado_vigencia
Estados posibles de un elemento normativo.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_estado_vigencia | INT IDENTITY | NO | PK | Identificador del estado |
| nombre | VARCHAR(50) | NO | UNIQUE | Nombre del estado (Vigente, Histórico, Derogado) |

---

### asambleista
Identidad permanente de cada representante de la AIR.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| asambleista_id | INT IDENTITY | NO | PK | Identificador único |
| cedula | NVARCHAR(20) | NO | UNIQUE | Cédula de identidad (formato: 1-2345-6789) |
| nombre | NVARCHAR(200) | NO | | Nombre completo |
| correo_institucional | NVARCHAR(150) | SÍ | | Correo institucional del TEC |
| activo | BIT | NO | DEFAULT 1 | Indica si el registro está activo |

---

### bitacora_asambleistas
Registra cambios de nombre o cédula por razones del TSE.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_bitacora | INT IDENTITY | NO | PK | Identificador del registro |
| asambleista_id | INT | NO | FK → asambleista | Asambleísta afectado |
| cedula_anterior | NVARCHAR(20) | SÍ | | Cédula antes del cambio |
| nombre_anterior | NVARCHAR(200) | SÍ | | Nombre antes del cambio |
| razon_cambio | NVARCHAR(500) | NO | | Justificación del cambio |
| fecha_actualizacion | DATETIME2 | NO | DEFAULT GETDATE() | Fecha del cambio |

---

### nombramiento
Relación temporal entre asambleísta y su sector/puesto de representación.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_nombramiento | INT IDENTITY | NO | PK | Identificador único |
| asambleista_id | INT | NO | FK → asambleista | Asambleísta nombrado |
| sector_id | INT | NO | FK → catalogo_sector | Sector que representa |
| id_puesto | INT | SÍ | FK → catalogo_puestos | Puesto asignado |
| fecha_inicio | DATE | NO | | Inicio del nombramiento |
| fecha_fin | DATE | SÍ | | Fin del nombramiento (NULL = vigente) |
| estado | NVARCHAR(20) | NO | CHECK | Estado: ACTIVO, CONCLUIDO, SUSPENDIDO |
| id_usuario_registro | INT | SÍ | | Usuario que registró |
| fecha_registro | DATETIME2 | NO | DEFAULT GETDATE() | Fecha de registro |

**Índice único:** uix_nombramiento_activo_unico — garantiza un solo nombramiento ACTIVO por asambleísta.

---

### reglamento
Entidad raíz de la normativa institucional.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_reglamento | INT IDENTITY | NO | PK | Identificador único |
| nombre_normativa | VARCHAR(200) | NO | | Nombre completo del reglamento |
| sigla | VARCHAR(30) | NO | UNIQUE | Sigla institucional (ej: EOITCR) |

---

### elemento_normativo
Estructura jerárquica y recursiva de los reglamentos (Título > Capítulo > Artículo > Inciso).

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_elemento | INT IDENTITY | NO | PK | Identificador único |
| id_reglamento | INT | NO | FK → reglamento | Reglamento al que pertenece |
| id_elemento_padre | INT | SÍ | FK → elemento_normativo | Elemento padre (recursivo) |
| id_nivel_reglamento | INT | NO | FK → catalogo_nivel_reglamento | Nivel jerárquico |
| numero_etiqueta | VARCHAR(20) | SÍ | | Etiqueta legal (ej: Art. 5, Inciso a) |
| contenido_texto | TEXT | NO | | Texto del elemento |
| orden | INT | NO | | Orden dentro del padre |
| fecha_inicio_vigencia | DATE | NO | | Fecha desde que rige |
| fecha_fin_vigencia | DATE | SÍ | | Fecha fin (NULL = vigente) |
| id_estado_vigencia | INT | NO | FK → catalogo_estado_vigencia | Estado actual |

**Índice único:** ux_elemento_vigente — impide dos versiones vigentes del mismo elemento.

---

### sys_usuario
Usuarios del sistema con acceso a la aplicación.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_usuario | INT IDENTITY | NO | PK | Identificador único |
| username | NVARCHAR(100) | NO | UNIQUE | Nombre de usuario |
| password_hash | NVARCHAR(255) | NO | | Contraseña cifrada con BCrypt |
| email | NVARCHAR(150) | SÍ | | Correo del usuario |
| activo | BIT | NO | DEFAULT 1 | Estado del usuario |

---

### sys_rol
Roles disponibles en el sistema (RBAC).

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_rol | INT IDENTITY | NO | PK | Identificador único |
| nombre_rol | NVARCHAR(100) | NO | UNIQUE | Nombre del rol |

---

### sys_usuario_rol
Relación entre usuarios y sus roles asignados.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_usuario | INT | NO | PK, FK → sys_usuario | Usuario |
| id_rol | INT | NO | PK, FK → sys_rol | Rol asignado |

---

### sys_log_auditoria
Bitácora de todas las acciones críticas del sistema.

| Campo | Tipo | NULL | Constraint | Descripción |
|-------|------|------|------------|-------------|
| id_log | INT IDENTITY | NO | PK | Identificador del registro |
| id_usuario | INT | SÍ | FK → sys_usuario | Usuario que realizó la acción |
| accion | NVARCHAR(50) | NO | | Tipo de acción (INSERT, UPDATE, DELETE) |
| tabla_afectada | NVARCHAR(100) | NO | | Tabla modificada |
| detalle | NVARCHAR(500) | SÍ | | Descripción del cambio |
| registro_id | INT | SÍ | | ID del registro afectado |
| fecha_hora | DATETIME2 | NO | DEFAULT GETDATE() | Fecha y hora exacta |

---

## Triggers

| Nombre | Tabla | Evento | Propósito |
|--------|-------|--------|-----------|
| tg_vigencia_normativa | elemento_normativo | BEFORE INSERT | Marca versión anterior como histórica al insertar nueva |
| tg_no_repudio_cert | certificacion_emitida | BEFORE UPDATE/DELETE | Impide modificar certificaciones ya emitidas |
| tg_auditoria_total | asambleista, nombramiento | AFTER INSERT/UPDATE/DELETE | Registra cambios en sys_log_auditoria |
| tg_validar_quorum | voto | BEFORE INSERT | Verifica quórum antes de registrar voto |
| tg_traslape_sector | nombramiento | BEFORE INSERT | Evita dos nombramientos activos simultáneos |

---

## Stored Procedures

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| sp_registrar_nombramiento | asambleista_id, sector_id, fecha_inicio | Registra nombramiento validando traslape de fechas |
| sp_concluir_nombramiento | id_nombramiento, fecha_fin | Concluye un nombramiento activo |