-- ------------------------------------------------------------
-- AJUSTES DE SINCRONIZACIÓN CON BD
-- -----------------------------------------------------------

ALTER TABLE asambleista
ADD activo BIT NOT NULL DEFAULT 1;

-- correo_institucional permitir NULL
ALTER TABLE asambleista
ALTER COLUMN correo_institucional VARCHAR(150) NULL;

-- Agregar columnas faltantes a bitacora_asambleistas
ALTER TABLE bitacora_asambleistas
ADD cedula_anterior NVARCHAR(20) NULL;

ALTER TABLE bitacora_asambleistas
ADD nombre_anterior NVARCHAR(200) NULL;

-- Ampliar razon_cambio
ALTER TABLE bitacora_asambleistas
ALTER COLUMN razon_cambio NVARCHAR(500) NOT NULL;

-- Agregar columnas faltantes a nombramiento
ALTER TABLE nombramiento
ALTER COLUMN id_puesto INT NULL;

ALTER TABLE nombramiento
ADD id_usuario_registro INT NULL;

ALTER TABLE nombramiento
ADD fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE();