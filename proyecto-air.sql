-- SCHEMA DE TRABAJO - SPRINT 2
-- ESTE SCRIPT SE EJECUTA EN AZURE

-- =========================
-- CATALOGOS
-- =========================

CREATE TABLE catalogo_sector (
    id_sector INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE catalogo_puestos (
    id_puesto INT IDENTITY PRIMARY KEY,
    nombre_puesto VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE catalogo_nivel_reglamento (
    id_nivel_reglamento INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE catalogo_estado_vigencia (
    id_estado_vigencia INT IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- =========================
-- ASAMBLEISTAS
-- =========================

CREATE TABLE asambleista (
    asambleista_id INT IDENTITY PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    correo_institucional VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE bitacora_asambleistas (
    id_bitacora INT IDENTITY PRIMARY KEY,
    asambleista_id INT NOT NULL,
    razon_cambio VARCHAR(255),
    fecha_actualizacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (asambleista_id) REFERENCES asambleista(asambleista_id)
);

CREATE TABLE nombramiento (
    id_nombramiento INT IDENTITY PRIMARY KEY,
    asambleista_id INT NOT NULL,
    sector_id INT NOT NULL,
    id_puesto INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL,
    FOREIGN KEY (asambleista_id) REFERENCES asambleista(asambleista_id),
    FOREIGN KEY (sector_id) REFERENCES catalogo_sector(id_sector),
    FOREIGN KEY (id_puesto) REFERENCES catalogo_puestos(id_puesto)
);

-- =========================
-- NORMATIVA
-- =========================

CREATE TABLE reglamento (
    id_reglamento INT IDENTITY PRIMARY KEY,
    nombre_normativa VARCHAR(200) NOT NULL,
    sigla VARCHAR(20) UNIQUE NOT NULL
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
    fecha_fin_vigencia DATE,
    id_estado_vigencia INT NOT NULL,
    FOREIGN KEY (id_reglamento) REFERENCES reglamento(id_reglamento),
    FOREIGN KEY (id_elemento_padre) REFERENCES elemento_normativo(id_elemento),
    FOREIGN KEY (id_nivel_reglamento) REFERENCES catalogo_nivel_reglamento(id_nivel_reglamento),
    FOREIGN KEY (id_estado_vigencia) REFERENCES catalogo_estado_vigencia(id_estado_vigencia)
);