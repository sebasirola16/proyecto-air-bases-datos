-- ============================================================
-- PERSONA 1: Identidad Institucional
-- Issues #9 y #14 — Asambleístas y Nombramientos
-- ============================================================

-- ------------------------------------------------------------
-- CATÁLOGOS BASE
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
-- ASAMBLEÍSTA
-- ------------------------------------------------------------

CREATE TABLE asambleista (
    asambleista_id       INT IDENTITY(1,1) PRIMARY KEY,
    cedula               NVARCHAR(20)  NOT NULL,
    nombre               NVARCHAR(200) NOT NULL,
    correo_institucional NVARCHAR(150) NULL,
    activo               BIT NOT NULL DEFAULT 1,
    CONSTRAINT uq_asambleista_cedula UNIQUE (cedula)
);

-- ------------------------------------------------------------
-- BITÁCORA DE CAMBIOS DEL ASAMBLEÍSTA
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- NOMBRAMIENTO
-- ------------------------------------------------------------

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

-- Evita que un asambleísta tenga dos nombramientos ACTIVOS al mismo tiempo
CREATE UNIQUE INDEX uix_nombramiento_activo_unico
    ON nombramiento (asambleista_id)
    WHERE estado = 'ACTIVO';

-- ------------------------------------------------------------
-- DATOS SEMILLA
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