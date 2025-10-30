// ============================================
// CODE-GLIEDERUNG (Übersicht für schnelle Navigation)
// ============================================
// Suche im Code nach: "// >>> GLIEDERUNGSPUNKT X: BEZEICHNUNG"
//
// 1. KONFIGURATION (Supabase & Stripe)
// 2. GLOBALE VARIABLEN & HILFSFUNKTIONEN
// 3. DEMO-INHALTE & PLAN-HIERARCHIE
// 4. INITIALISIERUNG (DOMContentLoaded)
// 5. AUTHENTIFIZIERUNG (Session & Subscription laden)
// 6. EVENT LISTENERS (Navigation, Modals, Forms, Tabs)
// 7. LOGIN & REGISTRATION (handleLogin, handleRegister, logout)
// 8. SUBSCRIPTION & PAYMENT (Klicken, Modal, Stripe/Demo-Zahlung)
// 9. UI-UPDATES (angemeldet/abgemeldet, User-Info)
// 10. CONTENT MANAGEMENT (Laden, Zugriffsprüfung, Item-Erstellung, Tab-Wechsel)
// 11. UTILITY FUNCTIONS (Modal, Alert)

// ============================================
// 1. KONFIGURATION (Supabase & Stripe)
// >>> GLIEDERUNGSPUNKT 1: KONFIGURATION
// ============================================
// WICHTIG: Ersetze diese Werte mit deinen eigenen Supabase-Credentials
const SUPABASE_URL = "DEINE_SUPABASE_URL"; // z.B. 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

// ============================================
// STRIPE KONFIGURATION
// ============================================
// WICHTIG: Ersetze dies mit deinem Stripe Publishable Key
// Zu finden unter: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = "DEIN_STRIPE_PUBLISHABLE_KEY"; // z.B. 'pk_test_...'

// Stripe Preise (Price IDs aus Stripe Dashboard)
// Erstelle diese unter: https://dashboard.stripe.com/products
const STRIPE_PRICES = {
  basic: "price_BASIC_ID", // z.B. 'price_1abc123...'
  premium: "price_PREMIUM_ID",
  elite: "price_ELITE_ID",
};

// Initialisiere Stripe (wird nach DOM geladen)
let stripe = null;

// Debug-Modus aktivieren
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log("[DEBUG]", ...args);
  }
}

