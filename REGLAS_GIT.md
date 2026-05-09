# Reglas de Gestión del Repositorio

## Ramas
- main: versión final del sistema
- develop: integración del sprint
- feature/issue-X: desarrollo por tarea

## Commits (Conventional Commits)
Formato:
tipo(modulo): descripción

Tipos permitidos:
- feat:
- fix:
- db:
- docs:

Ejemplo:
db(normativa): crear tabla recursiva elemento_normativo

## Política
- No se evalúa código fuera de develop (Sprint 2)
- No se evalúa código fuera de main (Sprint 3)
- Código fuera de MVC = nota 0