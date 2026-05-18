// ============================================================
// AM PRO v2 — SHARED CONFIG
// Copy this file to both projects and fill in your credentials
// ============================================================

const AMPRO_CONFIG = {
  supabase: {
    url:    "https://tzojjwnqodcrhwjaasja.supabase.co",
    anon:   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418",
    // ⚠ NEVER expose service key in user-site. Admin panel only.
    service:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3MDY4MCwiZXhwIjoyMDkzMjQ2NjgwfQ.ZER36kgJNIvWE4StqUZEkOKssc7rcmol_-kD5h_YINE"
  },
  app: {
    name: "AM PRO",
    version: "2.0.0"
  }
};

// E2E Encryption helpers (Web Crypto API)
const E2E = {
  async generateKeyPair() {
    return await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey", "deriveBits"]
    );
  },
  async exportPublicKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  },
  async importPublicKey(b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return await crypto.subtle.importKey("raw", raw, { name: "ECDH", namedCurve: "P-256" }, true, []);
  },
  async deriveSharedKey(myPrivateKey, theirPublicKey) {
    return await crypto.subtle.deriveKey(
      { name: "ECDH", public: theirPublicKey },
      myPrivateKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },
  async encrypt(sharedKey, plaintext) {
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(plaintext);
    const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, enc);
    const buf = new Uint8Array(iv.length + ct.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(ct), iv.length);
    return btoa(String.fromCharCode(...buf));
  },
  async decrypt(sharedKey, ciphertext) {
    const buf = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv  = buf.slice(0, 12);
    const ct  = buf.slice(12);
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, ct);
    return new TextDecoder().decode(dec);
  },
  async storePrivateKey(key) {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    sessionStorage.setItem("ampro_pk", btoa(String.fromCharCode(...new Uint8Array(exported))));
  },
  async loadPrivateKey() {
    const stored = sessionStorage.getItem("ampro_pk");
    if (!stored) return null;
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
    return await crypto.subtle.importKey("pkcs8", raw, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey","deriveBits"]);
  }
};
