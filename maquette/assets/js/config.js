/* ═══════════════════════════════════════════════════════════════════
   ⚙️  CONFIGURATION — les seules valeurs à modifier avant mise en ligne
   Partagée par index.html (site public) et admin.html (espace produits).
   ═══════════════════════════════════════════════════════════════════ */
window.WK_CONFIG = {
  // Numéro WhatsApp Business, format international sans + ni espaces.
  WHATSAPP_NUMBER: "2250701125770",

  // ⚠️ REMPLACER PAR L'ID DU PIXEL META (15-16 chiffres).
  // Tant que la valeur reste "PIXEL_ID", le pixel ne se charge pas.
  PIXEL_ID: "PIXEL_ID",

  // Catalogue en direct (facultatif). Vide = le site utilise le catalogue
  // codé en dur dans site.js. Pour réactiver l'espace admin plus tard,
  // remettre l'URL du projet Supabase et sa clé publique (voir
  // maquette/LISEZ-MOI-ADMIN.md). Jamais la clé secrète.
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
