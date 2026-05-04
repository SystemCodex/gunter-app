# Gunter — Arquitectura

App web local-first con dos productos bajo el mismo codebase:

- **Gunter Día** (`day.html`) — asistente diario: tareas, eventos, recordatorios, chat, documentos.
- **Gunter Reuniones** (`meeting.html` → `results.html`) — grabación, transcripción, análisis IA, presentaciones.

Stack: Vanilla JS multi-page, sin bundler. Backend Node.js http (sin Express). Persistencia: localStorage + IndexedDB. Backend WhatsApp: Baileys.

---

## Páginas (HTML)

| Archivo | Función |
|---|---|
| `index.html` | Landing / portal |
| `dashboard.html` | Hub de proyectos |
| `day.html` | Gunter Día — tabs dinámicos (Hoy + premium) |
| `config.html` | Nuevo Proyecto + Premium + Preferencias + Datos |
| `meeting.html` | Grabación en vivo — 3 paneles (audio/transcript/Gunter) |
| `results.html` | Análisis IA + presentaciones + follow-up post-reunión |

---

## Backend

```
server.js                    Proxy HTTP único — endpoints /api/*
server/openai-client.js      Wrapper OpenAI (chat, whisper, tts, embeddings)
server/gemini-client.js      Wrapper Gemini (text + vision + image)
server/whatsapp/             Baileys — handler conversacional con memoria
  ├ index.js                 sendMessage, QR, lifecycle
  ├ handler.js               Pipeline NLU + intent premium intercept
  ├ memory.js                Historia + facts por contacto
  ├ personality.js           System preamble compartido con browser
  ├ state-mirror.js          Estado tasks/events sincronizado desde browser
  └ message-log.js           Outgoing log + sync queue
server/knowledge/            Memoria de proyectos (Etapa 11)
  ├ store.js                 Snapshot persistido + índice + aliases
  ├ search.js                resolveProject + search + projectContextBundle
  ├ summarizer.js            Resumen ejecutivo cached
  └ index.js                 Facade
server/premium-intel/        Premium Intelligence (Sprint B-F)
  ├ _util.js                 Respuesta canónica + LLM safe + cache TTL
  ├ planner.js               daily + weekly plan
  ├ follow-up.js             project followups + meeting followup
  ├ summary.js               project executive summary
  ├ urgency.js               ranking explicable
  ├ project360.js            vista 360 consolidada
  ├ decisions.js             list + auto-detect
  ├ alerts.js                smart WA alerts (previews)
  ├ delegation.js            drafts en 5 tonos
  └ index.js                 Dispatcher con 11 acciones
```

### Endpoints HTTP

```
POST  /api/transcribe         Whisper
POST  /api/chat               OpenAI chat (primary LLM)
POST  /api/tts                OpenAI TTS-1-HD humanizado
POST  /api/embeddings         text-embedding-3-small
POST  /api/gemini-text        Gemini text
POST  /api/gemini-image       Gemini Nano Banana
POST  /api/document-extract   Recibos/facturas (Gemini Vision)
GET   /api/gemini-status      Health
GET   /api/google/status      OAuth setup
*     /api/whatsapp/*         WA bridge (status, qr, send, messages, personality)
*     /api/knowledge/*        Project memory (sync, projects, project/:id, search, resolve, summary/:id, stats)
POST  /api/premium-intel      Dispatcher único — { action, params }
GET   /api/premium-intel/actions   Lista 11 acciones
```

---

## Premium Features (86 flags)

`js/premium-features-service.js` — registry central con persistencia + cascada padre→hijos + import/export.

**Categorías:**
1. Productivity panel (5 subflags)
2. Meeting memory (3) — semantic search con embeddings reales
3. Smart documents (5)
4. Google Calendar (2)
5. WhatsApp Assistant (3)
6. Document sync (2)
7. Personality / focus / distraction
8. Voice (mode, style, speed, tone)
9. Wake word
10. **Premium Intelligence (Sprint A)** — 10 flags padres + 30 subflags:
    - `dailyPlanner`, `weeklyPlanner`, `projectAutoFollowUp`, `projectExecutiveSummary`,
      `meetingSmartFollowUp`, `urgencyRanking`, `project360`, `decisionCenter`,
      `smartWhatsappAlerts`, `delegationMode`

