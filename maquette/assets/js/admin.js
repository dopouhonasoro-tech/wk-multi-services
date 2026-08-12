/* ═══════════════════════════════════════════════════════════════════
   WK MULTI-SERVICES — espace produits (admin.html)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
"use strict";

const CFG = window.WK_CONFIG || {};
const $ = s => document.querySelector(s);

if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) {
  $("#etatConfig").hidden = false;
  return;
}

const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

/* ───────────────────────── Connexion ───────────────────────────── */
const ecranConnexion = $("#ecranConnexion");
const tableauBord    = $("#tableauBord");

function afficherConnexion() { ecranConnexion.hidden = false; tableauBord.style.display = "none"; }
function afficherTableau(session) {
  ecranConnexion.hidden = true;
  tableauBord.style.display = "block";
  $("#emailConnecte").textContent = session.user.email;
  chargerListe();
}

sb.auth.getSession().then(({ data }) => {
  if (data.session) afficherTableau(data.session); else afficherConnexion();
});
sb.auth.onAuthStateChange((_evt, session) => {
  if (session) afficherTableau(session); else afficherConnexion();
});

$("#formConnexion").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("#ceEmail").value.trim();
  const mdp   = $("#ceMdp").value;
  const erreur = $("#erreurConnexion");
  erreur.textContent = "";
  const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
  if (error) erreur.textContent = "Identifiants incorrects, ou compte pas encore créé (voir LISEZ-MOI-ADMIN.md).";
});

$("#btnDeconnexion").addEventListener("click", () => sb.auth.signOut());

/* ──────────────── Redimensionnement d'image avant envoi ────────────
   Les photos prises au téléphone pèsent souvent 2 à 5 Mo : les envoyer
   telles quelles ruinerait la légèreté du site. On les ramène à 1200 px
   de large maximum et on les compresse en JPEG avant l'envoi.
   ──────────────────────────────────────────────────────────────── */
async function redimensionner(fichier, largeurMax = 1200, qualite = 0.82) {
  const bitmap = await createImageBitmap(fichier);
  const ratio = Math.min(1, largeurMax / bitmap.width);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const toile = document.createElement("canvas");
  toile.width = w; toile.height = h;
  toile.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  return new Promise(resolve => toile.toBlob(resolve, "image/jpeg", qualite));
}

let fichierImage = null;
$("#pFichier").addEventListener("change", async () => {
  const f = $("#pFichier").files[0];
  if (!f) { fichierImage = null; return; }
  try {
    fichierImage = await redimensionner(f);
    const apercu = $("#apercuImage");
    apercu.src = URL.createObjectURL(fichierImage);
    apercu.style.display = "block";
  } catch (err) {
    afficherMsg("err", "Cette image n'a pas pu être lue. Essayez un JPEG ou un PNG.");
    fichierImage = null;
  }
});

async function televerserImage(blob, categorie) {
  const chemin = categorie + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
  const { error } = await sb.storage.from("produits").upload(chemin, blob, {
    contentType: "image/jpeg", upsert: false
  });
  if (error) throw error;
  return sb.storage.from("produits").getPublicUrl(chemin).data.publicUrl;
}

/* ───────────────────────── Messages ─────────────────────────────── */
function afficherMsg(type, texte) {
  const ok = $("#msgOk"), err = $("#msgErr");
  ok.style.display = "none"; err.style.display = "none";
  const cible = type === "ok" ? ok : err;
  cible.textContent = texte;
  cible.style.display = "block";
  clearTimeout(afficherMsg._t);
  afficherMsg._t = setTimeout(() => { cible.style.display = "none"; }, 4000);
}

/* ─────────────────────── Formulaire produit ─────────────────────── */
const form = $("#formProduit");
const btnAnnuler = $("#btnAnnuler");

function reinitialiserFormulaire() {
  form.reset();
  $("#pId").value = "";
  $("#pOrdre").value = "0";
  $("#pActif").checked = true;
  $("#apercuImage").style.display = "none";
  $("#apercuImage").src = "";
  fichierImage = null;
  btnAnnuler.hidden = true;
  $("#titreFormulaire").textContent = "Ajouter un produit";
}

btnAnnuler.addEventListener("click", reinitialiserFormulaire);

