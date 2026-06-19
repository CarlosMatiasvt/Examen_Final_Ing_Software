# SGIC Pro - Sistema de Gestión de Carburantes (SFA)

Plataforma de alta fidelidad para el control de inventarios y validación dinámica de cupos ANH, optimizada para despliegue inmediato.

## 🚀 Despliegue Rápido (GitHub Pages)
Esta versión ha sido optimizada como una **Single-File Application (SFA)**. Para ponerla en línea:
1. Sube este repositorio a GitHub.
2. Ve a **Settings > Pages**.
3. Selecciona la rama `main` y la carpeta `/(root)`.
4. El enlace generado mostrará la aplicación completa y funcional.

## 🛠️ Ejecución Local (Sin Instalación)
Para ver el proyecto en tu PC ahora mismo:
- Simplemente abre el archivo `index.html` de la raíz en cualquier navegador (Chrome, Edge, Firefox).
- O usa la extensión **Live Server** de VS Code sobre el archivo `index.html`.
- **No requiere Node.js, Python ni bases de datos externas.**

## 🧠 Características de Ingeniería
- **Algoritmo Dinámico:** Cálculo del límite semanal basado en el promedio de los últimos 28 días + Factor de Holgura ajustable.
- **Persistencia Local:** Utiliza `localStorage` de alta eficiencia para mantener stocks, ventas y configuraciones entre sesiones.
- **Interfaz Premium:** Diseño minimalista con Blur-glass, animaciones fluidas (Framer Motion) e iconos vectoriales (Lucide).
- **Validaciones ANH:** Sistema de bloqueo automático para placas suspendidas y control estricto de excedentes.

## 📂 Estructura de Archivos
- `index.html` (RAÍZ): Aplicación principal (Todo en uno).
- `backend/`: Código de referencia en FastAPI (No requerido para ejecución actual).
- `frontend/`: Código fuente de referencia en React/Vite (No requerido para ejecución actual).

---
**Desarrollado como Solución de Ingeniería de Alto Impacto para Examen Final.**
