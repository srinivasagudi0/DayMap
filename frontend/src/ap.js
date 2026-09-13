const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE = isLocal ? "" : "https://daymap-future-api.onrender.com"

export function api(path) {
    return `${API_BASE}${path}`;
}
