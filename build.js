const fs = require("fs");
const path = require("path");

console.log("🔨 Starte Build-Prozess...");

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

// Validierung
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

console.log("✅ Environment Variables geladen");
console.log("   - SUPABASE_URL:", SUPABASE_URL);
console.log(
  "   - SUPABASE_ANON_KEY:",
  SUPABASE_ANON_KEY.substring(0, 20) + "..."
);
console.log(
  "   - STRIPE_PUBLISHABLE_KEY:",
  STRIPE_PUBLISHABLE_KEY
    ? STRIPE_PUBLISHABLE_KEY.substring(0, 20) + "..."
    : "nicht gesetzt"
);

// Lese app.js Template
let appJs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

// Ersetze Platzhalter mit Environment Variables
appJs = appJs.replace(
  /const SUPABASE_URL = ['"]DEINE_SUPABASE_URL['"];/,
  `const SUPABASE_URL = "${SUPABASE_URL}";`
);

appJs = appJs.replace(
  /const SUPABASE_ANON_KEY = ['"]DEIN_SUPABASE_ANON_KEY['"];/,
  `const SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";`
);

appJs = appJs.replace(
  /const STRIPE_PUBLISHABLE_KEY = ['"]DEIN_STRIPE_PUBLISHABLE_KEY['"];/,
  `const STRIPE_PUBLISHABLE_KEY = "${
    STRIPE_PUBLISHABLE_KEY || "DEIN_STRIPE_PUBLISHABLE_KEY"
  }";`
);

// Ersetze Price IDs
if (STRIPE_PRICE_BASIC) {
  appJs = appJs.replace(
    /basic: ['"]price_BASIC_ID['"]/,
    `basic: "${STRIPE_PRICE_BASIC}"`
  );
}

if (STRIPE_PRICE_PREMIUM) {
  appJs = appJs.replace(
    /premium: ['"]price_PREMIUM_ID['"]/,
    `premium: "${STRIPE_PRICE_PREMIUM}"`
  );
}

if (STRIPE_PRICE_ELITE) {
  appJs = appJs.replace(
    /elite: ['"]price_ELITE_ID['"]/,
    `elite: "${STRIPE_PRICE_ELITE}"`
  );
}

// Schreibe app.js in dist
fs.writeFileSync(path.join(distDir, "app.js"), appJs);
console.log("✅ app.js erstellt");

// Lese success.html und ersetze Credentials
let successHtml = fs.readFileSync(path.join(__dirname, "success.html"), "utf8");
successHtml = successHtml.replace(
  "const SUPABASE_URL = 'DEINE_SUPABASE_URL';",
  `const SUPABASE_URL = '${SUPABASE_URL}';`
);
successHtml = successHtml.replace(
  "const SUPABASE_ANON_KEY = 'DEIN_SUPABASE_ANON_KEY';",
  `const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';`
);

// Schreibe success.html in dist
fs.writeFileSync(path.join(distDir, "success.html"), successHtml);
console.log("✅ success.html erstellt");

// Kopiere andere Dateien
const filesToCopy = ["index.html", "styles.css"];

filesToCopy.forEach((file) => {
  fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  console.log(`✅ ${file} kopiert`);
});

// Erstelle _redirects für Netlify
fs.writeFileSync(path.join(distDir, "_redirects"), "/*  /index.html  200");
console.log("✅ _redirects erstellt");

console.log("");
console.log("🎉 Build erfolgreich abgeschlossen!");
console.log("📁 Build-Dateien in: dist/");