UI: `js/advanced-settings.js` declara `FEATURE_MAP` con cards + subs. Renderizado en tab `Premium` de `config.html`.

---

## Pipeline cognitivo (`js/core/`)

```
text → IntentEngine → EntityExtractor → TimeParser
                          ↓
                    PremiumIntel branch (si intent ∈ INTENT_MAP)
                          ↓
                    DecisionEngine → ActionEngine → uiResponse
```

`pipeline.js` ejecuta los 5 stages + un **stage `premium_intel`** entre `time` y `decision` que delega a `GunterPremiumIntel.handlePremiumIntent()` cuando el intent es premium.

11 intents premium en `intent-engine.js`:
`daily_plan, weekly_plan, project_followup, project_summary, project_360,
 meeting_followup, urgency_query, decision_query, decision_create,
 smart_alerts, delegation`

---

## Servicios cliente (`js/services/`)

| Servicio | Función |
|---|---|
| `notifications-service.js` | Toasts + recordatorios + `withOperation` (loading actualizable) |
| `error-mapper.js` | Errores técnicos → mensajes humanos en español latino |
| `status-bus.js` | Pub/sub de estados de operación (saving, syncing, etc.) |
| `connectivity-monitor.js` | Banner offline + interceptor de fetch para `/api/*` |
| `voice-service.js` | TTS humanizado + truncation inteligente para respuestas largas |
| `wake-word-service.js` | "Hi Gunter" tolerante + feedback variado por estilo |
| `tasks-service.js` | CRUD tareas IndexedDB |
| `events-service.js` | CRUD eventos IndexedDB + sync Calendar |
| `calendar-service.js` | Google Calendar push/pull con cola offline |
| `google-auth-service.js` | OAuth client-side |
| `whatsapp-service.js` | Cliente del bridge WA con sync queue |
| `document-service.js` | Extracción de recibos via Gemini Vision |
| `embedding-service.js` | text-embedding-3-small + cache IndexedDB |
| `semantic-index.js` | Top-K cosine search sobre transcripciones/análisis |
| `nlp-llm-service.js` | Wrapper /api/chat con personalidad latina |
| `project-knowledge-service.js` | Snapshot builder (Etapa 11) |
| `knowledge-sync-service.js` | Push debounced del snapshot |
| `premium-intelligence-service.js` | Cliente del dispatcher /api/premium-intel |

---

## Adapters (`js/adapters/`) — capa para futuro backend

5 adapters thin que envuelven los servicios anteriores con API estable + `register/use`:
`storage, auth, notification, calendar, voice`.

Hoy todos apuntan a la implementación local. Mañana: `GunterAdapters.storage.use('remote')` sin tocar consumidores.

---

## UI panels (`js/controllers/`)

| Controller | Tab/lugar | Flag premium |
|---|---|---|
| `today-widget.js` | Tab Hoy de day.html | (siempre activo) |
| `today-shortcuts.js` | Tab Hoy — atajos visuales | varios |
| `productivity-panel.js` | Tab Productividad | `productivityPanel` |
| `meeting-memory.js` | Tab Memoria | `meetingMemory` |
| `daily-planner-panel.js` | Tab 🌅 Plan de hoy | `dailyPlanner` |
| `weekly-planner-panel.js` | Tab 📅 Mi semana | `weeklyPlanner` |
| `urgency-ranking-panel.js` | Tab 🔥 Urgencia | `urgencyRanking` |
| `project-360-panel.js` | Tab 🛰️ Proyecto 360 | `project360` |
| `decisions-panel.js` | Tab 🧭 Decisiones | `decisionCenter` |
| `delegation-panel.js` | Tab 🤝 Delegación | `delegationMode` |
| `smart-alerts-panel.js` | Tab 🔔 Alertas WA | `smartWhatsappAlerts` |
| `meeting-followup-card.js` | Card en results.html | `meetingSmartFollowUp` |
| `day-tabs.js` | Router de tabs dinámicos | — |
| `day-controller.js` | Orquestador de day.html | — |
| `assistant-controller.js` | Chat in-app | — |

---

## Persistencia local

