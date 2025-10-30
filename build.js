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

console.log("🔄 Ersetze Platzhalter mit Environment Variables...");

// SUPABASE_URL - Ersetze die GANZE Zeile inklusive Kommentar
const supabaseUrlLine = `const SUPABASE_URL = "DEINE_SUPABASE_URL"; // z.B. 'https://xxxxx.supabase.co'`;
const newSupabaseUrlLine = `const SUPABASE_URL = "${SUPABASE_URL}";`;
appJs = appJs.replace(supabaseUrlLine, newSupabaseUrlLine);
console.log(
  "   SUPABASE_URL:",
  appJs.includes(SUPABASE_URL) ? "ersetzt ✓" : "FEHLER ✗"
);

// SUPABASE_ANON_KEY - Ersetze die komplette Zeile
const supabaseKeyLine = `const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";`;
const newSupabaseKeyLine = `const SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";`;
appJs = appJs.replace(supabaseKeyLine, newSupabaseKeyLine);
console.log(
  "   SUPABASE_ANON_KEY:",
  appJs.includes(SUPABASE_ANON_KEY) ? "ersetzt ✓" : "FEHLER ✗"
);

// STRIPE_PUBLISHABLE_KEY - Ersetze die GANZE Zeile inklusive Kommentar
const stripeKeyLine = `const STRIPE_PUBLISHABLE_KEY = "DEIN_STRIPE_PUBLISHABLE_KEY"; // z.B. 'pk_test_...'`;
const newStripeKeyLine = `const STRIPE_PUBLISHABLE_KEY = "${
  STRIPE_PUBLISHABLE_KEY || "DEIN_STRIPE_PUBLISHABLE_KEY"
}";`;
appJs = appJs.replace(stripeKeyLine, newStripeKeyLine);
console.log(
  "   STRIPE_PUBLISHABLE_KEY:",
  STRIPE_PUBLISHABLE_KEY ? "ersetzt ✓" : "nicht gesetzt ⚠"
);

// Ersetze Price IDs
if (STRIPE_PRICE_BASIC) {
  appJs = appJs.replace(
    `basic: "price_BASIC_ID", // z.B. 'price_1abc123...'`,
    `basic: "${STRIPE_PRICE_BASIC}",`
  );
  console.log("   STRIPE_PRICE_BASIC: ersetzt ✓");
} else {
  console.log("   STRIPE_PRICE_BASIC: nicht gesetzt ⚠");
}

if (STRIPE_PRICE_PREMIUM) {
  appJs = appJs.replace(
    `premium: "price_PREMIUM_ID",`,
    `premium: "${STRIPE_PRICE_PREMIUM}",`
  );
  console.log("   STRIPE_PRICE_PREMIUM: ersetzt ✓");
} else {
  console.log("   STRIPE_PRICE_PREMIUM: nicht gesetzt ⚠");
}

if (STRIPE_PRICE_ELITE) {
  appJs = appJs.replace(
    `elite: "price_ELITE_ID",`,
    `elite: "${STRIPE_PRICE_ELITE}",`
  );
  console.log("   STRIPE_PRICE_ELITE: ersetzt ✓");
} else {
  console.log("   STRIPE_PRICE_ELITE: nicht gesetzt ⚠");
}

// Verifiziere dass Ersetzungen funktioniert haben
if (
  appJs.includes("DEINE_SUPABASE_URL") ||
  appJs.includes("DEIN_SUPABASE_ANON_KEY")
) {
  console.error("");
  console.error("❌❌❌ KRITISCHER FEHLER ❌❌❌");
  console.error("Platzhalter wurden NICHT ersetzt!");
  console.error("App.js enthält noch:");
  if (appJs.includes("DEINE_SUPABASE_URL"))
    console.error("  - DEINE_SUPABASE_URL");
  if (appJs.includes("DEIN_SUPABASE_ANON_KEY"))
    console.error("  - DEIN_SUPABASE_ANON_KEY");
  console.error("");
  console.error("⚠️ Trotzdem fortfahren...");
  console.error("");
}

// Schreibe app.js in dist
fs.writeFileSync(path.join(distDir, "app.js"), appJs);
console.log("✅ app.js erstellt");

// Prüfe ob success.html existiert
if (fs.existsSync(path.join(__dirname, "success.html"))) {
  // Lese success.html und ersetze Credentials
  let successHtml = fs.readFileSync(
    path.join(__dirname, "success.html"),
    "utf8"
  );

  // Ersetze die kompletten Zeilen
  successHtml = successHtml.replace(
    `const SUPABASE_URL = 'DEINE_SUPABASE_URL';`,
    `const SUPABASE_URL = '${SUPABASE_URL}';`
  );
  successHtml = successHtml.replace(
    `const SUPABASE_ANON_KEY = 'DEIN_SUPABASE_ANON_KEY';`,
    `const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';`
  );

  // Schreibe success.html in dist
  fs.writeFileSync(path.join(distDir, "success.html"), successHtml);
  console.log("✅ success.html erstellt");
} else {
  console.warn("⚠️ success.html nicht gefunden - wird übersprungen");
}

// Kopiere andere Dateien
const filesToCopy = ["index.html", "styles.css", "viewer.html"];

filesToCopy.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    console.log(`✅ ${file} kopiert`);
  } else {
    console.warn(`⚠️ ${file} nicht gefunden`);
  }
});

// Erstelle _redirects für Netlify
fs.writeFileSync(path.join(distDir, "_redirects"), "/*  /index.html  200");
console.log("✅ _redirects erstellt");

console.log("");
console.log("🎉 Build erfolgreich abgeschlossen!");
console.log("📁 Build-Dateien in: dist/");