// Prüfe Konfiguration
if (
  SUPABASE_URL === "DEINE_SUPABASE_URL" ||
  SUPABASE_ANON_KEY === "DEIN_SUPABASE_ANON_KEY"
) {
  console.error(
    "FEHLER: Bitte konfiguriere deine Supabase-Credentials in app.js!"
  );
  alert(
    "FEHLER: Supabase-Credentials fehlen! Bitte siehe app.js und README.md"
  );
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

debugLog("Supabase initialisiert:", {
  url: SUPABASE_URL,
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + "...",
});

// ============================================
// 2. GLOBALE VARIABLEN & HILFSFUNKTIONEN
// >>> GLIEDERUNGSPUNKT 2: GLOBALE VARIABLEN & HILFSFUNKTIONEN
// ============================================
let currentUser = null;
let userSubscription = null;

// ============================================
// 3. DEMO-INHALTE & PLAN-HIERARCHIE
// >>> GLIEDERUNGSPUNKT 3: DEMO-INHALTE & PLAN-HIERARCHIE
// ============================================
const demoContent = {
  videos: [
    {
      id: 1,
      title: "Ganzkörper-Workout",
      description: "Komplettes 30-Minuten Training",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/videos/basic/WhatsApp%20Video%202025-10-30%20at%2002.38.17.mp4",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "basic",
    },
    {
      id: 2,
      title: "Core-Strengthening",
      description: "Intensives Bauchmuskeltraining",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/videos/basic/WhatsApp%20Video%202025-10-30%20at%2002.38.17.mp4",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "basic",
    },
    {
      id: 3,
      title: "HIIT Advanced",
      description: "Hochintensives Intervalltraining",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/videos/basic/WhatsApp%20Video%202025-10-30%20at%2002.38.17.mp4",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "premium",
    },
    {
      id: 4,
      title: "Yoga & Mobility",
      description: "Flexibilität und Entspannung",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/videos/basic/WhatsApp%20Video%202025-10-30%20at%2002.38.17.mp4",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "premium",
    },
    {
      id: 5,
      title: "Personal Training Session",
      description: "Exklusive 1:1 Trainingseinheit",
      url: "https://example.com/video5.mp4",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "elite",
    },
  ],
  documents: [
    {
      id: 1,
      title: "12-Wochen Trainingsplan",
      description: "Strukturierter Aufbauplan",
      url: "https://example.com/doc1.pdf",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "basic",
    },
    {
      id: 2,
      title: "Ernährungsguide Premium",
      description: "Detaillierter Meal-Plan mit Rezepten",
      url: "https://example.com/doc2.pdf",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "premium",
    },
    {
      id: 3,
      title: "Supplement Guide",
      description: "Alles über Nahrungsergänzung",
      url: "https://example.com/doc3.pdf",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "premium",
    },
    {
      id: 4,
      title: "Persönlicher Trainingsplan",
      description: "Individuell auf dich zugeschnitten",
      url: "https://example.com/doc4.pdf",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "elite",
    },
  ],
  images: [
    {
      id: 1,
      title: "Übungskatalog Basics",
      description: "Alle grundlegenden Übungen",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/premium/IMG_3295.jpeg",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "basic",
    },
    {
      id: 2,
      title: "Anatomy Guide",
      description: "Muskelgruppen verstehen",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/premium/IMG_3295.jpeg",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "premium",
    },
    {
      id: 3,
      title: "Advanced Techniques",
      description: "Fortgeschrittene Trainingsmethoden",
      url: "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/premium/IMG_3295.jpeg",
      thumbnail:
        "https://ftohghotvfgkoeclmwfv.supabase.co/storage/v1/object/public/images/thumbnails/WhatsApp%20Image%202025-10-30%20at%2002.26.32.jpeg",
      requiredPlan: "elite",
    },
  ],
};

// Plan-Hierarchie
const planHierarchy = {
  basic: 1,
  premium: 2,
  elite: 3,
};

// ============================================
// 4. INITIALISIERUNG (DOMContentLoaded)
// >>> GLIEDERUNGSPUNKT 4: INITIALISIERUNG
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  // Debug: Zeige Stripe Key
  debugLog("STRIPE_PUBLISHABLE_KEY:", STRIPE_PUBLISHABLE_KEY);
  debugLog(
    "Ist Platzhalter?",
    STRIPE_PUBLISHABLE_KEY === "DEIN_STRIPE_PUBLISHABLE_KEY"
  );

  // Prüfe ob Stripe.js geladen wurde
  debugLog("Stripe Objekt verfügbar?", typeof Stripe !== "undefined");

  // Initialisiere Stripe
  if (STRIPE_PUBLISHABLE_KEY !== "DEIN_STRIPE_PUBLISHABLE_KEY") {
    debugLog("Stripe Key ist gesetzt, versuche zu initialisieren...");

    if (typeof Stripe === "undefined") {
      console.error(
        "Stripe.js Bibliothek nicht geladen! Prüfe index.html <script> Tag"
      );
      showAlert(
        "Stripe.js konnte nicht geladen werden. Bitte Seite neu laden.",
        "error"
      );
    } else {
      try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        debugLog("Stripe erfolgreich initialisiert:", stripe);
        console.log("Stripe ist bereit für Zahlungen!");
      } catch (error) {
        console.error("Stripe Initialisierungsfehler:", error);
        console.error("Key:", STRIPE_PUBLISHABLE_KEY);
        showAlert(
          "Stripe konnte nicht geladen werden. Zahlungen sind deaktiviert.",
          "error"
        );
      }
    }
  } else {
    console.warn(
      "Stripe Publishable Key nicht konfiguriert - Demo-Modus aktiv"
    );
    console.warn("Aktueller Wert:", STRIPE_PUBLISHABLE_KEY);
  }

  await checkUserSession();
  initializeEventListeners();
});

