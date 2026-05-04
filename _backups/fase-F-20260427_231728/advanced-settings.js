/* =============================================
   GUNTER - Advanced Settings Controller (Premium)
   -------------------------------------------------
   Renderiza la sección "Funciones Premium" dentro
   de config.html a partir del registry de flags.
   Delega persistencia a PremiumFeaturesService.
   ============================================= */

(function () {
    const S = () => window.PremiumFeaturesService;

    // ---------- FEATURE MAP (declarativo) ----------
    // Cada entrada = 1 card. `subs` = sub-opciones desplegables.
    const FEATURE_MAP = [
        {
            id: 'productivityPanel',
            icon: '📊',
            title: 'Panel de productividad avanzada',
            description: 'Mide tu rendimiento con datos de tareas, tiempo trabajado, objetivos cumplidos y ROI del tiempo.',
            subs: [
                { key: 'productivityTimeByTask',           label: 'Tiempo por tipo de tarea' },
                { key: 'productivityWeeklyEfficiency',     label: 'Eficiencia semanal' },
                { key: 'productivityGoalCompletion',       label: 'Cumplimiento de objetivos' },
                { key: 'productivityRealProductiveHours',  label: 'Horas productivas reales' },
                { key: 'productivityTimeROI',              label: 'ROI del tiempo' }
            ]
        },
        {
            id: 'meetingMemory',
            icon: '🧠',
            title: 'Memoria total de reuniones',
            description: 'Busca en reuniones pasadas, recuerda decisiones y conecta conversaciones entre proyectos.',
            subs: [
                { key: 'meetingSemanticSearch',    label: 'Búsqueda semántica en transcripciones',
                  subStatus: 'included_in_parent',
                  hint: 'Ya activa con embeddings reales cuando el módulo está ON.' },
                { key: 'meetingDecisionTimeline',  label: 'Timeline de decisiones',
                  subStatus: 'included_in_parent',
                  hint: 'El centro de decisiones tiene su propio timeline configurable.' },
                { key: 'meetingCrossProjectLinks', label: 'Conectar reuniones entre proyectos',
                  subStatus: 'coming_soon',
                  hint: 'Cross-project link automático llegará en una próxima versión.' }
            ]
        },
        {
            id: 'smartDocuments',
            icon: '📄',
            title: 'Gestión inteligente de documentos',
            description: 'Analiza recibos, contratos, facturas e imágenes para detectar vencimientos, valores y pagos.',
            subs: [
                { key: 'smartReceiptReading',        label: 'Leer recibos automáticamente',
                  subStatus: 'included_in_parent',
                  hint: 'Activa por defecto cuando el módulo está ON (Gemini Vision).' },
                { key: 'smartDueDateDetection',      label: 'Detectar vencimientos',
                  subStatus: 'included_in_parent',
                  hint: 'Extracción incluida en el análisis de cada documento.' },
                { key: 'smartExpenseClassification', label: 'Clasificar gastos',
                  subStatus: 'coming_soon',
                  hint: 'Categorías personalizables llegarán en una próxima versión.' },
                { key: 'smartPaymentAlerts',         label: 'Alertar pagos pendientes',
                  subStatus: 'included_in_parent',
                  hint: 'Las alertas se generan automáticamente para recibos con vencimiento.' },
                { key: 'smartFinancialHistory',      label: 'Historial financiero básico',
                  subStatus: 'coming_soon',
                  hint: 'Reportes de gasto agregados llegarán en una próxima versión.' }
            ]
        },
        {
            id: 'googleCalendarSync',
            icon: '🗓️',
            title: 'Google Calendar',
            description: 'Crea, edita y recibe recordatorios automáticos en tu Google Calendar desde lenguaje natural.',
            action: 'google-connect',
            subs: [
                { key: 'googleCalendarNaturalLanguage', label: 'Crear eventos desde lenguaje natural' },
                { key: 'googleCalendarAutoReminders',   label: 'Recordatorios automáticos (1 día antes + 30 min antes)' }
            ]
        },
        {
            id: 'whatsappAssistant',
            icon: '💬',
            title: 'WhatsApp Assistant',
            description: 'Conversa con Gunter desde WhatsApp: crea tareas, agenda citas, recibe resúmenes y recordatorios.',
            action: 'whatsapp-qr',
            subs: [
                { key: 'whatsappCommands',           label: 'Recibir comandos desde WhatsApp',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto cuando WhatsApp está conectado.' },
                { key: 'whatsappNotifications',      label: 'Recibir notificaciones',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto.' },
                { key: 'whatsappMeetingScheduling',  label: 'Agendar reuniones desde WhatsApp',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto. Si tienes Google Calendar conectado, va al calendario también.' }
            ]
        },
        {
            id: 'documentSync',
            icon: '📚',
            title: 'Notion / Google Drive',
            description: 'Conecta documentos, notas y archivos como memoria de trabajo de Gunter.',
            subs: [
                { key: 'notionSync',       label: 'Sincronizar Notion',
                  subStatus: 'coming_soon',
                  hint: 'Integración con Notion API llegará en una próxima versión.' },
                { key: 'googleDriveSync',  label: 'Sincronizar Google Drive',
                  subStatus: 'coming_soon',
                  hint: 'Integración con Drive API llegará en una próxima versión.' }
            ]
        },
        {
            id: 'adaptivePersonality',
            icon: '🎭',
            title: 'Personalidad adaptativa de Gunter',
            description: 'Gunter ajusta tono, estilo y comportamiento según el contexto.',
            custom: renderPersonalityCard
        },
        {
            id: 'voiceEnabled',
            icon: '🗣️',
            title: 'Voz humanizada de Gunter',
            description: 'Gunter habla con voz natural, expresiva y configurable — o responde solo por texto.',
            custom: renderVoiceCard
        },
        {
            id: 'wakeWordEnabled',
            icon: '🎙️',
            title: 'Activación por voz "Hi Gunter"',
            description: 'Gunter te escucha cuando lo llamas y activa una conversación natural.',
            custom: renderWakeWordCard
        },

        // ================ Premium Intelligence (Sprint A) ================
        {
            id: 'dailyPlanner',
            icon: '🌅',
            title: 'Planificador del día',
            description: 'Organiza tus tareas, reuniones, pagos y proyectos en un plan diario priorizado con IA.',
            section: 'intelligence',
            subs: [
                { key: 'dailyPlannerMorningBrief',     label: 'Brief matutino',
                  subStatus: 'included_in_parent',
                  hint: 'El plan del día siempre incluye un resumen ejecutivo en la parte superior.' },
                { key: 'dailyPlannerTimeBlocks',       label: 'Sugerir bloques de tiempo',
                  subStatus: 'included_in_parent',
                  hint: 'El plan ya propone bloques 9-12, 14-17 y 17-19 con cada prioridad.' },
                { key: 'dailyPlannerWhatsappSummary',  label: 'Enviar el plan por WhatsApp',
                  subStatus: 'included_in_parent',
                  hint: 'El botón "📋 Copiar para WhatsApp" del panel ya genera el brief listo.' }
            ]
        },
        {
            id: 'weeklyPlanner',
            icon: '📅',
            title: 'Organiza mi semana',
            description: 'Distribuye tareas, reuniones y prioridades en la semana, equilibrando carga y proyectos.',
            section: 'intelligence',
            subs: [
                { key: 'weeklyPlannerAutoDistribution', label: 'Distribuir tareas automáticamente',
                  subStatus: 'included_in_parent',
                  hint: 'El plan ya asigna foco por día según prioridad y vencimientos.' },
                { key: 'weeklyPlannerCalendarBlocks',   label: 'Crear bloques en Calendar',
                  subStatus: 'coming_soon',
                  hint: 'Creación masiva de eventos en Google Calendar (con confirmación obligatoria) llegará en una próxima versión.' },
                { key: 'weeklyPlannerProjectBalance',   label: 'Balancear carga entre proyectos',
                  subStatus: 'included_in_parent',
                  hint: 'El plan ya muestra carga por proyecto con barras visuales.' }
            ]
        },
        {
            id: 'projectAutoFollowUp',
            icon: '🎯',
            title: 'Seguimiento automático de proyectos',
            description: 'Detecta proyectos sin actividad, tareas vencidas, reuniones sin próximos pasos y riesgos de retraso.',
            section: 'intelligence',
            subs: [
                { key: 'projectAutoFollowUpInactiveProjects', label: 'Avisar proyectos inactivos',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto. Detecta proyectos >7 días sin actividad.' },
                { key: 'projectAutoFollowUpOverdueTasks',     label: 'Avisar tareas vencidas por proyecto',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto.' },
                { key: 'projectAutoFollowUpNoNextStep',       label: 'Avisar reuniones sin próximos pasos',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto.' }
            ]
        },
        {
            id: 'projectExecutiveSummary',
            icon: '📊',
            title: 'Resumen ejecutivo por proyecto',
            description: 'Genera un estado claro del proyecto con avances, pendientes, riesgos, decisiones y próximos pasos.',
            section: 'intelligence',
            subs: [
                { key: 'projectExecutiveSummaryRisks',     label: 'Incluir riesgos detectados',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto.' },
                { key: 'projectExecutiveSummaryNextSteps', label: 'Incluir próximos pasos sugeridos',
                  subStatus: 'included_in_parent',
                  hint: 'Activo por defecto.' },
                { key: 'projectExecutiveSummaryExport',    label: 'Exportar resumen como PDF',
                  subStatus: 'coming_soon',
                  hint: 'Export PDF dedicado del resumen ejecutivo llegará en una próxima versión. (Las presentaciones sí se exportan a PDF/PPTX desde results.html.)' }
            ]
        },
        {
            id: 'meetingSmartFollowUp',
            icon: '✅',
            title: 'Follow-up inteligente después de reuniones',
            description: 'Detecta compromisos, tareas, responsables y decisiones al terminar una reunión.',
            section: 'intelligence',
            subs: [
                { key: 'meetingSmartFollowUpTasks',     label: 'Sugerir tareas detectadas' },
                { key: 'meetingSmartFollowUpDecisions', label: 'Guardar decisiones detectadas' },
                { key: 'meetingSmartFollowUpWhatsapp',  label: 'Enviar resumen por WhatsApp',
                  hint: 'Requiere WhatsApp Assistant conectado.' }
            ]
        },
        {
            id: 'urgencyRanking',
            icon: '🔥',
            title: 'Ranking de urgencia',
            description: 'Ordena tareas y proyectos según vencimiento, impacto, dinero, riesgo y prioridad.',
            section: 'intelligence',
            subs: [
                { key: 'urgencyRankingByDueDate',       label: 'Ponderar por fecha de vencimiento',
                  subStatus: 'included_in_parent',
                  hint: 'Peso 30 puntos para vencidas, 18 para vence hoy. Siempre activo.' },
                { key: 'urgencyRankingByProjectImpact', label: 'Ponderar por impacto del proyecto',
                  subStatus: 'included_in_parent',
                  hint: 'Peso 6 puntos por proyecto activo. Siempre activo.' },
                { key: 'urgencyRankingByMoney',         label: 'Ponderar por dinero involucrado',
                  subStatus: 'included_in_parent',
                  hint: 'Peso 15 puntos por monto. Siempre activo en pagos pendientes.' }
            ]
        },
        {
            id: 'project360',
            icon: '🛰️',
            title: 'Cliente / Proyecto 360',
            description: 'Vista completa de cada proyecto: tareas, reuniones, documentos, decisiones, pagos, riesgos y próximos pasos.',
            section: 'intelligence',
            subs: [
                { key: 'project360Tasks',     label: 'Mostrar tareas' },
                { key: 'project360Meetings',  label: 'Mostrar reuniones' },
                { key: 'project360Documents', label: 'Mostrar documentos' },
                { key: 'project360Decisions', label: 'Mostrar decisiones' },
                { key: 'project360Calendar',  label: 'Mostrar próximos eventos' }
            ]
        },
        {
            id: 'decisionCenter',
            icon: '🧭',
            title: 'Centro de decisiones',
            description: 'Guarda, organiza y permite consultar decisiones importantes tomadas en reuniones o conversaciones.',
            section: 'intelligence',
            subs: [
                { key: 'decisionCenterAutoDetect', label: 'Detectar decisiones automáticamente' },
                { key: 'decisionCenterTimeline',   label: 'Mostrar timeline de decisiones' },
                { key: 'decisionCenterSearch',     label: 'Buscar decisiones por palabra clave' }
            ]
        },
        {
            id: 'smartWhatsappAlerts',
            icon: '🔔',
            title: 'Alertas inteligentes por WhatsApp',
            description: 'Envía alertas con contexto sobre pagos, reuniones, tareas vencidas, proyectos quietos y riesgos.',
            section: 'intelligence',
            subs: [
                { key: 'smartWhatsappAlertsMorning',     label: 'Resumen matutino' },
                { key: 'smartWhatsappAlertsDuePayments', label: 'Pagos próximos a vencer' },
                { key: 'smartWhatsappAlertsProjectRisk', label: 'Proyectos en riesgo' }
            ]
        },
        {
            id: 'delegationMode',
            icon: '🤝',
            title: 'Modo delegación',
            description: 'Convierte tareas en mensajes claros para delegar por WhatsApp o copiar y enviar.',
            section: 'intelligence',
            subs: [
                { key: 'delegationModeMessageDrafts',  label: 'Generar borradores de mensaje' },
                { key: 'delegationModeWhatsappDrafts', label: 'Sugerir envío por WhatsApp' },
                { key: 'delegationModeFollowUp',       label: 'Crear recordatorio de seguimiento' }
            ]
        }
    ];

    // Estilos de voz descriptivos
    const VOICE_STYLES = [
        { id: 'professional',       icon: '🎩', name: 'Asistente ejecutivo',     hint: 'Sobrio, estratégico, sin ruido' },
        { id: 'warm',               icon: '☕', name: 'Cálido',                  hint: 'Cercano y relajado' },
        { id: 'chaotic_scientist',  icon: '🧪', name: 'Científico caótico',      hint: 'Sarcástico, ácido, brillante' },
        { id: 'energetic_cartoon',  icon: '🎉', name: 'Caricatura energética',   hint: 'Hiperactivo, optimista, motivador' },
        { id: 'minimal_penguin',    icon: '🐧', name: 'Pingüino minimalista',    hint: 'Seco, breve, raro' },
        { id: 'executive',          icon: '💼', name: 'Ejecutivo premium',       hint: 'Clara, profesional, calmada' },
        { id: 'focus_coach',        icon: '🎯', name: 'Coach de enfoque',        hint: 'Firme, motivador, guiado' }
    ];

    // ---------- Core render ----------
    let rootEl = null;

    function mount(selector = '#premium-panel') {
        rootEl = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!rootEl) return;
        rootEl.classList.add('gps');
        render();
        // Re-render on any flag change from outside
        S().subscribe(() => render());
    }

    function render() {
        if (!rootEl) return;

        // Primer feature de cada sección recibe un divider previo.
        let lastSection = null;
        const cards = FEATURE_MAP.map(f => {
            const sec = f.section || 'core';
            let prefix = '';
            if (sec !== lastSection) {
                if (sec === 'intelligence') {
                    prefix = `
                        <div class="gps__section-divider" data-section="intelligence">
                            <span class="gps__section-icon">✨</span>
                            <div class="gps__section-text">
                                <h4>Inteligencia Premium</h4>
                                <p>Funciones que combinan tu memoria de proyectos con IA para planear, priorizar y delegar.</p>
                            </div>
                        </div>
                    `;
                }
                lastSection = sec;
            }
            return prefix + renderCard(f);
        }).join('');

        rootEl.innerHTML = `
            <div class="gps__intro">
                <span class="gps__intro-icon">✨</span>
                <div>
                    <h3>Funciones Premium de Gunter</h3>
                    <p>Activa módulos avanzados según lo que necesites. Todo se guarda localmente.
                       Las funciones que requieren cuenta externa muestran instrucciones al activarse.</p>
                </div>
                <div class="gps__intro-actions">
                    <button class="gps-inline-btn" id="gps-reset">Restablecer</button>
                    <button class="gps-inline-btn" id="gps-export">Exportar</button>
                </div>
            </div>
            <div class="gps__grid" id="gps-grid">
                ${cards}
            </div>
        `;
        wireMaster();
    }

    function renderCard(feature) {
        if (feature.custom) return feature.custom(feature);
        const enabled = S().isEnabled(feature.id);
        const status = S().getFeatureStatus(feature.id);
        const subs = (feature.subs || []).map(renderSub).join('');
        return `
            <div class="gps-card ${enabled ? 'gps-card--active' : ''}" data-feature="${feature.id}">
                <div class="gps-card__head">
                    <div class="gps-card__icon">${feature.icon}</div>
                    <div class="gps-card__title">
                        <h4>${esc(feature.title)}</h4>
                        <p>${esc(feature.description)}</p>
                    </div>
                    <button class="gps-switch" role="switch" aria-checked="${enabled}"
                        data-switch="${feature.id}" title="${enabled ? 'Desactivar' : 'Activar'}"></button>
                </div>
                <div class="gps-card__controls">
                    ${badge(status)}
                    ${subs || feature.action
                        ? `<button class="gps-card__toggle-cfg" aria-expanded="false" data-toggle-cfg="${feature.id}">Configurar</button>`
                        : '<span></span>'}
                </div>
                ${(subs || feature.action) ? `
                    <div class="gps-card__details" data-details="${feature.id}">
                        ${subs}
                        ${feature.action ? renderAction(feature) : ''}
                        ${noteFor(feature.id, status)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderSub(sub) {
        const enabled = S().isEnabled(sub.key);

        // Fase C — Honestidad de configuración: subStatus puede ser:
        //   'configurable'         (default — toggle real, igual que antes)
        //   'included_in_parent'   (badge "Incluido"; toggle deshabilitado)
        //   'coming_soon'          (badge "Próximamente"; toggle deshabilitado)
        //   'in_preparation'       (badge "En preparación"; toggle deshabilitado)
        const status = sub.subStatus || 'configurable';

        if (status === 'configurable') {
            return `
                <div class="gps-sub">
                    <div>
                        <div class="gps-sub__label">${esc(sub.label)}</div>
                        ${sub.hint ? `<div class="gps-sub__hint">${esc(sub.hint)}</div>` : ''}
                    </div>
                    <button class="gps-switch" role="switch" aria-checked="${enabled}"
                        data-switch="${sub.key}" title="${enabled ? 'Desactivar' : 'Activar'}"></button>
                </div>
            `;
        }

        // Mapeo visual de los 3 estados no configurables
        const badgeClass = status === 'included_in_parent' ? 'gps-sub__badge--included'
                        : status === 'coming_soon'         ? 'gps-sub__badge--coming'
                        :                                    'gps-sub__badge--prep';
        const badgeText  = status === 'included_in_parent' ? 'Incluido'
                        : status === 'coming_soon'         ? 'Próximamente'
                        :                                    'En preparación';

        // El toggle se renderiza pero deshabilitado (visual y semánticamente).
        // El click muestra mensaje humano via guard en wireMaster (no muta el flag).
        return `
            <div class="gps-sub gps-sub--readonly" title="${esc(badgeText)}">
                <div>
                    <div class="gps-sub__label">
                        ${esc(sub.label)}
                        <span class="gps-sub__badge ${badgeClass}">${badgeText}</span>
                    </div>
                    ${sub.hint ? `<div class="gps-sub__hint">${esc(sub.hint)}</div>` : ''}
                </div>
                <button class="gps-switch gps-switch--readonly" role="switch"
                    aria-checked="false" aria-disabled="true" disabled
                    data-readonly-sub="${sub.key}"
                    data-readonly-status="${status}"
                    title="${esc(badgeText)}"></button>
            </div>
        `;
    }

    function renderAction(feature) {
        if (feature.action === 'google-connect') {
            const connected = !!(window.GunterGoogleAuth && window.GunterGoogleAuth.isConnected && window.GunterGoogleAuth.isConnected());
            return `
                <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                    <button class="gps-inline-btn ${connected ? '' : 'gps-inline-btn--primary'}" data-action="google-toggle-connect">
                        ${connected ? 'Desconectar Google' : 'Conectar Google Calendar'}
                    </button>
                    ${connected ? `<span class="gps-sub__hint">Conectado: ${esc(window.GunterGoogleAuth.getUserEmail?.() || 'Google')}</span>` : ''}
                </div>`;
        }
        if (feature.action === 'whatsapp-qr') {
            return `
                <div style="margin-top:10px;">
                    <button class="gps-inline-btn gps-inline-btn--primary" data-action="whatsapp-qr">📱 Conectar con QR</button>
                </div>`;
        }
        return '';
    }

    function noteFor(id, status) {
        if (status === 'requires_connection' && id.startsWith('googleCalendar')) {
            return `<div class="gps-warning">⚠️ Requiere conexión con Google. Conecta tu cuenta abajo para activar la sincronización real.</div>`;
        }
        if (status === 'requires_connection' && id.startsWith('whatsapp')) {
            return `<div class="gps-warning">⚠️ Requiere WhatsApp Business API conectada a un backend. La UI está lista; la integración real llegará próximamente.</div>`;
        }
        if (id === 'documentSync') {
            return `<div class="gps-warning">⚠️ Notion y Google Drive requieren autenticación OAuth con sus APIs. Próximamente.</div>`;
        }
        return '';
    }

    // ---------- Personality (custom card) ----------
    function renderPersonalityCard(feature) {
        const enabled = S().isEnabled(feature.id);
        const status = S().getFeatureStatus(feature.id);
        const p = S().getPersonalityConfig();
        const modes = S().ENUMS.personalityMode;
        const ints = S().ENUMS.personalityIntensity;
        return `
            <div class="gps-card ${enabled ? 'gps-card--active' : ''}" data-feature="${feature.id}">
                <div class="gps-card__head">
                    <div class="gps-card__icon">${feature.icon}</div>
                    <div class="gps-card__title">
                        <h4>${esc(feature.title)}</h4>
                        <p>${esc(feature.description)}</p>
                    </div>
                    <button class="gps-switch" role="switch" aria-checked="${enabled}"
                        data-switch="${feature.id}"></button>
                </div>
                <div class="gps-card__controls">
                    ${badge(status)}
                    <button class="gps-card__toggle-cfg" aria-expanded="false" data-toggle-cfg="${feature.id}">Configurar</button>
                </div>
                <div class="gps-card__details" data-details="${feature.id}">
                    <div class="gps-sub">
                        <div>
                            <div class="gps-sub__label">Modo</div>
                            <div class="gps-sub__hint">Cómo suena y razona Gunter</div>
                        </div>
                    </div>
                    <div class="gps-pills" data-enum="personalityMode">
                        ${modes.map(m => `<button class="gps-pill ${p.mode === m ? 'is-active' : ''}" data-enum-value="${m}">${humanMode(m)}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:12px;">
                        <div>
                            <div class="gps-sub__label">Intensidad</div>
                            <div class="gps-sub__hint">Del tono suave al más mordaz</div>
                        </div>
                    </div>
                    <div class="gps-pills" data-enum="personalityIntensity">
                        ${ints.map(i => `<button class="gps-pill ${p.intensity === i ? 'is-active' : ''}" data-enum-value="${i}">${humanIntensity(i)}</button>`).join('')}
                    </div>

                    <div class="gps-sub gps-sub--coming" style="margin-top:6px;" title="En preparación">
                        <div class="gps-sub__label">Coach de enfoque
                            <span class="gps-sub__badge gps-sub__badge--coming">Próximamente</span>
                        </div>
                        <span class="gps-sub__hint">Este modo coach activo llegará en una próxima versión. Mientras tanto, el LLM ya adapta tono según el estilo de voz elegido.</span>
                    </div>
                    <div class="gps-sub gps-sub--coming" title="En preparación">
                        <div class="gps-sub__label">Bloquear distracciones
                            <span class="gps-sub__badge gps-sub__badge--coming">Próximamente</span>
                        </div>
                        <span class="gps-sub__hint">Bloqueador de notificaciones del navegador llegará en una próxima versión.</span>
                    </div>
                    <div class="gps-sub gps-sub--coming" title="En preparación">
                        <div class="gps-sub__label">Timer inteligente
                            <span class="gps-sub__badge gps-sub__badge--coming">Próximamente</span>
                        </div>
                        <span class="gps-sub__hint">Pomodoro adaptativo llegará en una próxima versión.</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ---------- Voice (custom card) ----------
    function renderVoiceCard(feature) {
        const enabled = S().isEnabled(feature.id);
        const cfg = S().getVoiceConfig();
        const status = cfg.supported ? S().getFeatureStatus(feature.id) : 'unsupported';
        const modes = S().ENUMS.voiceMode;
        const speeds = S().ENUMS.voiceSpeed;
        const tones = S().ENUMS.voiceTone;
        return `
            <div class="gps-card ${enabled ? 'gps-card--active' : ''}" data-feature="${feature.id}">
                <div class="gps-card__head">
                    <div class="gps-card__icon">${feature.icon}</div>
                    <div class="gps-card__title">
                        <h4>${esc(feature.title)}</h4>
                        <p>${esc(feature.description)}</p>
                    </div>
                    <button class="gps-switch" role="switch" aria-checked="${enabled}"
                        data-switch="${feature.id}" ${cfg.supported ? '' : 'disabled'}></button>
                </div>
                <div class="gps-card__controls">
                    ${badge(status)}
                    <button class="gps-card__toggle-cfg" aria-expanded="false" data-toggle-cfg="${feature.id}">Configurar</button>
                </div>
                <div class="gps-card__details" data-details="${feature.id}">
                    ${cfg.supported ? '' : `<div class="gps-warning gps-warning--error">Este navegador no soporta <code>speechSynthesis</code>. Usa Chrome/Edge/Safari.</div>`}

                    <div class="gps-sub">
                        <div>
                            <div class="gps-sub__label">Modo de voz</div>
                            <div class="gps-sub__hint">Qué tanto habla Gunter</div>
                        </div>
                    </div>
                    <div class="gps-pills" data-enum="voiceMode">
                        ${modes.map(m => `<button class="gps-pill ${cfg.mode === m ? 'is-active' : ''}" data-enum-value="${m}">${humanVoiceMode(m)}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:12px;">
                        <div>
                            <div class="gps-sub__label">Estilo y personalidad vocal</div>
                            <div class="gps-sub__hint">Cada estilo cambia tono, ritmo y jerga (estilos originales, no clonaciones)</div>
                        </div>
                    </div>
                    <div class="gps-voice-grid" data-enum="voiceStyle">
                        ${VOICE_STYLES.map(v => `
                            <button class="gps-voice-card ${cfg.style === v.id ? 'is-active' : ''}" data-enum-value="${v.id}">
                                <span class="gps-voice-card__icon">${v.icon}</span>
                                <div class="gps-voice-card__name">${esc(v.name)}</div>
                                <div class="gps-voice-card__hint">${esc(v.hint)}</div>
                            </button>
                        `).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:12px;">
                        <div class="gps-sub__label">Velocidad</div>
                    </div>
                    <div class="gps-pills" data-enum="voiceSpeed">
                        ${speeds.map(s => `<button class="gps-pill ${cfg.speed === s ? 'is-active' : ''}" data-enum-value="${s}">${humanSpeed(s)}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:10px;">
                        <div class="gps-sub__label">Tono</div>
                    </div>
                    <div class="gps-pills" data-enum="voiceTone">
                        ${tones.map(t => `<button class="gps-pill ${cfg.tone === t ? 'is-active' : ''}" data-enum-value="${t}">${humanTone(t)}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:6px;">
                        <div class="gps-sub__label">Voz también en reuniones en vivo</div>
                        <button class="gps-switch" role="switch" aria-checked="${cfg.inMeetings}" data-switch="voiceInMeetings"></button>
                    </div>
                    <div class="gps-sub">
                        <div>
                            <div class="gps-sub__label">Voz solo tras "Hi Gunter"</div>
                            <div class="gps-sub__hint">Requiere activación de wake word</div>
                        </div>
                        <button class="gps-switch" role="switch" aria-checked="${cfg.onlyAfterWakeWord}" data-switch="voiceOnlyAfterWakeWord"></button>
                    </div>

                    <div style="margin-top:12px; display:flex; gap:8px;">
                        <button class="gps-inline-btn gps-inline-btn--primary" data-action="voice-test">🔊 Probar voz</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ---------- Wake Word (custom card) ----------
    function renderWakeWordCard(feature) {
        const enabled = S().isEnabled(feature.id);
        const cfg = S().getWakeWordConfig();
        const status = cfg.supported ? S().getFeatureStatus(feature.id) : 'unsupported';
        const lm = S().ENUMS.wakeWordListeningMode;
        const rm = S().ENUMS.wakeWordResponseMode;
        return `
            <div class="gps-card ${enabled ? 'gps-card--active' : ''}" data-feature="${feature.id}">
                <div class="gps-card__head">
                    <div class="gps-card__icon">${feature.icon}</div>
                    <div class="gps-card__title">
                        <h4>${esc(feature.title)}</h4>
                        <p>${esc(feature.description)}</p>
                    </div>
                    <button class="gps-switch" role="switch" aria-checked="${enabled}"
                        data-switch="${feature.id}" ${cfg.supported ? '' : 'disabled'}></button>
                </div>
                <div class="gps-card__controls">
                    ${badge(status)}
                    <button class="gps-card__toggle-cfg" aria-expanded="false" data-toggle-cfg="${feature.id}">Configurar</button>
                </div>
                <div class="gps-card__details" data-details="${feature.id}">
                    ${cfg.supported ? '' : `<div class="gps-warning gps-warning--error">Este navegador no soporta <code>SpeechRecognition</code>. Usa Chrome, Edge o Safari.</div>`}

                    <div class="gps-sub">
                        <div>
                            <div class="gps-sub__label">Palabra de activación</div>
                            <div class="gps-sub__hint">Dirás esto para despertarlo</div>
                        </div>
                        <input type="text" value="${esc(cfg.wakeWord)}" data-field="wakeWord" maxlength="30"
                            style="background: transparent; border: 1px solid var(--gps-border); color: var(--gps-text); padding: 4px 10px; border-radius: 6px; font-family: inherit; font-size: 12px; width: 140px; text-align: right;">
                    </div>

                    <div class="gps-sub">
                        <div class="gps-sub__label">Modo de escucha</div>
                    </div>
                    <div class="gps-pills" data-enum="wakeWordListeningMode">
                        ${lm.map(m => `<button class="gps-pill ${cfg.listeningMode === m ? 'is-active' : ''}" data-enum-value="${m}">${m === 'manual' ? 'Manual (botón)' : 'Continuo'}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:10px;">
                        <div class="gps-sub__label">Cómo responde</div>
                    </div>
                    <div class="gps-pills" data-enum="wakeWordResponseMode">
                        ${rm.map(m => `<button class="gps-pill ${cfg.responseMode === m ? 'is-active' : ''}" data-enum-value="${m}">${m === 'voice' ? 'Con voz' : 'Solo texto'}</button>`).join('')}
                    </div>

                    <div class="gps-sub" style="margin-top:10px;">
                        <div>
                            <div class="gps-sub__label">Auto-stop tras silencio</div>
                            <div class="gps-sub__hint">Segundos sin hablar antes de volver a dormirse</div>
                        </div>
                        <input type="range" min="5" max="60" step="5" value="${cfg.autoStopSeconds}"
                            data-field="wakeWordAutoStopSeconds" class="gps-range">
                        <span data-field-display="wakeWordAutoStopSeconds" style="font-family:'JetBrains Mono',monospace; color: var(--gps-accent); font-size: 12px; min-width: 40px; text-align: right;">${cfg.autoStopSeconds}s</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ---------- Event wiring ----------
    function wireMaster() {
        rootEl.addEventListener('click', (e) => {
            // Fase C — guard de subs readonly (subStatus !== 'configurable')
            const ro = e.target.closest('[data-readonly-sub]');
            if (ro) return onReadonlyClick(ro);

            const sw = e.target.closest('[data-switch]');
            if (sw) return onSwitch(sw);
            const tog = e.target.closest('[data-toggle-cfg]');
            if (tog) return onToggleCfg(tog);
            const pill = e.target.closest('[data-enum-value]');
            if (pill) return onEnumPick(pill);
            const act = e.target.closest('[data-action]');
            if (act) return onAction(act);
        });

        rootEl.addEventListener('input', (e) => {
            const f = e.target.closest('[data-field]');
            if (!f) return;
            const key = f.dataset.field;
            const val = f.type === 'range' ? parseInt(f.value, 10) : f.value;
            S().set(key, val);
            // live display for range
            const disp = rootEl.querySelector(`[data-field-display="${key}"]`);
            if (disp) disp.textContent = f.type === 'range' ? `${val}s` : val;
        });

        rootEl.querySelector('#gps-reset')?.addEventListener('click', () => {
            if (confirm('¿Restablecer todas las funciones premium a sus valores por defecto?')) {
                S().reset();
            }
        });
        rootEl.querySelector('#gps-export')?.addEventListener('click', () => {
            const blob = new Blob([S().export()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'gunter-premium-features.json'; a.click();
            URL.revokeObjectURL(url);
        });
    }

    function onSwitch(btn) {
        const key = btn.dataset.switch;
        const newVal = btn.getAttribute('aria-checked') !== 'true';
        S().set(key, newVal);
    }

    // Fase C — Click en sub no configurable: mensaje humano sin mutar nada
    function onReadonlyClick(btn) {
        const key = btn.dataset.readonlySub;
        const status = btn.dataset.readonlyStatus;
        const messages = {
            included_in_parent: 'Esta opción está incluida en la lógica principal del módulo. Cuando el módulo está activo, este comportamiento ya funciona — no necesitas activarla por separado.',
            coming_soon:        'Esta subfunción está en preparación. Por ahora el módulo principal cubre lo esencial.',
            in_preparation:     'Esta subfunción está en preparación. Te avisaremos cuando esté lista.'
        };
        const msg = messages[status] || messages.coming_soon;

        if (window.GunterNotificationsService?.showToast) {
            window.GunterNotificationsService.showToast(msg, {
                variant: 'info',
                duration: 5000,
                silent: true
            });
        } else {
            // Fallback no intrusivo
            console.info('[premium]', key, '→', status, '—', msg);
        }
    }

    function onToggleCfg(btn) {
        const id = btn.dataset.toggleCfg;
        const details = rootEl.querySelector(`[data-details="${id}"]`);
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (details) details.classList.toggle('is-open', !expanded);
    }

    function onEnumPick(pill) {
        const container = pill.closest('[data-enum]');
        if (!container) return;
        const key = container.dataset.enum;
        const value = pill.dataset.enumValue;
        S().set(key, value);
    }

    function onAction(btn) {
        const act = btn.dataset.action;
        if (act === 'google-toggle-connect') return handleGoogleToggle();
        if (act === 'whatsapp-qr') return openWhatsAppQr();
        if (act === 'voice-test') return testVoice();
    }

    // ---------- Action handlers ----------
    async function handleGoogleToggle() {
        if (!window.GunterGoogleAuth) {
            alert('El servicio de Google no está cargado. Recarga la página.');
            return;
        }
        if (window.GunterGoogleAuth.isConnected()) {
            window.GunterGoogleAuth.disconnect();
            render();
            return;
        }
        try {
            await window.GunterGoogleAuth.connect();
            render();
        } catch (err) {
            if (window.GunterErrors) {
                alert(window.GunterErrors.format1(err, { context: 'calendar' }));
            } else {
                alert('No se pudo conectar: ' + (err.message || String(err)));
            }
        }
    }

    function openWhatsAppQr() {
        if (!window.GunterWhatsApp) {
            alert('El servicio de WhatsApp no está cargado. Recarga la página.');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'gps-modal';
        overlay.innerHTML = `
            <div class="gps-modal__box gps-wa-modal">
                <h3>WhatsApp</h3>
                <div class="gps-wa-status" id="gps-wa-status">Iniciando…</div>
                <div class="gps-modal__qr" id="gps-wa-qr-wrap" style="display:none;">
                    <img id="gps-wa-qr-img" src="" alt="QR WhatsApp">
                </div>
                <p id="gps-wa-hint" style="font-size:12px; color: var(--gps-text-dim);">
                    Abre WhatsApp en tu teléfono → Menú → Dispositivos vinculados → Vincular un dispositivo → Escanea este QR.
                </p>

                <div id="gps-wa-connected" style="display:none;">
                    <p>Número vinculado: <strong id="gps-wa-phone">—</strong></p>
                    <div class="gps-wa-chat" id="gps-wa-chat"></div>
                    <form id="gps-wa-send" style="display:flex; gap:8px; margin-top:10px;">
                        <input type="tel" id="gps-wa-to" placeholder="Número destino (ej. 573001234567)" style="flex:1; padding:8px 10px; border-radius:6px; border:1px solid var(--gps-border); background:transparent; color:var(--gps-text); font-family:inherit; font-size:12px;">
                        <input type="text" id="gps-wa-text" placeholder="Mensaje" style="flex:2; padding:8px 10px; border-radius:6px; border:1px solid var(--gps-border); background:transparent; color:var(--gps-text); font-family:inherit; font-size:12px;">
                        <button type="submit" class="gps-inline-btn gps-inline-btn--primary">Enviar</button>
                    </form>
                    <button class="gps-inline-btn" id="gps-wa-disconnect" style="margin-top:12px;">Desconectar y borrar sesión</button>
                </div>

                <button class="gps-modal__close" id="gps-wa-close" style="margin-top:14px;">Cerrar</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const statusEl = overlay.querySelector('#gps-wa-status');
        const qrWrap = overlay.querySelector('#gps-wa-qr-wrap');
        const qrImg = overlay.querySelector('#gps-wa-qr-img');
        const hintEl = overlay.querySelector('#gps-wa-hint');
        const connectedEl = overlay.querySelector('#gps-wa-connected');
        const phoneEl = overlay.querySelector('#gps-wa-phone');
        const chatEl = overlay.querySelector('#gps-wa-chat');
        const closeBtn = overlay.querySelector('#gps-wa-close');
        const disconnectBtn = overlay.querySelector('#gps-wa-disconnect');
        const sendForm = overlay.querySelector('#gps-wa-send');

        let alive = true;
        let pollTimer = null;

        async function refresh() {
            if (!alive) return;
            const s = await window.GunterWhatsApp.status();
            const q = await window.GunterWhatsApp.qr();

            if (s.state === 'connected') {
                qrWrap.style.display = 'none';
                hintEl.textContent = '';
                connectedEl.style.display = 'block';
                phoneEl.textContent = s.phone || '(desconocido)';
                statusEl.innerHTML = '<span style="color:var(--gps-ok);">✓ Conectado</span>';
                await renderChat();
                // Update the Premium card as well
                render();
            } else if (s.state === 'qr_ready' || q.qr) {
                statusEl.innerHTML = '<span style="color:var(--gps-pending);">📱 Esperando que escanees el QR…</span>';
                qrWrap.style.display = 'block';
                connectedEl.style.display = 'none';
                if (q.qr) qrImg.src = q.qr;
            } else if (s.state === 'connecting') {
                statusEl.innerHTML = '<span style="color:var(--gps-pending);">Conectando…</span>';
                qrWrap.style.display = 'none';
                connectedEl.style.display = 'none';
            } else if (s.state === 'error') {
                statusEl.innerHTML = `<span style="color:var(--gps-error);">⚠ Error: ${esc(s.error || 'desconocido')}</span>`;
            } else {
                statusEl.innerHTML = '<span style="color:var(--gps-text-mute);">Desconectado</span>';
                qrWrap.style.display = 'none';
                connectedEl.style.display = 'none';
                try { await window.GunterWhatsApp.connect(); } catch {}
            }
        }

        async function renderChat() {
            const msgs = await window.GunterWhatsApp.messages(40);
            if (msgs.length === 0) {
                chatEl.innerHTML = '<p style="color:var(--gps-text-mute); font-size:12px; text-align:center; padding:16px;">Sin mensajes todavía. Envía algo desde tu WhatsApp para probar.</p>';
                return;
            }
            chatEl.innerHTML = msgs.reverse().map(m => `
                <div class="gps-wa-msg gps-wa-msg--${m.direction}">
                    <div class="gps-wa-msg__meta">
                        ${m.direction === 'in' ? '📥 ' + esc(m.from) : '📤 ' + esc(m.to || '')}
                        · ${new Date(m.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="gps-wa-msg__text">${esc(m.text)}</div>
                </div>
            `).join('');
            chatEl.scrollTop = chatEl.scrollHeight;
        }

        // Kick off: connect + start polling
        window.GunterWhatsApp.connect().catch(() => {});
        refresh();
        pollTimer = setInterval(refresh, 2500);

        sendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const to = overlay.querySelector('#gps-wa-to').value.trim();
            const text = overlay.querySelector('#gps-wa-text').value.trim();
            if (!to || !text) return;
            try {
                await window.GunterWhatsApp.send(to, text);
                overlay.querySelector('#gps-wa-text').value = '';
                await renderChat();
            } catch (err) {
                if (window.GunterErrors) alert(window.GunterErrors.format1(err, { context: 'whatsapp' }));
                else alert('Error al enviar: ' + (err.message || err));
            }
        });

        disconnectBtn.addEventListener('click', async () => {
            if (!confirm('¿Desconectar y borrar la sesión de WhatsApp? Tendrás que escanear el QR de nuevo la próxima vez.')) return;
            await window.GunterWhatsApp.disconnect();
            refresh();
        });

        const close = () => {
            alive = false;
            if (pollTimer) clearInterval(pollTimer);
            overlay.remove();
        };
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    }

    function testVoice() {
        if (!('speechSynthesis' in window)) {
            alert('Este navegador no soporta síntesis de voz.');
            return;
        }
        const cfg = S().getVoiceConfig();
        const phrases = {
            professional:      'La agenda está lista. Tres prioridades críticas para hoy.',
            warm:              'Hola, me alegra verte hoy. ¿En qué te ayudo primero?',
            chaotic_scientist: 'Listo, genio. Eso estaba a dos segundos de volverse un incendio.',
            energetic_cartoon: '¡Eso quedó agendadísimo! ¡Vamos a vencer esa lista como campeones!',
            minimal_penguin:   'Hecho. Eso vence mañana. Peligro.',
            executive:         'La reunión quedó programada. Calendario actualizado correctamente.',
            focus_coach:       'Enfócate en una sola tarea. La prioridad ahora es terminar esto.'
        };
        const text = phrases[cfg.style] || phrases.professional;
        // Usar el voice-service si está disponible (aplica estilo, voz nativa, etc.)
        if (window.GunterVoice?.speak) {
            window.GunterVoice.speak(text, { context: 'chat', force: true });
        } else {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'es-MX';
            u.rate = { slow: 0.85, normal: 1, fast: 1.2 }[cfg.speed] || 1;
            u.pitch = { calm: 0.9, neutral: 1, expressive: 1.15, intense: 1.25 }[cfg.tone] || 1;
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
        }
    }

    // ---------- Helpers ----------
    function badge(status) {
        const label = {
            active: 'Activo',
            inactive: 'Inactivo',
            requires_connection: 'Requiere conexión',
            coming_soon: 'Próximamente',
            error: 'Error',
            unsupported: 'No compatible'
        }[status] || 'Inactivo';
        return `<span class="gps-badge gps-badge--${status}">${label}</span>`;
    }
    function esc(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function humanMode(m) {
        return ({ professional: 'Profesional', direct: 'Directo', coach: 'Coach', fun: 'Divertido', strategic: 'Estratégico' })[m] || m;
    }
    function humanIntensity(i) {
        return ({ soft: 'Suave', normal: 'Normal', intense: 'Intenso' })[i] || i;
    }
    function humanVoiceMode(m) {
        return ({
            text_only: 'Solo texto',
            notifications_only: 'Solo notificaciones',
            live_voice: 'Voz en vivo',
            wake_word_only: 'Tras "Hi Gunter"'
        })[m] || m;
    }
    function humanSpeed(s) {
        return ({ slow: 'Lenta', normal: 'Normal', fast: 'Rápida' })[s] || s;
    }
    function humanTone(t) {
        return ({ calm: 'Calmada', neutral: 'Neutral', expressive: 'Expresiva', intense: 'Intensa' })[t] || t;
    }

    window.GunterAdvancedSettings = { mount };
})();
