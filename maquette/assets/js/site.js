/* ═══════════════════════════════════════════════════════════════════
   WK MULTI-SERVICES — logique du site
   ═══════════════════════════════════════════════════════════════════ */
(function () {
"use strict";

const CFG = window.WK_CONFIG || {};
const WA  = CFG.WHATSAPP_NUMBER || "";

/* ───────────────────────── 1. PIXEL META ─────────────────────────
   Le pixel ne se charge QUE si PIXEL_ID a été remplacé par un vrai
   identifiant. Tant que la valeur reste "PIXEL_ID", rien n'est envoyé
   (utile pour ne pas polluer les stats pendant la recette).
   ───────────────────────────────────────────────────────────────── */
const PIXEL_ACTIF = /^\d{15,16}$/.test(String(CFG.PIXEL_ID || ""));

if (PIXEL_ACTIF) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CFG.PIXEL_ID);
  fbq('track', 'PageView');
} else {
  console.info('[WK] Pixel Meta inactif — remplacez PIXEL_ID dans index.html pour l\'activer.');
}

/** Envoie un événement au pixel (silencieux s'il est inactif). */
function pixel(evt, params) {
  if (PIXEL_ACTIF && window.fbq) window.fbq('track', evt, params || {});
}

/* ═════════════════════════════════════════════════════════════════
   2. CATALOGUE
   ─────────────────────────────────────────────────────────────────
   Deux sources possibles :

   1. DÉMONSTRATION (ci-dessous, codée en dur) — s'affiche tant que
      Supabase n'est pas configuré dans config.js, ou le temps que le
      catalogue en direct se charge.

   2. EN DIRECT — dès que SUPABASE_URL et SUPABASE_ANON_KEY sont
      renseignés dans config.js, le site va chercher les produits
      ajoutés par le client depuis /admin.html et remplace le
      catalogue de démonstration dès qu'ils arrivent (silencieusement,
      sans rechargement de page). Voir chargerCatalogueLive() plus bas.

   Pour chaque article :
     id     : identifiant unique, libre
     nom    : nom affiché
     cat    : texte de la petite étiquette dorée
     desc   : une phrase courte
     prix   : nombre en FCFA (0 = "sur devis")
     img    : chemin de la photo
     badge  : étiquette orange facultative
   ═══════════════════════════════════════════════════════════════ */
const MOTOS_DEMO = [
  { id:"m1", nom:"Dirt bike électrique 72V",  cat:"Électrique",   desc:"Tout-terrain silencieuse, autonomie 80 km, charge 4 h.", prix:1250000, img:"", badge:"Vedette" },
  { id:"m2", nom:"Scooter urbain 125 cm³",    cat:"Thermique",    desc:"Souple en ville, coffre sous selle, faible consommation.", prix:675000,  img:"" },
  { id:"m3", nom:"Moto utilitaire 150 cm³",   cat:"Thermique",    desc:"Porte-bagages renforcé, pensée pour la livraison.",       prix:890000,  img:"" },
  { id:"m4", nom:"Moto sport 200 cm³",        cat:"Thermique",    desc:"Position dynamique, freins à disque avant et arrière.",   prix:1450000, img:"" },
  { id:"m5", nom:"Scooter électrique 60V",    cat:"Électrique",   desc:"Zéro carburant, batterie amovible, recharge à la maison.", prix:850000,  img:"", badge:"Économique" },
  { id:"m6", nom:"Tricycle porteur 200 cm³",  cat:"Utilitaire",   desc:"Benne basculante, jusqu'à 500 kg de charge utile.",       prix:1750000, img:"" },
  { id:"m7", nom:"Tout-terrain 250 cm³",      cat:"Thermique",    desc:"Suspensions longue course pour pistes et hors-piste.",    prix:1980000, img:"" },
  { id:"m8", nom:"Mobylette 100 cm³",         cat:"Thermique",    desc:"Le premier deux-roues : simple, robuste, économe.",       prix:480000,  img:"" }
];

