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

  // Catalogue en direct — projet Supabase « WK MULTISERVICES ».
  // ⚠️ Ici ne doit figurer QUE la clé publique (« publishable » / « anon »).
  // Elle est visible par tous les visiteurs, c'est normal et sans risque :
  // les règles de sécurité de la base (supabase/schema.sql) ne l'autorisent
  // qu'à lire les produits actifs. La clé secrète (sb_secret_…) ne doit
  // JAMAIS être placée dans ce fichier ni dans aucun fichier du site.
  SUPABASE_URL: "https://ldntmvxgdmkexitytjwq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_Ny8vwQBZq-V_cPWz3P3u0A_5sWsw9pt"
};
