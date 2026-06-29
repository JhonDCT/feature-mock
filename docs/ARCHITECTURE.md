Arquitectura propuesta

feature-mocks/
├── src/
│   ├── commands/                     # 📁 CAPA 1: Orquestadores de flujos de usuario
│   │   ├── start.command.ts          # Levanta el servidor + TUI de selección (Tu flujo actual)
│   │   ├── init.command.ts           # Flujo para inicializar carpetas (Swagger en el futuro)
│   │   └── test.command.ts           # Flujo para correr Playwright (Fase 4)
│   │
│   ├── ui/                           # 📁 CAPA 2: Elementos puramente visuales (TUI)
│   │   ├── components.ts             # Funciones para pintar tablas, banners o cabeceras con Clack
│   │   └── prompts.ts                # Grupos de preguntas (Selects de features, inputs, etc.)
│   │
│   ├── services/                     # 📁 CAPA 3: Los motores (Lógica pesada e infraestructura)
│   │   ├── mock-server.ts            # El servidor Fastify/Express
│   │   ├── state-manager.ts          # Guarda cuál Criterio de Aceptación está activo
│   │   └── file-watcher.ts           # El Chokidar que escucha si cambias un JSON
│   │
│   ├── utils/                        # 📁 CAPA 4: Utilidades genéricas del sistema
│   │   ├── fs.ts                     # Funciones para leer/escribir carpetas
│   │   └── logger.ts                 # Formateador de colores para la consola (Chalk/Picocolors)
│   │
│   └── index.ts                      # 🚀 El "Router" de entrada