// =============================================
// GUNTER APP - Configuration (Environment Variables)
// =============================================
// NOTE: For production, this file should be in .gitignore
// and API keys should be handled securely on a backend server.

window.GUNTER_CONFIG = {
    // OpenAI API Configuration (REMOVED FOR SECURITY - USE PROXY)
    OPENAI_API_KEY: 'REMOVED_FOR_SECURITY',

    // Models
    CHAT_MODEL: 'gpt-4o-mini',
    WHISPER_MODEL: 'whisper-1',

    // Proxy Server URLs (to avoid CORS issues)
    PROXY_BASE_URL: 'http://localhost:3001',
    PROXY_TRANSCRIBE_URL: 'http://localhost:3001/api/transcribe',
    PROXY_CHAT_URL: 'http://localhost:3001/api/chat',
    PROXY_GEMINI_TEXT_URL: 'http://localhost:3001/api/gemini-text',
    PROXY_GEMINI_IMAGE_URL: 'http://localhost:3001/api/gemini-image',
    PROXY_GEMINI_STATUS_URL: 'http://localhost:3001/api/gemini-status',
    PROXY_DOCUMENT_EXTRACT_URL: 'http://localhost:3001/api/document-extract',
    PROXY_GOOGLE_STATUS_URL: 'http://localhost:3001/api/google/status',

    // Google OAuth — configura esto en .env como GOOGLE_CLIENT_ID y reinicia
    // npm run dev. Déjalo vacío aquí (el servidor lo inyectará al cliente).
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CALENDAR_SCOPE: 'https://www.googleapis.com/auth/calendar',

    // Calendar defaults
    CALENDAR_DEFAULT_CALENDAR_ID: 'primary',
    CALENDAR_DEFAULT_REMINDERS: [1440, 30],   // minutos antes del evento
    CALENDAR_URGENT_REMINDERS: [2880, 60, 10],

    // Direct OpenAI URLs (fallback)
    OPENAI_CHAT_URL: 'https://api.openai.com/v1/chat/completions',
    OPENAI_WHISPER_URL: 'https://api.openai.com/v1/audio/transcriptions',

    // App Settings
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,

    // Feature flags - USE_PROXY = true for audio transcription (required to avoid CORS)
    USE_PROXY: true,

    // Premium features
    PREMIUM_STORAGE_KEY: 'gunter_premium_features'
};

// Helper function to get the correct API URL
window.getApiUrl = function (type) {
    const config = window.GUNTER_CONFIG;
    if (config.USE_PROXY) {
        return type === 'chat' ? config.PROXY_CHAT_URL : config.PROXY_TRANSCRIBE_URL;
    }
    return type === 'chat' ? config.OPENAI_CHAT_URL : config.OPENAI_WHISPER_URL;
};

// Helper function to get API headers (only needed when not using proxy)
window.getOpenAIHeaders = function () {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.GUNTER_CONFIG.OPENAI_API_KEY}`
    };
};

// Helper for multipart requests (audio)
window.getOpenAIAuthHeader = function () {
    return {
        'Authorization': `Bearer ${window.GUNTER_CONFIG.OPENAI_API_KEY}`
    };
};

console.log('✅ Gunter Config loaded - Using OpenAI GPT-4o-mini');
console.log('📡 Proxy mode:', window.GUNTER_CONFIG.USE_PROXY ? 'ENABLED (http://localhost:3001)' : 'DISABLED');
