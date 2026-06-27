# Plan de Implementación: Feature-Driven Mocking Server 🚀

Este documento detalla la hoja de ruta para construir una herramienta de desarrollo local en Node.js que gestiona mocks orientados a **Features** y **Criterios de Aceptación (AC)**, integrando contratos de Swagger y automatización con Playwright para maximizar la DX (Developer Experience).

---

## 📌 Arquitectura del Repositorio de Mocks

La herramienta leerá y generará una estructura de archivos basada en el modelo mental del negocio:

```text
mocks/
└── feature-nombre-feature/
    ├── swagger-contract.yaml             # Contrato opcional para validación de tipos
    ├── ac-01-nombre-criterio/
    │   ├── responses.json                 # Manifiesto con los mocks de este escenario
    │   └── recording.json                 # Pasos grabados del navegador (Chrome Recorder)
    └── ac-02-otro-criterio/
        ├── responses.json
        └── recording.json
```

## Fases del Proyecto
### Fase 1: El Núcleo de Mocks (MVP Base - Solo CLI/TUI)

Objetivo: Interceptar peticiones del frontend y permitir el "hot-swapping" de escenarios desde la terminal.

[ ] Diseñar el Schema de responses.json:Definir la estructura del manifiesto por criterio de aceptación, asegurando que soporte múltiples endpoints por flujo (mapeo de request y response).

[ ] Desarrollar el Servidor Mock en Node.js:Crear un servidor local (usando Fastify o Express) que intercepte las llamadas del frontend, busque en el escenario activo el endpoint solicitado y devuelva el status y payload correspondientes.

[ ] Implementar el Controlador de Estado en Memoria:Crear una variable global en el proceso de Node (ej. currentActiveScenario) para almacenar la ruta del criterio de aceptación seleccionado en tiempo de ejecución.

[ ] Construir la Interfaz de Terminal (TUI):Utilizar @clack/prompts o enquirer para crear un menú interactivo que escanee la carpeta /mocks y permita cambiar de escenario usando las flechas del teclado.

### Fase 2: Automatización y Generación (Integración con Swagger)
Objetivo: Evitar que el desarrollador escriba JSONs estructurados a mano.

[ ] Crear el Comando de Inicialización (mock-cli init):Implementar un parser (usando swagger-parser) que lea contratos OpenAPI/Swagger en formatos JSON o YAML.

[ ] Desarrollar el Andamio de Carpetas (Scaffolding):Hacer que el CLI interactúe con el usuario preguntando el nombre de la Feature y sus respectivos Criterios de Aceptación.

[ ] Auto-generación de Contratos:Generar automáticamente la estructura de carpetas y los archivos responses.json pre-poblados con las propiedades y tipos de datos definidos en el Swagger.

### Fase 3: El Dashboard Web (Pestaña de Chrome)
Objetivo: Facilitar la gestión visual de payloads grandes y control de flujos mediante una interfaz gráfica.

[ ] Exponer la API de Control Interna:Agregar endpoints administrativos al servidor Node (ej. GET /__admin/features para listar el árbol y POST /__admin/switch-scenario para activar un criterio).

[ ] Desarrollar la Web App del Dashboard:Construir una interfaz SPA ultra ligera (Vite + React/Vue o HTML/Tailwind) para visualizar de manera expandible el árbol de Features $\rightarrow$ ACs.

[ ] Lanzador Automático de Navegador:Integrar el paquete open de npm para que, al levantar la herramienta, abra automáticamente una pestaña dedicada en Chrome apuntando al Dashboard.

### Fase 4: Integración con Playwright (Modo "Manos Libres")
Objetivo: Correr pruebas de regresión automáticas usando las grabaciones de cada criterio sin duplicar herramientas de testing.

[ ] Configurar el Consumo de recording.json:Establecer el flujo donde el desarrollador exporte sus interacciones desde la pestaña Recorder nativa de Chrome DevTools hacia la carpeta del AC.

[ ] Construir el Intérprete/Runner de Playwright:Programar un script en Node que levante Playwright en background, configure un proxy para redirigir las APIs al servidor de mocks, y reproduzca secuencialmente los eventos del JSON de grabación.

[ ] Orquestar Ejecución Completa (mock-cli test):Crear el comando para automatizar el ciclo completo: activar el mock del AC-01 $\rightarrow$ correr grabación $\rightarrow$ activar AC-02 $\rightarrow$ correr grabación, etc.

[ ] Reporte de Resultados:Mostrar un resumen limpio y estilizado en la terminal indicando qué criterios pasaron (✅) y cuáles fallaron (❌).

### Stack Tecnológico Recomendado

| Componente | Tecnología | Razón de elección | 
| ----------- | ------------ | --------------- |
| Lenguaje |TypeScript | Robustez al parsear contratos y estructurar el CLI. |
| CLI/TUI | @clack/prompts | Estética moderna, limpia y ligera para la terminal.
| Servidor Mock | Fastify | Velocidad y bajo consumo de recursos en local.
| Automatización | Playwright | API nativa potente para controlar el navegador en background.
| Utilidades | swagger-parser, open | Análisis de contratos OpenAPI y apertura automática de Chrome. | 