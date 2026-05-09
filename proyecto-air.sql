-- SCHEMA DE TRABAJO - SPRINT 2
-- ESTE SCRIPT SE EJECUTA EN AZURE

-- =========================
-- CATALOGOS
-- =========================

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

CREATE TABLE catalogo_nivel_reglamento (
    id_nivel_reglamento INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE catalogo_estado_vigencia (
    id_estado_vigencia INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- ASAMBLEISTAS
-- =========================

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

-- =========================
-- NORMATIVA
-- =========================

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

-- =========================
-- DATOS SEMILLA
-- =========================

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