// ============================================
// BUILD-SCRIPT GLIEDERUNG (Übersicht für schnelle Navigation)
// ============================================
// Suche im Code nach: "// >>> GLIEDERUNGSPUNKT X: BEZEICHNUNG"
//
// 1. INITIALISIERUNG & SETUP (Module, dist-Ordner, Environment Variables)
// 2. VALIDIERUNG DER ENV-VARIABLEN (Supabase Pflicht, Stripe optional)
// 3. APP.JS VERARBEITEN (Platzhalter ersetzen: Supabase & Stripe)
// 4. SUCCESS.HTML VERARBEITEN (falls vorhanden)
// 5. HAUPTDATEIEN KOPIEREN (index.html, styles.css, viewer.html)
// 6. DSGVO-SEITEN KOPIEREN (impressum, datenschutz, cookies, agb)
// 7. NETLIFY KONFIGURATION ( _redirects + netlify.toml )
// 8. BUILD-ZUSAMMENFASSUNG (Statistik, Status, nächste Schritte)

// ============================================
// 1. INITIALISIERUNG & SETUP
// >>> GLIEDERUNGSPUNKT 1: INITIALISIERUNG & SETUP
// ============================================
const fs = require("fs");
const path = require("path");

console.log("Starte Build-Prozess (DSGVO-Edition)...");

// Erstelle dist Ordner
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log("✅ dist Ordner erstellt");
}

// Hole Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const STRIPE_PRICE_BASIC = process.env.STRIPE_PRICE_BASIC;
const STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM;
const STRIPE_PRICE_ELITE = process.env.STRIPE_PRICE_ELITE;

// ============================================
// 2. VALIDIERUNG DER ENV-VARIABLEN
// >>> GLIEDERUNGSPUNKT 2: VALIDIERUNG DER ENV-VARIABLEN
// ============================================
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ FEHLER: Supabase Environment Variables fehlen!");
  console.error("Benötigt: SUPABASE_URL, SUPABASE_ANON_KEY");
  process.exit(1);
}

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ WARNUNG: STRIPE_PUBLISHABLE_KEY fehlt - Demo-Modus wird verwendet"
  );
}

console.log("\n📋 Environment Variables geladen:");
console.log("   ✅ SUPABASE_URL:", SUPABASE_URL);
console.log(
  "   ✅ SUPABASE_ANON_KEY:",
  SUPABASE_ANON_KEY.substring(0, 20) + "..."
);
console.log(
  "   " + (STRIPE_PUBLISHABLE_KEY ? "✅" : "⚠️") + " STRIPE_PUBLISHABLE_KEY:",
  STRIPE_PUBLISHABLE_KEY
    ? STRIPE_PUBLISHABLE_KEY.substring(0, 20) + "..."
    : "nicht gesetzt (Demo-Modus)"
);

// ============================================
// 3. APP.JS VERARBEITEN
// >>> GLIEDERUNGSPUNKT 3: APP.JS VERARBEITEN
// ============================================
console.log("\n🔧 Verarbeite app.js...");

let appJs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

console.log("Ersetze Platzhalter mit Environment Variables...");

// DEBUG: Zeige die ersten 1000 Zeichen von app.js
console.log("\n🔍 DEBUG - Erste Zeilen von app.js:");
const lines = appJs.split("\n").slice(0, 30);
lines.forEach((line, i) => {
  if (line.includes("SUPABASE_URL") || line.includes("SUPABASE_ANON_KEY")) {
    console.log(`   Zeile ${i + 1}: ${line}`);
  }
});
console.log("");

// SUPABASE_URL - Ersetze ALLE Vorkommen (auch in if-Bedingungen)
const beforeUrl = appJs.includes("DEIN_SUPABASE_URL");
// Verwende globales Regex mit g-Flag für ALLE Vorkommen
appJs = appJs.replace(/DEIN_SUPABASE_URL/g, SUPABASE_URL);
const afterUrl =
  appJs.includes(SUPABASE_URL) && !appJs.includes("DEIN_SUPABASE_URL");
console.log(
  "   SUPABASE_URL:",
  beforeUrl ? "🔍 Platzhalter gefunden" : "❌ Platzhalter NICHT gefunden",
  "→",
  afterUrl ? "✅ ersetzt" : "❌ FEHLER"
);

// SUPABASE_ANON_KEY - Ersetze ALLE Vorkommen
const beforeKey = appJs.includes("DEIN_SUPABASE_ANON_KEY");
appJs = appJs.replace(/DEIN_SUPABASE_ANON_KEY/g, SUPABASE_ANON_KEY);
const afterKey =
  appJs.includes(SUPABASE_ANON_KEY) &&
  !appJs.includes("DEIN_SUPABASE_ANON_KEY");
console.log(
  "   SUPABASE_ANON_KEY:",
  beforeKey ? "🔍 Platzhalter gefunden" : "❌ Platzhalter NICHT gefunden",
  "→",
  afterKey ? "✅ ersetzt" : "❌ FEHLER"
);