const ACCESSOIRES_DEMO = [
  { id:"a1", nom:"Casque intégral",          cat:"Protection", desc:"Coque ABS, visière anti-rayures, homologué.",        prix:45000, img:"", badge:"Best-seller" },
  { id:"a2", nom:"Casque jet",               cat:"Protection", desc:"Léger et aéré, idéal trajets urbains courts.",       prix:28000, img:"" },
  { id:"a3", nom:"Gants renforcés",          cat:"Protection", desc:"Coques aux articulations, paume antidérapante.",     prix:15000, img:"" },
  { id:"a4", nom:"Blouson de protection",    cat:"Protection", desc:"Coudières et dorsale amovibles, doublure aérée.",     prix:65000, img:"" },
  { id:"a5", nom:"Antivol en U",             cat:"Sécurité",   desc:"Acier trempé, deux clés, support de fixation.",      prix:22000, img:"" },
  { id:"a6", nom:"Top-case 45 L",            cat:"Bagagerie",  desc:"Verrouillable, contient deux casques intégraux.",    prix:38000, img:"" },
  { id:"a7", nom:"Kit chaîne complet",       cat:"Pièces",     desc:"Chaîne + couronne + pignon, montage possible.",      prix:32000, img:"" },
  { id:"a8", nom:"Huile moteur 4T · 1 L",    cat:"Entretien",  desc:"Semi-synthèse, adaptée au climat tropical.",         prix:8500,  img:"" }
];

const CATEGORIES = [
  { nom:"Motos",             sous:"Vente neuve",       img:"assets/img/c-motos.webp",      lien:"#motos" },
  { nom:"Accessoires",       sous:"Casques, gants…",   img:"assets/img/c-accessoires.webp",lien:"#accessoires" },
  { nom:"Location moto",     sous:"Dès 15 000 F/jour", img:"assets/img/loc-moto.webp",     lien:"#location" },
  { nom:"Location voiture",  sous:"Dès 35 000 F/jour", img:"assets/img/loc-voiture.webp",  lien:"#location" },
  { nom:"Entretien",         sous:"Atelier Marcory",   img:"assets/img/c-entretien.webp",  lien:"#entretien" }
];

/* ⚠️ AVIS PROVISOIRES — à remplacer par de vrais avis clients. */
const TEMOINS = [
  { t:"J'ai pris ma moto chez WK pour mes livraisons. Six mois après, aucun souci. Le prix était le plus juste de la zone.", n:"Yao Kouassi", r:"Livreur, Treichville" },
  { t:"Réservation de voiture faite sur WhatsApp le matin, véhicule dispo le midi. Propre et ponctuel.", n:"Aminata Diallo", r:"Cheffe d'entreprise" },
  { t:"Mon scooter électrique ne chargeait plus. Ils ont trouvé la panne le jour même et changé le contrôleur.", n:"Ibrahim Touré", r:"Client atelier" },
  { t:"Le casque et les gants achetés tiennent bien la route. Bon rapport qualité-prix pour Abidjan.", n:"Serge N'Guessan", r:"Motard du week-end" },
  { t:"Ils m'ont conseillé un modèle moins cher que ce que je voulais, parce qu'il correspondait mieux à mon usage. Ça, c'est honnête.", n:"Fatou Bamba", r:"Étudiante, Cocody" },
  { t:"Location d'un SUV avec chauffeur pour un mariage. Voiture impeccable, chauffeur discret.", n:"Koffi Adjoumani", r:"Marcory" },
  { t:"L'atelier a repris une réparation ratée ailleurs. Devis clair avant de toucher à la machine.", n:"Moussa Cissé", r:"Client atelier" },
  { t:"Commande passée depuis le site, réponse sur WhatsApp en dix minutes. Livré à Yopougon le lendemain.", n:"Grace Kouamé", r:"Yopougon" },
  { t:"Le tricycle porteur a changé mon activité. Je transporte trois fois plus qu'avant.", n:"Ali Sangaré", r:"Commerçant, Adjamé" }
];

/* ───────────────────── 3. OUTILS D'AFFICHAGE ───────────────────── */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

const prixFR = n => n > 0
  ? n.toLocaleString("fr-FR").replace(/ | /g, " ") + " F"
  : "Sur devis";

/** Image avec repli élégant si le fichier n'existe pas encore.
 *  `sm` : sert une version allégée en dessous de 800 px (fichier « …-sm.webp »). */