// ============================================
// 5. AUTHENTIFIZIERUNG (Session & Subscription laden)
// >>> GLIEDERUNGSPUNKT 5: AUTHENTIFIZIERUNG
// ============================================
async function checkUserSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    await loadUserSubscription();
    updateUIForLoggedInUser();
  } else {
    updateUIForLoggedOutUser();
  }
}

async function loadUserSubscription() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("status", "active")
    .single();

  if (data) {
    userSubscription = data;
  }
}

// ============================================
// 6. EVENT LISTENERS (Navigation, Modals, Forms, Tabs)
// >>> GLIEDERUNGSPUNKT 6: EVENT LISTENERS
// ============================================
function initializeEventListeners() {
  // Navigation
  document.getElementById("loginBtn").addEventListener("click", () => {
    showModal("loginModal");
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("ctaBtn").addEventListener("click", () => {
    document.getElementById("pricing").scrollIntoView({ behavior: "smooth" });
  });

  // Modal Controls
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // Auth Forms
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  document
    .getElementById("paymentForm")
    .addEventListener("submit", handlePayment);

  // Switch between Login/Register
  document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    hideModal("loginModal");
    showModal("registerModal");
  });

  document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    hideModal("registerModal");
    showModal("loginModal");
  });

  // Subscribe buttons
  document.querySelectorAll(".subscribe-btn").forEach((btn) => {
    btn.addEventListener("click", handleSubscriptionClick);
  });

  // Content Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
}

// ============================================
// 7. LOGIN & REGISTRATION (handleLogin, handleRegister, logout)
// >>> GLIEDERUNGSPUNKT 7: LOGIN & REGISTRATION
// ============================================
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  debugLog("Login-Versuch:", { email });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  debugLog("Login-Antwort:", { data, error });

  if (error) {
    console.error("Login error:", error);
    showAlert("Anmeldung fehlgeschlagen: " + error.message, "error");
    return;
  }

  debugLog("Login erfolgreich!");
  currentUser = data.user;
  await loadUserSubscription();
  updateUIForLoggedInUser();
  hideModal("loginModal");
  showAlert("Erfolgreich angemeldet!", "success");
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  debugLog("Registrierungsversuch:", {
    name,
    email,
    passwordLength: password.length,
  });

  if (password.length < 6) {
    showAlert("Passwort muss mindestens 6 Zeichen lang sein", "error");
    return;
  }

  try {
    debugLog("Sende Registrierung an Supabase...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    debugLog("Supabase Antwort:", { data, error });

    if (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });

      if (error.message.includes("User already registered")) {
        showAlert(
          "Diese E-Mail ist bereits registriert. Bitte melde dich an.",
          "error"
        );
      } else if (error.message.includes("Database error")) {
        showAlert(
          "Datenbankfehler! Bitte öffne die Browser-Konsole (F12) für Details.",
          "error"
        );
        console.error(
          "LÖSUNG: Gehe zu Supabase → Authentication → Providers → Email"
        );
        console.error('Deaktiviere "Confirm email" und "Secure email change"');
        console.error(
          "Stelle sicher, dass die subscriptions-Tabelle existiert"
        );
      } else if (error.message.includes("Unable to validate email")) {
        showAlert(
          "E-Mail-Format ungültig. Bitte überprüfe die E-Mail-Adresse.",
          "error"
        );
      } else {
        showAlert("Registrierung fehlgeschlagen: " + error.message, "error");
      }
      return;
    }

    debugLog("Registrierung erfolgreich!", data);
    hideModal("registerModal");

    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      showAlert(
        "Registrierung erfolgreich! Bitte bestätige deine E-Mail, um dich anzumelden.",
        "success"
      );
      debugLog("E-Mail-Bestätigung erforderlich");
    } else if (data.session) {
      debugLog("Auto-Login aktiv");
      currentUser = data.user;
      await loadUserSubscription();
      updateUIForLoggedInUser();
      showAlert("Registrierung und Anmeldung erfolgreich!", "success");
    } else {
      showAlert(
        "Registrierung erfolgreich! Du kannst dich jetzt anmelden.",
        "success"
      );
      debugLog("Manuelle Anmeldung erforderlich");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    showAlert(
      "Ein unerwarteter Fehler ist aufgetreten. Siehe Browser-Konsole (F12).",
      "error"
    );
  }
}

