-- ============================================================
-- SCHEMA COMPLETO - SPRINT 2
-- ============================================================

-- ------------------------------------------------------------
-- CATÁLOGOS BASE - PERSONA 1
-- ------------------------------------------------------------

CREATE TABLE catalogo_sector (
    id_sector    INT IDENTITY(1,1) PRIMARY KEY,
    nombre       NVARCHAR(100) NOT NULL,
    CONSTRAINT uq_sector_nombre UNIQUE (nombre)
);

CREATE TABLE catalogo_puestos (
    id_puesto     INT IDENTITY(1,1) PRIMARY KEY,
    nombre_puesto NVARCHAR(150) NOT NULL,
    CONSTRAINT uq_puesto_nombre UNIQUE (nombre_puesto)
);

-- ------------------------------------------------------------
-- CATÁLOGOS NORMATIVA - PERSONA 2
-- ------------------------------------------------------------

CREATE TABLE catalogo_nivel_reglamento (
    id_nivel_reglamento INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE catalogo_estado_vigencia (
    id_estado_vigencia INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- ASAMBLEÍSTA - PERSONA 1
-- ------------------------------------------------------------

CREATE TABLE asambleista (
    asambleista_id       INT IDENTITY(1,1) PRIMARY KEY,
    cedula               NVARCHAR(20)  NOT NULL,
    nombre               NVARCHAR(200) NOT NULL,
    correo_institucional NVARCHAR(150) NULL,
    activo               BIT NOT NULL DEFAULT 1,
    CONSTRAINT uq_asambleista_cedula UNIQUE (cedula)
);

CREATE TABLE bitacora_asambleistas (
    id_bitacora         INT IDENTITY(1,1) PRIMARY KEY,
    asambleista_id      INT           NOT NULL,
    cedula_anterior     NVARCHAR(20)  NULL,
    nombre_anterior     NVARCHAR(200) NULL,
    razon_cambio        NVARCHAR(500) NOT NULL,
    fecha_actualizacion DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_bitacora_asambleista
        FOREIGN KEY (asambleista_id)
        REFERENCES asambleista(asambleista_id)
);

CREATE TABLE nombramiento (
    id_nombramiento     INT IDENTITY(1,1) PRIMARY KEY,
    asambleista_id      INT          NOT NULL,
    sector_id           INT          NOT NULL,
    id_puesto           INT          NULL,
    fecha_inicio        DATE         NOT NULL,
    fecha_fin           DATE         NULL,
    estado              NVARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (estado IN ('ACTIVO','CONCLUIDO','SUSPENDIDO')),
    id_usuario_registro INT          NULL,
    fecha_registro      DATETIME2    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_nombramiento_asambleista
        FOREIGN KEY (asambleista_id)
        REFERENCES asambleista(asambleista_id),
    CONSTRAINT fk_nombramiento_sector
        FOREIGN KEY (sector_id)
        REFERENCES catalogo_sector(id_sector),
    CONSTRAINT fk_nombramiento_puesto
        FOREIGN KEY (id_puesto)
        REFERENCES catalogo_puestos(id_puesto)
);

CREATE UNIQUE INDEX uix_nombramiento_activo_unico
    ON nombramiento (asambleista_id)
    WHERE estado = 'ACTIVO';

-- ------------------------------------------------------------
-- NORMATIVA - PERSONA 2
-- ------------------------------------------------------------

CREATE TABLE reglamento (
    id_reglamento INT IDENTITY PRIMARY KEY,
    nombre_normativa VARCHAR(200) NOT NULL,
    sigla VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE elemento_normativo (
    id_elemento INT IDENTITY PRIMARY KEY,
    id_reglamento INT NOT NULL,
    id_elemento_padre INT NULL,
    id_nivel_reglamento INT NOT NULL,
    numero_etiqueta VARCHAR(20),
    contenido_texto TEXT NOT NULL,
    orden INT NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE NULL,
    id_estado_vigencia INT NOT NULL,
    CONSTRAINT fk_elemento_reglamento
        FOREIGN KEY (id_reglamento)
        REFERENCES reglamento(id_reglamento),
    CONSTRAINT fk_elemento_padre
        FOREIGN KEY (id_elemento_padre)
        REFERENCES elemento_normativo(id_elemento),
    CONSTRAINT fk_elemento_nivel
        FOREIGN KEY (id_nivel_reglamento)
        REFERENCES catalogo_nivel_reglamento(id_nivel_reglamento),
    CONSTRAINT fk_elemento_estado_vigencia
        FOREIGN KEY (id_estado_vigencia)
        REFERENCES catalogo_estado_vigencia(id_estado_vigencia)
);

CREATE UNIQUE INDEX ux_elemento_vigente
    ON elemento_normativo (id_reglamento, numero_etiqueta)
    WHERE fecha_fin_vigencia IS NULL;

-- ------------------------------------------------------------
-- DATOS SEMILLA - PERSONA 1
-- ------------------------------------------------------------

INSERT INTO catalogo_sector (nombre) VALUES
    ('Docente'),
    ('Administrativo'),
    ('Estudiantil'),
    ('Egresado'),
    ('Oficio - Consejo Institucional');

INSERT INTO catalogo_puestos (nombre_puesto) VALUES
    ('Representante Titular'),
    ('Representante Suplente'),
    ('Presidente del Directorio'),
    ('Secretario/a de la AIR');


-- ============================================================
-- SEGURIDAD Y AUDITORÍA (RBAC) - SEMANA 2
-- ============================================================

CREATE TABLE sys_rol (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE sys_usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(80) NOT NULL UNIQUE,
    password_hash NVARCHAR(64) NOT NULL, -- SHA-256 en hex
    email NVARCHAR(150) NOT NULL UNIQUE,
    activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE sys_permiso (
    id_permiso INT IDENTITY(1,1) PRIMARY KEY,
    nombre_permiso NVARCHAR(80) NOT NULL UNIQUE,
    descripcion NVARCHAR(250) NULL
);

CREATE TABLE sys_usuario_rol (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    CONSTRAINT pk_sys_usuario_rol PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_sur_usuario FOREIGN KEY (id_usuario)
        REFERENCES sys_usuario(id_usuario) ON DELETE NO ACTION,
    CONSTRAINT fk_sur_rol FOREIGN KEY (id_rol)
        REFERENCES sys_rol(id_rol) ON DELETE NO ACTION
);

CREATE TABLE sys_rol_permiso (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    CONSTRAINT pk_sys_rol_permiso PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_srp_rol FOREIGN KEY (id_rol)
        REFERENCES sys_rol(id_rol) ON DELETE NO ACTION,
    CONSTRAINT fk_srp_permiso FOREIGN KEY (id_permiso)
        REFERENCES sys_permiso(id_permiso) ON DELETE NO ACTION
);

CREATE TABLE sys_log_auditoria (
    id_log INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NULL, -- se toma de SESSION_CONTEXT('id_usuario') si existe
    accion NVARCHAR(10) NOT NULL, -- INSERT/UPDATE/DELETE
    tabla_afectada NVARCHAR(100) NOT NULL,
    registro_id NVARCHAR(50) NULL,
    detalle NVARCHAR(1000) NULL,
    fecha_hora DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
-- ============================================================
-- SEED RBAC (roles + permisos + usuarios) - SEMANA 2
-- ============================================================

-- Roles base requeridos
INSERT INTO sys_rol (nombre_rol) VALUES
('Administrador'),
('Secretaría'),
('Asambleísta');

-- Permisos mínimos (para pruebas RBAC)
INSERT INTO sys_permiso (nombre_permiso, descripcion) VALUES
('NORMATIVA_EDIT', 'Permite insertar/editar normativa'),
('NORMATIVA_VIEW', 'Permite lectura de normativa'),
('ACTORES_EDIT', 'Permite insertar/editar asambleístas y nombramientos'),
('ACTORES_VIEW', 'Permite lectura de actores'),
('AUDIT_VIEW', 'Permite ver bitácora'),
('USERS_ADMIN', 'Permite administrar usuarios y roles');

-- Asignación de permisos por rol (mínimo viable para pruebas)
-- Admin: todo
INSERT INTO sys_rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM sys_rol r CROSS JOIN sys_permiso p
WHERE r.nombre_rol = 'Administrador';

-- Secretaría: edita y ve normativa + edita y ve actores + ve auditoría
INSERT INTO sys_rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM sys_rol r
JOIN sys_permiso p ON p.nombre_permiso IN ('NORMATIVA_EDIT','NORMATIVA_VIEW','ACTORES_EDIT','ACTORES_VIEW','AUDIT_VIEW')
WHERE r.nombre_rol = 'Secretaría';

-- Asambleísta: solo lectura de normativa y de actores (lectura)
INSERT INTO sys_rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM sys_rol r
JOIN sys_permiso p ON p.nombre_permiso IN ('NORMATIVA_VIEW','ACTORES_VIEW')
WHERE r.nombre_rol = 'Asambleísta';

-- Usuarios mínimos (uno por rol) requeridos por rúbrica
-- password_hash: SHA-256 en hex (ej. "admin123", "secre123", "asam123")
INSERT INTO sys_usuario (username, password_hash, email) VALUES
('admin',  CONVERT(VARCHAR(64), HASHBYTES('SHA2_256','admin123'), 2),  'admin@itcr.ac.cr'),
('secre',  CONVERT(VARCHAR(64), HASHBYTES('SHA2_256','secre123'), 2),  'secre@itcr.ac.cr'),
('asam',   CONVERT(VARCHAR(64), HASHBYTES('SHA2_256','asam123'), 2),   'asam@itcr.ac.cr');

-- Vincular usuario→rol
INSERT INTO sys_usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM sys_usuario u
JOIN sys_rol r ON (u.username='admin' AND r.nombre_rol='Administrador')
             OR (u.username='secre' AND r.nombre_rol='Secretaría')
             OR (u.username='asam'  AND r.nombre_rol='Asambleísta');

-- ============================================================
-- CONSTRAINTS EXTRA - SEMANA 2
-- ============================================================

-- Cédula: solo dígitos y guiones (validación básica)
ALTER TABLE asambleista
ADD CONSTRAINT ck_asambleista_cedula_formato
CHECK (PATINDEX('%[^0-9-]%', cedula) = 0 AND LEN(cedula) BETWEEN 5 AND 20);

-- Nombramiento: fecha_fin > fecha_inicio (o null)
ALTER TABLE nombramiento
ADD CONSTRAINT ck_nombramiento_fechas
CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio);

-- Normativa: fecha_fin_vigencia > fecha_inicio_vigencia (o null)
ALTER TABLE elemento_normativo
ADD CONSTRAINT ck_elemento_normativo_fechas
CHECK (fecha_fin_vigencia IS NULL OR fecha_fin_vigencia > fecha_inicio_vigencia);

-- ============================================================
-- SP: VALIDAR TRASLAPE NOMBRAMIENTOS (SEMANA 2)
-- ============================================================

GO
CREATE OR ALTER PROCEDURE sp_registrar_nombramiento
    @asambleista_id INT,
    @sector_id INT,
    @id_puesto INT = NULL,
    @fecha_inicio DATE,
    @fecha_fin DATE = NULL,
    @id_usuario INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación básica de fechas
    IF (@fecha_fin IS NOT NULL AND @fecha_fin <= @fecha_inicio)
    BEGIN
        RAISERROR('fecha_fin debe ser mayor que fecha_inicio', 16, 1);
        RETURN;
    END

    -- Validar traslape con cualquier nombramiento existente del mismo asambleísta
    -- (más estricto que "mismo sector", pero cumple y evita inconsistencias históricas)
    IF EXISTS (
        SELECT 1
        FROM nombramiento n
        WHERE n.asambleista_id = @asambleista_id
          AND (
                (n.fecha_fin IS NULL OR n.fecha_fin >= @fecha_inicio)
            AND (@fecha_fin IS NULL OR n.fecha_inicio <= @fecha_fin)
          )
          AND n.estado IN ('ACTIVO','SUSPENDIDO')
    )
    BEGIN
        RAISERROR('Traslape detectado: el asambleísta ya tiene un nombramiento en el periodo indicado.', 16, 1);
        RETURN;
    END

    INSERT INTO nombramiento
        (asambleista_id, sector_id, id_puesto, fecha_inicio, fecha_fin, estado, id_usuario_registro)
    VALUES
        (@asambleista_id, @sector_id, @id_puesto, @fecha_inicio, @fecha_fin, 'ACTIVO', @id_usuario);
END
GO

-- ============================================================
-- TRIGGER: VIGENCIA / VERSIONADO AUTOMÁTICO (SEMANA 2)
-- ============================================================

GO
CREATE OR ALTER TRIGGER tg_vigencia_normativa
ON elemento_normativo
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_vigente INT = (SELECT TOP 1 id_estado_vigencia FROM catalogo_estado_vigencia WHERE nombre = 'Vigente');
    DECLARE @id_historica INT = (SELECT TOP 1 id_estado_vigencia FROM catalogo_estado_vigencia WHERE nombre = 'Histórica');

    -- Si no existen en catálogo, error claro
    IF (@id_vigente IS NULL OR @id_historica IS NULL)
    BEGIN
        RAISERROR('Faltan valores en catalogo_estado_vigencia: debe incluir Vigente e Histórica.', 16, 1);
        RETURN;
    END

    -- 1) Cerrar la versión vigente anterior (si aplica) antes de insertar, para no chocar con el índice único
    UPDATE prev
        SET prev.fecha_fin_vigencia = DATEADD(DAY, -1, ins.fecha_inicio_vigencia),
            prev.id_estado_vigencia = @id_historica
    FROM elemento_normativo prev
    JOIN inserted ins
      ON prev.id_reglamento = ins.id_reglamento
     AND prev.numero_etiqueta = ins.numero_etiqueta
     AND prev.fecha_fin_vigencia IS NULL;

    -- 2) Insertar los nuevos registros como Vigentes si fecha_fin_vigencia viene NULL
    INSERT INTO elemento_normativo
        (id_reglamento, id_elemento_padre, id_nivel_reglamento, numero_etiqueta,
         contenido_texto, orden, fecha_inicio_vigencia, fecha_fin_vigencia, id_estado_vigencia)
    SELECT
        ins.id_reglamento,
        ins.id_elemento_padre,
        ins.id_nivel_reglamento,
        ins.numero_etiqueta,
        ins.contenido_texto,
        ins.orden,
        ins.fecha_inicio_vigencia,
        ins.fecha_fin_vigencia,
        CASE WHEN ins.fecha_fin_vigencia IS NULL THEN @id_vigente ELSE @id_historica END
    FROM inserted ins;
END
GO

-- ============================================================
-- TRIGGERS: AUDITORÍA (SEMANA 2)
-- ============================================================

GO
CREATE OR ALTER TRIGGER tg_audit_asambleista
ON asambleista
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_usuario INT = TRY_CAST(SESSION_CONTEXT(N'id_usuario') AS INT);

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'UPDATE', 'asambleista', CAST(i.asambleista_id AS NVARCHAR(50)),
               CONCAT('cedula=', i.cedula, '; nombre=', i.nombre)
        FROM inserted i;
    END
    ELSE IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'INSERT', 'asambleista', CAST(i.asambleista_id AS NVARCHAR(50)),
               CONCAT('cedula=', i.cedula, '; nombre=', i.nombre)
        FROM inserted i;
    END
    ELSE
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'DELETE', 'asambleista', CAST(d.asambleista_id AS NVARCHAR(50)),
               CONCAT('cedula=', d.cedula, '; nombre=', d.nombre)
        FROM deleted d;
    END
END
GO

GO
CREATE OR ALTER TRIGGER tg_audit_nombramiento
ON nombramiento
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_usuario INT = TRY_CAST(SESSION_CONTEXT(N'id_usuario') AS INT);

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'UPDATE', 'nombramiento', CAST(i.id_nombramiento AS NVARCHAR(50)),
               CONCAT('asambleista_id=', i.asambleista_id, '; sector_id=', i.sector_id, '; estado=', i.estado)
        FROM inserted i;
    END
    ELSE IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'INSERT', 'nombramiento', CAST(i.id_nombramiento AS NVARCHAR(50)),
               CONCAT('asambleista_id=', i.asambleista_id, '; sector_id=', i.sector_id, '; estado=', i.estado)
        FROM inserted i;
    END
    ELSE
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'DELETE', 'nombramiento', CAST(d.id_nombramiento AS NVARCHAR(50)),
               CONCAT('asambleista_id=', d.asambleista_id, '; sector_id=', d.sector_id, '; estado=', d.estado)
        FROM deleted d;
    END
END
GO

GO
CREATE OR ALTER TRIGGER tg_audit_elemento_normativo
ON elemento_normativo
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_usuario INT = TRY_CAST(SESSION_CONTEXT(N'id_usuario') AS INT);

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'UPDATE', 'elemento_normativo', CAST(i.id_elemento AS NVARCHAR(50)),
               CONCAT('reglamento=', i.id_reglamento, '; etiqueta=', i.numero_etiqueta, '; fin=', COALESCE(CONVERT(NVARCHAR(30),i.fecha_fin_vigencia), 'NULL'))
        FROM inserted i;
    END
    ELSE IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'INSERT', 'elemento_normativo', CAST(i.id_elemento AS NVARCHAR(50)),
               CONCAT('reglamento=', i.id_reglamento, '; etiqueta=', i.numero_etiqueta)
        FROM inserted i;
    END
    ELSE
    BEGIN
        INSERT INTO sys_log_auditoria (id_usuario, accion, tabla_afectada, registro_id, detalle)
        SELECT @id_usuario, 'DELETE', 'elemento_normativo', CAST(d.id_elemento AS NVARCHAR(50)),
               CONCAT('reglamento=', d.id_reglamento, '; etiqueta=', d.numero_etiqueta)
        FROM deleted d;
    END
END
GO

-- ============================================================
-- DATOS SEMILLA NORMATIVA (SEMANA 2)
-- ============================================================

INSERT INTO catalogo_estado_vigencia (nombre) VALUES
('Vigente'),
('Histórica');

INSERT INTO catalogo_nivel_reglamento (nombre) VALUES
('Título'),
('Capítulo'),
('Artículo'),
('Inciso');