function imgHTML(src, alt, sm) {
  // Pas de photo renseignée : on n'émet aucune balise <img>, sinon le
  // navigateur ferait une requête 404 par fiche. Le conteneur porte
  // directement l'état « sans-img » (voir carteProduit).
  if (!src) return "";
  const balise = `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" width="400" height="300"
    onerror="this.style.display='none';(this.closest('.produit__img')||this.closest('.categorie')||this.parentElement).classList.add('sans-img')">`;
  if (!sm) return balise;
  const petite = src.replace(/\.webp$/, "-sm.webp");
  return `<picture><source media="(max-width:800px)" srcset="${petite}">${balise}</picture>`;
}

function carteProduit(p) {
  return `
  <article class="produit" data-id="${p.id}">
    <div class="produit__img${p.img ? "" : " sans-img"}">
      ${p.badge ? `<span class="produit__badge">${p.badge}</span>` : ""}
      ${imgHTML(p.img, p.nom)}
    </div>
    <div class="produit__corps">
      <div class="produit__cat">${p.cat}</div>
      <h3>${p.nom}</h3>
      <p class="produit__desc">${p.desc}</p>
      <div class="produit__bas">
        <div class="produit__prix">${prixFR(p.prix)}<small>Prix indicatif</small></div>
        <button class="btn-ajout" data-ajout="${p.id}" aria-label="Ajouter ${p.nom} au panier">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

/* Rendu des grilles — MOTOS/ACCESSOIRES/TOUS sont réaffectables : le
   catalogue en direct (chargerCatalogueLive, plus bas) les remplace
   après le premier rendu si Supabase est configuré. */
const grilleMotos = $("#grilleMotos");
const grilleAcc   = $("#grilleAccessoires");
let MOTOS = MOTOS_DEMO;
let ACCESSOIRES = ACCESSOIRES_DEMO;
let TOUS = [...MOTOS, ...ACCESSOIRES];

function rendreProduits(majPanier) {
  TOUS = [...MOTOS, ...ACCESSOIRES];
  if (grilleMotos) grilleMotos.innerHTML = MOTOS.map(carteProduit).join("");
  if (grilleAcc)   grilleAcc.innerHTML   = ACCESSOIRES.map(carteProduit).join("");
  // Ce premier appel a lieu avant que `panier` (section 4, plus bas) existe :
  // rendrePanier() n'est déclenché que sur les appels suivants (catalogue en direct).
  if (majPanier !== false) rendrePanier();
}
rendreProduits(false);

const grilleCat = $("#grilleCategories");
if (grilleCat) {
  grilleCat.innerHTML = CATEGORIES.map(c => `
    <a class="categorie" href="${c.lien}">
      ${imgHTML(c.img, c.nom, true)}
      <span class="categorie__txt"><b>${c.nom}</b><span>${c.sous}</span></span>
    </a>`).join("");
}

/* Colonnes de témoignages (3 colonnes, duplication pour boucler) */
const colTem = $("#colonnesTemoins");
if (colTem) {
  const carte = t => `
    <figure class="temoin">
      <blockquote><p>« ${t.t} »</p></blockquote>
      <figcaption class="temoin__pied">
        <span class="temoin__av" aria-hidden="true">${t.n.charAt(0)}</span>
        <span><cite>${t.n}</cite><small>${t.r}</small></span>
      </figcaption>
    </figure>`;
  const groupes = [TEMOINS.slice(0,3), TEMOINS.slice(3,6), TEMOINS.slice(6,9)];
  const durees  = ["15s", "19s", "17s"];
  colTem.innerHTML = groupes.map((g, i) => `
    <div class="tcol" style="--duree:${durees[i]};${i > 0 ? "display:none" : ""}" data-col="${i}">
      ${g.map(carte).join("")}${g.map(carte).join("")}
    </div>`).join("");

  // 2ᵉ colonne dès 860 px, 3ᵉ dès 1080 px
  const ajusteColonnes = () => {
    const w = window.innerWidth;
    $$(".tcol", colTem).forEach((c, i) => {
      c.style.display = (i === 1 && w < 860) || (i === 2 && w < 1080) ? "none" : "flex";
    });
  };
  ajusteColonnes();
  window.addEventListener("resize", ajusteColonnes);
}

/* ───────────────────────── 4. PANIER ───────────────────────────── */
const CLE  = "wk_panier";
let panier = [];

try { panier = JSON.parse(localStorage.getItem(CLE)) || []; } catch (e) { panier = []; }

const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify(panier)); } catch (e) {} };
const trouver = id => TOUS.find(p => p.id === id);
const totalPanier = () => panier.reduce((s, l) => {
  const p = trouver(l.id); return s + (p ? p.prix * l.q : 0);
}, 0);

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("visible");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("visible"), 2200);
}

function rendrePanier() {
  const nb = panier.reduce((s, l) => s + l.q, 0);
  const past = $("#pastille");
  if (past) past.textContent = nb;

  const corps = $("#corpsPanier");
  const bas   = $("#basPanier");
  if (!corps) return;

  if (!panier.length) {
    corps.innerHTML = `<div class="tiroir__vide">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
      Votre panier est vide.<br>Ajoutez un article pour commander.</div>`;
    if (bas) bas.hidden = true;
    return;
  }

  corps.innerHTML = panier.map(l => {
    const p = trouver(l.id);
    if (!p) return "";
    return `<div class="ligne">
      ${p.img ? imgHTML(p.img, p.nom) : `<span class="ligne__vignette" aria-hidden="true">${p.nom.charAt(0)}</span>`}
      <div class="ligne__in">
        <b>${p.nom}</b>
        <small>${prixFR(p.prix)}</small>
        <div class="qte">
          <button data-moins="${p.id}" aria-label="Retirer un">−</button>
          <span>${l.q}</span>
          <button data-plus="${p.id}" aria-label="Ajouter un">+</button>
        </div>
        <button class="retirer" data-suppr="${p.id}">Retirer</button>
      </div>
    </div>`;
  }).join("");

  if (bas) bas.hidden = false;
  const tot = $("#totalPanier");
  if (tot) tot.textContent = prixFR(totalPanier());
}

function ajouter(id) {
  const p = trouver(id);
  if (!p) return;
  const l = panier.find(x => x.id === id);
  if (l) l.q++; else panier.push({ id, q: 1 });
  sauver(); rendrePanier();
  toast(p.nom + " ajouté au panier");
  pixel("AddToCart", {
    content_ids: [id], content_name: p.nom, content_type: "product",
    value: p.prix, currency: "XOF"
  });
}

document.addEventListener("click", e => {
  const a = e.target.closest("[data-ajout]");
  if (a) { ajouter(a.dataset.ajout); return; }

  const plus = e.target.closest("[data-plus]");
  if (plus) { const l = panier.find(x => x.id === plus.dataset.plus); if (l) l.q++; sauver(); rendrePanier(); return; }

  const moins = e.target.closest("[data-moins]");
  if (moins) {
    const l = panier.find(x => x.id === moins.dataset.moins);
    if (l) { l.q--; if (l.q <= 0) panier = panier.filter(x => x.id !== l.id); }
    sauver(); rendrePanier(); return;
  }

  const sup = e.target.closest("[data-suppr]");
  if (sup) { panier = panier.filter(x => x.id !== sup.dataset.suppr); sauver(); rendrePanier(); return; }
});

/* Ouverture / fermeture du tiroir */
const tiroir = $("#tiroir"), voile = $("#voile");
function ouvrirPanier() {
  if (!tiroir) return;
  tiroir.classList.add("ouvert"); voile.classList.add("ouvert");
  document.body.style.overflow = "hidden";
  if (panier.length) pixel("InitiateCheckout", { value: totalPanier(), currency: "XOF", num_items: panier.length });
}
function fermerPanier() {
  if (!tiroir) return;
  tiroir.classList.remove("ouvert"); voile.classList.remove("ouvert");
  document.body.style.overflow = "";
}
$("#ouvrirPanier") && $("#ouvrirPanier").addEventListener("click", ouvrirPanier);
$("#fermerPanier") && $("#fermerPanier").addEventListener("click", fermerPanier);
voile && voile.addEventListener("click", fermerPanier);
document.addEventListener("keydown", e => { if (e.key === "Escape") fermerPanier(); });

/* ──────────────────── 5. REDIRECTION WHATSAPP ─────────────────── */
function lienWA(texte) {
  return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texte);
}

/** Ouvre WhatsApp et signale une conversion au pixel. */
function versWA(texte, valeur) {
  pixel("Lead", { content_name: "Contact WhatsApp", value: valeur || 0, currency: "XOF" });
  window.open(lienWA(texte), "_blank", "noopener");
}

/* Commande depuis le panier */
$("#envoyerWA") && $("#envoyerWA").addEventListener("click", () => {
  if (!panier.length) return;

  const nom     = ($("#cliNom").value || "").trim();
  const tel     = ($("#cliTel").value || "").trim();
  const commune = ($("#cliCommune").value || "").trim();
  const note    = ($("#cliNote").value || "").trim();

  let msg = "Bonjour WK Multi-Services, je souhaite commander :\n\n";
  panier.forEach(l => {
    const p = trouver(l.id);
    if (p) msg += "• " + p.nom + " × " + l.q + " — " + prixFR(p.prix * l.q) + "\n";
  });
  msg += "\nTotal estimé : " + prixFR(totalPanier()) + "\n";
  if (nom)     msg += "\nNom : " + nom;
  if (tel)     msg += "\nTéléphone : " + tel;
  if (commune) msg += "\nCommune : " + commune;
  if (note)    msg += "\nPrécision : " + note;
  msg += "\n\n(Commande envoyée depuis le site)";

  pixel("Purchase", { value: totalPanier(), currency: "XOF", num_items: panier.length });
  versWA(msg, totalPanier());
});

/* Formulaires de location */
$$("[data-loc]").forEach(f => {
  f.addEventListener("submit", e => {
    e.preventDefault();
    const type   = f.dataset.loc === "moto" ? "une moto" : "une voiture";
    const date   = f.querySelector("input[type=date]").value;
    const option = f.querySelector("select").value;
    let msg = "Bonjour WK Multi-Services, je souhaite louer " + type + ".\n";
    if (date) msg += "\nDate de début : " + date;
    msg += "\nFormule : " + option;
    msg += "\n\nEst-ce disponible ?\n(Demande envoyée depuis le site)";
    versWA(msg);
  });
});

/* Liens WhatsApp génériques */
$$("[data-wa]").forEach(a => {
  a.addEventListener("click", e => { e.preventDefault(); versWA(a.dataset.wa); });
});
const waFlot = $("#waFlottant");
if (waFlot) {
  waFlot.addEventListener("click", e => {
    e.preventDefault();
    versWA("Bonjour WK Multi-Services, j'ai une question depuis votre site.");
  });
}

/* ViewContent au premier scroll dans la grille motos */
if (grilleMotos && "IntersectionObserver" in window) {
  const obs = new IntersectionObserver(ents => {
    ents.forEach(en => {
      if (en.isIntersecting) { pixel("ViewContent", { content_type: "product_group", content_name: "Motos" }); obs.disconnect(); }
    });
  }, { threshold: .3 });
  obs.observe(grilleMotos);
}

/* ─────────────── 6. VIDÉO HERO — chargement conditionnel ────────────
   La vidéo n'est téléchargée que si la connexion le permet :
   pas de mode économie de données, pas de 2G, écran assez large.
   Sinon le poster WebP (29 à 54 Ko) suffit.
   ──────────────────────────────────────────────────────────────── */
(function videoHero() {
  const v = document.getElementById("heroVideo");
  if (!v) return;

  const co = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = co ? (co.effectiveType || "") : "";
  if (co && (co.saveData || /2g/.test(type))) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mobile = window.innerWidth < 800;
  // Sur mobile, la vidéo (350 Ko) n'est chargée qu'en très bonne connexion :
  // ailleurs le poster vertical (48 Ko) fait le travail.
  if (mobile && co && type !== "4g") return;

  const src = mobile ? "assets/video/hero-mobile.mp4" : "assets/video/hero-desktop.mp4";

  // Chargement différé après le premier rendu, pour ne pas concurrencer
  // le poster ni les polices.
  const lancer = () => {
    const s = document.createElement("source");
    s.src = src; s.type = "video/mp4";
    v.appendChild(s);
    v.load();
    v.addEventListener("canplay", () => { v.classList.add("pret"); v.play().catch(() => {}); }, { once: true });
    v.addEventListener("error", () => { v.remove(); }, { once: true });
  };
  if (document.readyState === "complete") setTimeout(lancer, 300);
  else window.addEventListener("load", () => setTimeout(lancer, 300), { once: true });
})();

/* ────────────── 7. PIED CINÉMATIQUE — animations ────────────────
   Reprise en JS natif des effets du composant GSAP fourni :
   parallaxe du titre géant, révélation en cascade, boutons magnétiques.
   Désactivé si l'utilisateur préfère moins d'animations.
   ──────────────────────────────────────────────────────────────── */
(function piedAnime() {
  const enveloppe = document.getElementById("piedEnveloppe");
  const geant     = document.getElementById("piedGeant");
  const centre    = document.getElementById("piedCentre");
  if (!enveloppe || !geant) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let tick = false;
  function maj() {
    const r = enveloppe.getBoundingClientRect();
    const h = window.innerHeight;
    // 0 quand le pied entre à l'écran, 1 quand il est entièrement visible
    const p = Math.min(Math.max((h - r.top) / (h + r.height * .3), 0), 1);

    geant.style.transform = "translateX(-50%) translateY(" + (10 - p * 10) + "vh) scale(" + (0.8 + p * 0.2) + ")";
    geant.style.opacity = p;

    if (centre) {
      const q = Math.min(Math.max((h * .9 - r.top) / (h * .55), 0), 1);
      centre.style.transform = "translateY(" + ((1 - q) * 50) + "px)";
      centre.style.opacity = q;
    }
    tick = false;
  }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(maj); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  maj();

  // Boutons magnétiques (pointeur fin uniquement)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".magnetique").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * .32 + "px," + y * .32 + "px) scale(1.05)";
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }
})();

/* ──────────────── 8. CATALOGUE EN DIRECT (SUPABASE) ──────────────
   Interroge la table `produits` en lecture seule (clé publique, RLS
   limitée aux produits actifs — voir supabase/schema.sql). Si Supabase
   n'est pas configuré, ou si la requête échoue, ou si le client n'a
   encore ajouté aucun produit dans une catégorie, le catalogue de
   démonstration de cette catégorie reste affiché : jamais de section
   vide à cause d'un souci réseau.
   ──────────────────────────────────────────────────────────────── */
async function chargerCatalogueLive() {
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return;

  try {
    const r = await fetch(
      CFG.SUPABASE_URL + "/rest/v1/produits?select=*&actif=eq.true&order=ordre.asc",
      { headers: { apikey: CFG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY } }
    );
    if (!r.ok) throw new Error("HTTP " + r.status);
    const lignes = await r.json();
    if (!Array.isArray(lignes)) throw new Error("réponse inattendue");

    const normalise = l => ({
      id: l.id, nom: l.nom, cat: l.caracteristique || "",
      desc: l.description || "", prix: l.prix || 0,
      img: l.image_url || "", badge: l.badge || null
    });
    const motosLive = lignes.filter(l => l.categorie === "moto").map(normalise);
    const accLive   = lignes.filter(l => l.categorie === "accessoire").map(normalise);

    let changement = false;
    if (motosLive.length) { MOTOS = motosLive; changement = true; }
    if (accLive.length)   { ACCESSOIRES = accLive; changement = true; }
    if (changement) rendreProduits();
  } catch (e) {
    console.warn("[WK] Catalogue en direct indisponible, catalogue de démonstration conservé.", e);
  }
}

/* ────────────────────── 9. DIVERS ─────────────────────────────── */
const an = $("#annee"); if (an) an.textContent = new Date().getFullYear();

const haut = $("#retourHaut");
if (haut) haut.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* Menu mobile : révèle la navigation sous l'entête */
const burger = $("#burger");
if (burger) {
  burger.addEventListener("click", () => {
    const nav = $(".nav");
    if (!nav) return;
    const ouvert = nav.style.display === "flex";
    Object.assign(nav.style, ouvert ? { display: "" } : {
      display: "flex", position: "absolute", top: "100%", left: 0, right: 0,
      flexDirection: "column", gap: "0", background: "var(--noir-2)",
      borderBottom: "1px solid var(--bord)", padding: "8px 20px 16px"
    });
  });
  $$(".nav a").forEach(a => a.addEventListener("click", () => { $(".nav").style.display = ""; }));
}

rendrePanier();
chargerCatalogueLive();
})();
