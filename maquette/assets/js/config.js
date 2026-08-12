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

  // ⚠️ Catalogue en direct (facultatif). Tant que ces deux valeurs sont
  // vides, le site affiche le catalogue de démonstration codé dans
  // site.js. Une fois le projet Supabase créé (voir supabase/schema.sql
  // et maquette/LISEZ-MOI-ADMIN.md), coller ici l'URL du projet et sa
  // clé publique ("anon" / "publishable") — jamais la clé secrète.
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