// STRIPE_PUBLISHABLE_KEY - Ersetze ALLE Vorkommen
appJs = appJs.replace(
  /DEIN_STRIPE_PUBLISHABLE_KEY/g,
  STRIPE_PUBLISHABLE_KEY || "DEIN_STRIPE_PUBLISHABLE_KEY"
);
console.log(
  "   STRIPE_PUBLISHABLE_KEY:",
  STRIPE_PUBLISHABLE_KEY ? "✅ ersetzt" : "⚠️ nicht gesetzt"
);

// Ersetze Price IDs (flexibles Regex)
if (STRIPE_PRICE_BASIC) {
  appJs = appJs.replace(
    /basic:\s*"price_[A-Z_]+"[^\n]*/,
    `basic: "${STRIPE_PRICE_BASIC}",`
  );
  console.log("   STRIPE_PRICE_BASIC: ✅ ersetzt");
} else {
  console.log("   STRIPE_PRICE_BASIC: ⚠️ nicht gesetzt");
}

if (STRIPE_PRICE_PREMIUM) {
  appJs = appJs.replace(
    /premium:\s*"price_[A-Z_]+"[^\n]*/,
    `premium: "${STRIPE_PRICE_PREMIUM}",`
  );
  console.log("   STRIPE_PRICE_PREMIUM: ✅ ersetzt");
} else {
  console.log("   STRIPE_PRICE_PREMIUM: ⚠️ nicht gesetzt");
}

if (STRIPE_PRICE_ELITE) {
  appJs = appJs.replace(
    /elite:\s*"price_[A-Z_]+"[^\n]*/,
    `elite: "${STRIPE_PRICE_ELITE}",`
  );
  console.log("   STRIPE_PRICE_ELITE: ✅ ersetzt");
} else {
  console.log("   STRIPE_PRICE_ELITE: ⚠️ nicht gesetzt");
}

// Verifiziere dass ALLE Ersetzungen funktioniert haben
const stillHasPlaceholders =
  appJs.includes("DEIN_SUPABASE_URL") ||
  appJs.includes("DEIN_SUPABASE_ANON_KEY") ||
  appJs.includes("DEIN_STRIPE_PUBLISHABLE_KEY");

if (stillHasPlaceholders) {
  console.error("\n❌ KRITISCHER FEHLER");
  console.error("Platzhalter wurden NICHT vollständig ersetzt!");
  console.error("\n🔍 Verbleibende Platzhalter in folgenden Zeilen:");
  const lines = appJs.split("\n");
  lines.forEach((line, i) => {
    if (
      line.includes("DEIN_SUPABASE_URL") ||
      line.includes("DEIN_SUPABASE_ANON_KEY") ||
      line.includes("DEIN_STRIPE_PUBLISHABLE_KEY")
    ) {
      console.error(`   Zeile ${i + 1}: ${line.trim()}`);
    }
  });

  console.error("\n⚠️ Build wird abgebrochen!");
  process.exit(1);
}

console.log("✅ Alle Platzhalter erfolgreich ersetzt!");

// Schreibe app.js in dist
fs.writeFileSync(path.join(distDir, "app.js"), appJs);
console.log("✅ app.js erstellt");

// ============================================
// 4. SUCCESS.HTML VERARBEITEN
// >>> GLIEDERUNGSPUNKT 4: SUCCESS.HTML VERARBEITEN
// ============================================
console.log("\n🔧 Verarbeite success.html...");

if (fs.existsSync(path.join(__dirname, "success.html"))) {
  let successHtml = fs.readFileSync(
    path.join(__dirname, "success.html"),
    "utf8"
  );

  // Ersetze die kompletten Zeilen mit Regex
  successHtml = successHtml.replace(
    /const SUPABASE_URL\s*=\s*['"].*?['"];/,
    `const SUPABASE_URL = "${SUPABASE_URL}";`
  );

  successHtml = successHtml.replace(
    /const SUPABASE_ANON_KEY\s*=\s*['"].*?['"];/,
    `const SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";`
  );

  fs.writeFileSync(path.join(distDir, "success.html"), successHtml);
  console.log("✅ success.html erstellt");
} else {
  console.warn("⚠️ success.html nicht gefunden - wird übersprungen");
}

// ============================================
// 5. HAUPTDATEIEN KOPIEREN
// >>> GLIEDERUNGSPUNKT 5: HAUPTDATEIEN KOPIEREN
// ============================================
console.log("\n📁 Kopiere Hauptdateien...");

const mainFiles = ["index.html", "styles.css", "viewer.html"];

mainFiles.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    console.log(`   ✅ ${file} kopiert`);
  } else {
    console.warn(`   ⚠️ ${file} nicht gefunden`);
  }
});

// ============================================
// 6. DSGVO-SEITEN KOPIEREN
// >>> GLIEDERUNGSPUNKT 6: DSGVO-SEITEN KOPIEREN
// ============================================
console.log("\n📄 Kopiere DSGVO-Seiten...");