```
localStorage:
  gunter_data                 Proyectos + analyses cached
  gunter_premium_features     Estado de los 86 flags
  gunter_generated_analyses   Análisis cacheados por proyecto
  gunter_full_transcript      Última transcripción
  gunter_username, gunter_user, etc.

IndexedDB:
  gunter_daily                tasks, events, reminders, documents
  gunter_audio_vault          chunks de audio durante grabación
  gunter_transcription_db     metadata de sesiones
  gunter_documents            extracciones de Gemini Vision
  gunter_embeddings           vectores text-embedding-3-small (Sprint 4)
  gunter_semantic_index       chunks indexados (Sprint 4)

Disco backend (gitignored):
  whatsapp-data/
    session/                  Baileys creds
    state-mirror.json         Estado mirror
    sync-queue.json           Cola WA → browser
    messages.json             Log
    memory.json               Por contacto: history + facts
    personality.json          Espejo del browser
    knowledge/
      snapshot.json           Snapshot completo
      index.json              Índice rápido
      summaries.json          Cache de resúmenes
      contact-aliases.json    contactId → projectIds frecuentes
```

---

## Flujo Etapa 11: WhatsApp con memoria de proyectos

```
Usuario edita proyecto en day.html
        ↓
gunter-data-changed event
        ↓
KnowledgeSyncService (debounce 2s)
        ↓
ProjectKnowledgeService.build()  → snapshot
        ↓
POST /api/knowledge/sync         → KnowledgeStore (server)
                                                   ↓
WhatsApp message arrives                    Snapshot persistido
        ↓
handler.js
  → detectPremiumIntent (regex)
        ├── matchea? → premiumIntel.dispatch() → respuesta directa
        └── no matchea? → planActions LLM con knowledge bundle inyectado
        ↓
executeActions
  → resolveProjectFor (resuelve "SERVIMIL", "el de transporte", aliases)
  → enqueueSync con projectId + tag project:<id>
        ↓
Browser sync queue → tasks-service / events-service / data-service
        ↓
Otro snapshot → ciclo se repite
```

---

## Flujo Sprint B-F: Premium Intelligence

```
Cualquier canal: web chat, voz, wake word, WhatsApp
        ↓
Pipeline.handleUserInput(text)
        ↓
IntentEngine clasifica (regex + pesos)
        ↓
Si intent ∈ PREMIUM (daily_plan, urgency_query, etc.):
        ↓
GunterPremiumIntel.handlePremiumIntent(intent, entities, ctx)
        ↓
fetch POST /api/premium-intel { action, params }
        ↓
server/premium-intel/index.js dispatch(action, params)
        ↓
Módulo correspondiente (planner, urgency, etc.)
  • Lee snapshot via knowledge.getSnapshot()
  • Heurística determinística (siempre)
  • LLM enrichment (si openai.hasKey)
  • Cache TTL 30min/1h
        ↓
Respuesta canónica { success, data, summary, naturalResponse, ... }
        ↓
uiResponse.speech = naturalResponse
        ↓
voice.speak (truncado si > 380 chars con filler humano)
        ↓
Panel UI render data (si está en day.html)
```

---

## Reglas de seguridad

- **Sin API keys en frontend.** Todo va por `/api/*`.
- **Sin envíos automáticos a WhatsApp.** Smart alerts genera previews; el usuario confirma con modal antes de POST `/api/whatsapp/send`.
- **Sin acciones masivas sin confirmación.** Calendar bloques, eventos múltiples → `requiresConfirmation: true`.
- **Sin alucinación.** Cada acción premium verifica snapshot; si vacío, retorna mensaje humano "Abre Gunter Web para sincronizar".
- **Cero tracking.** No analytics, no telemetría externa.

`.gitignore` cubre `whatsapp-data/`, `node_modules/`, `.env`.

---

## Convenciones de código

- Vanilla JS, sin bundler. Cada módulo es un IIFE que registra `window.Gunter*`.
- IDs de DOM con prefijo: `gday-*` (día), `gpi-*` (premium intel), `gmem-*` (memoria), etc.
- Clases CSS con BEM: `gpi-card__head`, `gpi-card--active`.
- Diseño tokens en `styles/design-system.css` y `styles/variables.css`. Premium intel usa `--gpi-*` que heredan de gday.
- Personalidad: español neutro latinoamericano (es-419). Lista negra de modismos de España aplicada en preamble del LLM.

---

## Para ejecutar

```bash
node server.js                     # http://localhost:3001
```

Variables de entorno (`.env`):
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
PORT=3001
```

WhatsApp: scan QR desde `config.html → Premium → WhatsApp Assistant → Conectar`.