async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  userSubscription = null;
  updateUIForLoggedOutUser();
  showAlert("Erfolgreich abgemeldet", "success");
}

// ============================================
// 8. SUBSCRIPTION & PAYMENT
// >>> GLIEDERUNGSPUNKT 8: SUBSCRIPTION & PAYMENT
// ============================================
function handleSubscriptionClick(e) {
  const plan = e.target.getAttribute("data-plan");

  if (!currentUser) {
    showAlert("Bitte melde dich zuerst an", "error");
    showModal("loginModal");
    return;
  }

  if (userSubscription) {
    showAlert("Du hast bereits ein aktives Abo", "error");
    return;
  }

  showPaymentModal(plan);
}

function showPaymentModal(plan) {
  const prices = {
    basic: 29,
    premium: 59,
    elite: 99,
  };

  const planNames = {
    basic: "Basis",
    premium: "Premium",
    elite: "Elite",
  };

  document.getElementById("paymentInfo").innerHTML = `
        <div class="alert alert-success">
            <strong>${planNames[plan]}-Plan</strong><br>
            €${prices[plan]} / Monat
        </div>
    `;

  document.getElementById("paymentForm").setAttribute("data-plan", plan);
  showModal("paymentModal");
}

async function handlePayment(e) {
  e.preventDefault();

  const plan = e.target.getAttribute("data-plan");

  if (!stripe) {
    showAlert(
      "Stripe ist nicht konfiguriert. Demo-Modus wird verwendet.",
      "warning"
    );
    return handleDemoPayment(plan);
  }

  debugLog("Starte Stripe Checkout für Plan:", plan);

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Wird geladen...";

    const { error: stripeError } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: STRIPE_PRICES[plan],
          quantity: 1,
        },
      ],
      mode: "subscription",
      successUrl: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/?cancelled=true`,
      customerEmail: currentUser.email,
      clientReferenceId: currentUser.id,
      metadata: {
        user_id: currentUser.id,
        plan: plan,
      },
    });

    if (stripeError) {
      console.error("Stripe Checkout Error:", stripeError);
      showAlert(
        "Fehler beim Öffnen der Zahlungsseite: " + stripeError.message,
        "error"
      );
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error("Payment error:", error);
    showAlert("Ein Fehler ist aufgetreten. Bitte versuche es erneut.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

async function handleDemoPayment(plan) {
  debugLog("Demo-Zahlung für Plan:", plan);

  showAlert("Zahlung wird verarbeitet... (Demo-Modus)", "success");

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: currentUser.id,
        plan: plan,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Subscription error:", error);
    showAlert("Fehler beim Erstellen des Abos", "error");
    return;
  }

  userSubscription = data;
  hideModal("paymentModal");
  updateUIForLoggedInUser();
  showAlert(
    "Zahlung erfolgreich! Willkommen im Mitgliederbereich! (Demo)",
    "success"
  );
}

// ============================================
// 9. UI-UPDATES (angemeldet/abgemeldet, User-Info)
// >>> GLIEDERUNGSPUNKT 9: UI-UPDATES
// ============================================
function updateUIForLoggedInUser() {
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "block";

  if (userSubscription) {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.style.display = "none";
    }

    document.getElementById("membersArea").style.display = "block";
    displayUserInfo();
    loadContent();
  } else {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.style.display = "block";
    }
    document.getElementById("membersArea").style.display = "none";
  }
}

function updateUIForLoggedOutUser() {
  document.getElementById("loginBtn").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("membersArea").style.display = "none";

  const pricingSection = document.getElementById("pricing");
  if (pricingSection) {
    pricingSection.style.display = "block";
  }
}

function displayUserInfo() {
  const userName = currentUser.user_metadata.full_name || currentUser.email;
  const planNames = {
    basic: "Basis",
    premium: "Premium",
    elite: "Elite",
  };

  document.getElementById("userInfo").innerHTML = `
        <h3>Willkommen, ${userName}! </h3>
        <p><strong>Aktueller Plan:</strong> ${
          planNames[userSubscription.plan]
        }</p>
        <p><strong>Status:</strong> <span style="color: var(--success);">Aktiv</span></p>
        <p><strong>Gültig bis:</strong> ${new Date(
          userSubscription.end_date
        ).toLocaleDateString("de-DE")}</p>
    `;
}

// ============================================
// 10. CONTENT MANAGEMENT (Laden, Zugriffsprüfung, Item-Erstellung, Tab-Wechsel)
// >>> GLIEDERUNGSPUNKT 10: CONTENT MANAGEMENT
// ============================================
function loadContent() {
  loadVideos();
  loadDocuments();
  loadImages();
}

function loadVideos() {
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";

  demoContent.videos.forEach((video) => {
    const hasAccess = checkAccess(video.requiredPlan);
    const item = createContentItem(video, "video", hasAccess);
    videoList.appendChild(item);
  });
}

function loadDocuments() {
  const documentList = document.getElementById("documentList");
  documentList.innerHTML = "";

  demoContent.documents.forEach((doc) => {
    const hasAccess = checkAccess(doc.requiredPlan);
    const item = createContentItem(doc, "document", hasAccess);
    documentList.appendChild(item);
  });
}

function loadImages() {
  const imageList = document.getElementById("imageList");
  imageList.innerHTML = "";

  demoContent.images.forEach((image) => {
    const hasAccess = checkAccess(image.requiredPlan);
    const item = createContentItem(image, "image", hasAccess);
    imageList.appendChild(item);
  });
}

function checkAccess(requiredPlan) {
  if (!userSubscription) return false;
  return planHierarchy[userSubscription.plan] >= planHierarchy[requiredPlan];
}

function createContentItem(content, type, hasAccess) {
  const div = document.createElement("div");
  div.className = "content-item";

  const planBadges = {
    basic: '<span class="access-badge basic">Basis</span>',
    premium: '<span class="access-badge premium">Premium</span>',
    elite: '<span class="access-badge elite">Elite</span>',
  };

  let mediaElement = "";
  if (type === "video" && hasAccess) {
    mediaElement = `<img src="${content.thumbnail}" alt="${content.title}" ${
      !hasAccess ? 'class="locked"' : ""
    }>`;
  } else {
    mediaElement = `<img src="${content.thumbnail}" alt="${content.title}" ${
      !hasAccess ? 'class="locked"' : ""
    }>`;
  }

  let viewerUrl = "";
  if (hasAccess) {
    viewerUrl = `viewer.html?url=${encodeURIComponent(
      content.url
    )}&title=${encodeURIComponent(
      content.title
    )}&description=${encodeURIComponent(
      content.description
    )}&type=${type}&plan=${content.requiredPlan}`;
  }

  div.innerHTML = `
        ${mediaElement}
        <div class="content-info">
            <h4>${content.title} ${!hasAccess ? "" : ""}</h4>
            <p>${content.description}</p>
            ${planBadges[content.requiredPlan]}
            ${
              hasAccess
                ? `<br><a href="${viewerUrl}" class="btn-primary" style="display: inline-block; margin-top: 10px; padding: 0.5rem 1rem; text-decoration: none;">Ansehen</a>`
                : '<p style="color: var(--danger); margin-top: 10px;">Upgrade erforderlich</p>'
            }
        </div>
    `;

  return div;
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(tabName).classList.add("active");
}

// ============================================
// 11. UTILITY FUNCTIONS (Modal, Alert)
// >>> GLIEDERUNGSPUNKT 11: UTILITY FUNCTIONS
// ============================================
function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector(".container");
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}
