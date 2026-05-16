# Estado Sprint 2 - Semana 2
**Fecha:** Mayo 2026  
**Equipo:** Sebastián Irola, Daniel Hernández, Juan Medina

---

## Qué está hecho

### Persona A (Sebastián)
- Tablas sys_* (RBAC): sys_usuario, sys_rol, sys_permiso, sys_usuario_rol, sys_rol_permiso, sys_log_auditoria
- Triggers: vigencia normativa, auditoría, validación quórum, traslape nombramientos
- Stored Procedures: sp_registrar_nombramiento, sp_concluir_nombramiento
- AuthController.js: login mínimo y middleware RBAC
- Configuración por variables de entorno (db.js + .env.example)

### Persona B (Daniel)
- Normativa.js: modelo con queries reales
- LegislativoController.js: endpoints de árbol normativo
- reglamento_editor.view.html: formulario de edición normativa con Tree View

### Persona C (Juan)
- SecretariaController.js: validaciones de cédula (regex) y correo institucional
- asambleista-lista.view.html: filtro por sector agregado
- asambleista-registro.view.html: mensajes de error mejorados
- login.view.html: formulario de ingreso con manejo de sesión y rol
- navbar.view.html: menú de navegación con control por rol
- usuarios.view.html: panel de administración de usuarios
- bitacora.view.html: visor de auditoría con filtros
- diccionario-datos.md: documentación completa de todas las tablas

---

## Qué falta

- modelo-logico.pdf: pendiente de actualizar con diagrama completo
- Pruebas end-to-end del flujo completo
- Validación final del tablero Kanban

---

## Porcentaje estimado de avance

| Módulo | % |
|--------|---|
| Base de datos (tablas + triggers + SP) | 90% |
| Backend (modelos + controladores) | 80% |
| Frontend (vistas) | 85% |
| Documentación | 75% |
| **Total estimado** | **82%** |

---

## Riesgos identificados

- modelo-logico.pdf debe actualizarse antes de la entrega final
- Falta conectar el navbar a todas las vistas existentes
- Pruebas de integración pendientes