form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("#btnEnregistrer");
  btn.disabled = true;
  btn.textContent = "Enregistrement…";

  try {
    const id = $("#pId").value || null;
    const categorie = $("#pCategorie").value;

    let image_url;
    if (fichierImage) image_url = await televerserImage(fichierImage, categorie);

    const donnees = {
      categorie,
      nom: $("#pNom").value.trim(),
      caracteristique: $("#pCarac").value.trim() || null,
      description: $("#pDesc").value.trim() || null,
      prix: $("#pPrix").value ? Number($("#pPrix").value) : null,
      badge: $("#pBadge").value.trim() || null,
      ordre: Number($("#pOrdre").value) || 0,
      actif: $("#pActif").checked
    };
    if (image_url) donnees.image_url = image_url;

    if (id) {
      const { error } = await sb.from("produits").update(donnees).eq("id", id);
      if (error) throw error;
      afficherMsg("ok", "Produit mis à jour.");
    } else {
      if (!image_url) throw new Error("Ajoutez une photo pour un nouveau produit.");
      const { error } = await sb.from("produits").insert(donnees);
      if (error) throw error;
      afficherMsg("ok", "Produit ajouté — déjà visible sur le site.");
    }

    reinitialiserFormulaire();
    chargerListe();
  } catch (err) {
    afficherMsg("err", err.message || "Une erreur est survenue.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enregistrer";
  }
});

/* ───────────────────────── Liste + actions ──────────────────────── */
let produitsCache = [];
let filtreActif = "tous";

async function chargerListe() {
  const conteneur = $("#listeProduits");
  const { data, error } = await sb.from("produits").select("*").order("ordre", { ascending: true });
  if (error) { conteneur.innerHTML = `<div class="vide">Erreur de chargement.</div>`; return; }
  produitsCache = data || [];
  dessinerListe();
}

function prixFR(n) {
  return n ? Number(n).toLocaleString("fr-FR") + " F" : "Sur devis";
}

function dessinerListe() {
  const conteneur = $("#listeProduits");
  const lignes = produitsCache.filter(p => filtreActif === "tous" || p.categorie === filtreActif);

  if (!lignes.length) {
    conteneur.innerHTML = `<div class="vide">Aucun produit${filtreActif !== "tous" ? " dans cette catégorie" : ""} pour le moment.</div>`;
    return;
  }

  conteneur.innerHTML = lignes.map(p => `
    <div class="carte-p ${p.actif ? "" : "masque"}" data-id="${p.id}">
      <img src="${p.image_url || ""}" alt="" onerror="this.style.opacity=0">
      <div class="carte-p__in">
        <b>${p.nom}</b>
        <small>${p.categorie === "moto" ? "Moto" : "Accessoire"}${p.actif ? "" : " · masqué"}</small>
      </div>
      <div class="carte-p__prix">${prixFR(p.prix)}</div>
      <div class="carte-p__actions">
        <button class="icone-bouton" data-modifier="${p.id}" title="Modifier" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icone-bouton" data-bascule="${p.id}" title="${p.actif ? "Masquer" : "Afficher"}" type="button">
          ${p.actif
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.9 17.9A10 10 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 4.2-5.2M9.9 4.2A10 10 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.2 3.5M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'}
        </button>
        <button class="icone-bouton" data-supprimer="${p.id}" title="Supprimer" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
      </div>
    </div>`).join("");
}

document.querySelectorAll(".filtre button").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".filtre button").forEach(x => x.classList.remove("actif"));
    b.classList.add("actif");
    filtreActif = b.dataset.filtre;
    dessinerListe();
  });
});

$("#listeProduits").addEventListener("click", async e => {
  const modifier = e.target.closest("[data-modifier]");
  if (modifier) {
    const p = produitsCache.find(x => x.id === modifier.dataset.modifier);
    if (!p) return;
    $("#pId").value = p.id;
    $("#pCategorie").value = p.categorie;
    $("#pNom").value = p.nom || "";
    $("#pCarac").value = p.caracteristique || "";
    $("#pBadge").value = p.badge || "";
    $("#pDesc").value = p.description || "";
    $("#pPrix").value = p.prix || "";
    $("#pOrdre").value = p.ordre || 0;
    $("#pActif").checked = !!p.actif;
    fichierImage = null;
    const apercu = $("#apercuImage");
    if (p.image_url) { apercu.src = p.image_url; apercu.style.display = "block"; }
    else { apercu.style.display = "none"; }
    btnAnnuler.hidden = false;
    $("#titreFormulaire").textContent = "Modifier ce produit";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const bascule = e.target.closest("[data-bascule]");
  if (bascule) {
    const p = produitsCache.find(x => x.id === bascule.dataset.bascule);
    if (!p) return;
    const { error } = await sb.from("produits").update({ actif: !p.actif }).eq("id", p.id);
    if (error) { afficherMsg("err", "Impossible de modifier la visibilité."); return; }
    chargerListe();
    return;
  }

  const supprimer = e.target.closest("[data-supprimer]");
  if (supprimer) {
    const p = produitsCache.find(x => x.id === supprimer.dataset.supprimer);
    if (!p) return;
    if (!confirm(`Supprimer définitivement « ${p.nom} » ?`)) return;
    const { error } = await sb.from("produits").delete().eq("id", p.id);
    if (error) { afficherMsg("err", "Suppression impossible."); return; }
    afficherMsg("ok", "Produit supprimé.");
    chargerListe();
  }
});

})();