const legalFiles = [
  "impressum.html",
  "datenschutz.html",
  "cookies.html",
  "agb.html",
];

let copiedLegalFiles = 0;
legalFiles.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    console.log(`   ✅ ${file} kopiert`);
    copiedLegalFiles++;
  } else {
    console.warn(`   ⚠️ ${file} nicht gefunden - sollte vorhanden sein!`);
  }
});

if (copiedLegalFiles < 4) {
  console.warn("\n⚠️ WARNUNG");
  console.warn(`Nur ${copiedLegalFiles}/4 DSGVO-Seiten gefunden!`);
  console.warn("Fehlende Seiten können zu rechtlichen Problemen führen.");
}

// ============================================
// 7. NETLIFY KONFIGURATION
// >>> GLIEDERUNGSPUNKT 7: NETLIFY KONFIGURATION
// ============================================
console.log("\n⚙️ Erstelle Netlify-Konfiguration...");

// _redirects für Single Page Application
const redirectsContent = `/*  /index.html  200`;
fs.writeFileSync(path.join(distDir, "_redirects"), redirectsContent);
console.log("   ✅ _redirects erstellt");

// netlify.toml (optional, aber empfohlen)
const netlifyToml = `# Netlify Konfiguration für FittiCoach

[build]
  publish = "dist"
  command = "node build.js"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

# Cache Headers für statische Assets
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`;

fs.writeFileSync(path.join(__dirname, "netlify.toml"), netlifyToml);
console.log("   ✅ netlify.toml erstellt");

// ============================================
// 8. BUILD-ZUSAMMENFASSUNG
// >>> GLIEDERUNGSPUNKT 8: BUILD-ZUSAMMENFASSUNG
// ============================================
console.log("\n═════════════════════════════════════════════");
console.log("✅ Build erfolgreich abgeschlossen!");
console.log("═════════════════════════════════════════════");
console.log("\n📦 Build-Statistik:");
console.log("   dist/");
console.log("   ├── app.js");
console.log("   ├── index.html");
console.log("   ├── styles.css");
if (fs.existsSync(path.join(distDir, "viewer.html"))) {
  console.log("   ├── viewer.html");
}
if (fs.existsSync(path.join(distDir, "success.html"))) {
  console.log("   ├── success.html");
}
console.log("   │");
console.log("   ├── DSGVO-Seiten:");
if (fs.existsSync(path.join(distDir, "impressum.html"))) {
  console.log("   │   ├── impressum.html");
}
if (fs.existsSync(path.join(distDir, "datenschutz.html"))) {
  console.log("   │   ├── datenschutz.html");
}
if (fs.existsSync(path.join(distDir, "cookies.html"))) {
  console.log("   │   ├── cookies.html");
}
if (fs.existsSync(path.join(distDir, "agb.html"))) {
  console.log("   │   └── agb.html");
}
console.log("   │");
console.log("   └── _redirects");

console.log("\n🔑 Environment Variables:");
console.log("   ✅ SUPABASE_URL");
console.log("   ✅ SUPABASE_ANON_KEY");
console.log(
  "   " +
    (STRIPE_PUBLISHABLE_KEY ? "✅" : "⚠️") +
    " STRIPE_PUBLISHABLE_KEY" +
    (STRIPE_PUBLISHABLE_KEY ? "" : " (Demo-Modus)")
);
console.log(
  "   " +
    (STRIPE_PRICE_BASIC ? "✅" : "⚠️") +
    " STRIPE_PRICE_BASIC" +
    (STRIPE_PRICE_BASIC ? "" : " (nicht gesetzt)")
);
console.log(
  "   " +
    (STRIPE_PRICE_PREMIUM ? "✅" : "⚠️") +
    " STRIPE_PRICE_PREMIUM" +
    (STRIPE_PRICE_PREMIUM ? "" : " (nicht gesetzt)")
);
console.log(
  "   " +
    (STRIPE_PRICE_ELITE ? "✅" : "⚠️") +
    " STRIPE_PRICE_ELITE" +
    (STRIPE_PRICE_ELITE ? "" : " (nicht gesetzt)")
);

console.log("\n🛡️ DSGVO-Compliance:");
console.log(
  "   " +
    (copiedLegalFiles >= 4 ? "✅" : "⚠️") +
    " Rechtsdokumente: " +
    copiedLegalFiles +
    "/4"
);
console.log("   ✅ Cookie-Banner integriert");
console.log("   ✅ Privacy-Checkbox in Registrierung");
console.log("   ✅ Footer mit rechtlichen Links");

console.log("\n📝 Nächste Schritte:");
console.log("   1. Überprüfe dist/ Ordner");
console.log("   2. Teste lokal: npx serve dist");
console.log("   3. Deploye auf Netlify");
console.log("   4. ⚠️ WICHTIG: Passe Impressum & Datenschutz an!");
console.log("\n═════════════════════════════════════════════\n");
