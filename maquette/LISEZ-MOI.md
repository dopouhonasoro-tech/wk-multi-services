# WK Multi-Services — maquette

Site vitrine e-commerce avec commande redirigée vers WhatsApp Business.
HTML/CSS/JS statique, aucun build, aucune dépendance à installer.

```
maquette/
├── index.html          ← page unique (structure + styles)
├── assets/
│   ├── js/site.js      ← catalogue, panier, WhatsApp, Pixel
│   ├── img/            ← visuels WebP (2 largeurs : normale et « -sm » pour mobile)
│   └── video/          ← hero-desktop.mp4 (617 Ko) · hero-mobile.mp4 (350 Ko)
```

Pour prévisualiser en local : `node "WK MULTI-SERVICES/serve.js"` puis http://localhost:4175

---

## ⚠️ 3 choses à faire avant la mise en ligne

### 1. Renseigner le Pixel Meta

Dans **`index.html`**, tout en haut, bloc `WK_CONFIG` :

```js
PIXEL_ID: "PIXEL_ID"     ←  remplacer par l'ID du pixel (15 ou 16 chiffres)
```

Tant que la valeur reste `PIXEL_ID`, le pixel **ne se charge pas du tout** — pratique
pendant la recette pour ne pas polluer les statistiques. Un message le rappelle dans la
console du navigateur.

Événements déjà câblés pour les campagnes Facebook :

| Événement | Déclenché quand |
|---|---|
| `PageView` | à l'ouverture de la page |
| `ViewContent` | quand le visiteur atteint la grille des motos |
| `AddToCart` | à chaque ajout au panier (avec valeur en XOF) |
| `InitiateCheckout` | à l'ouverture du panier non vide |
| `Purchase` | au clic sur « Envoyer la commande » |
| `Lead` | à chaque départ vers WhatsApp (panier, location, bouton flottant) |

> `Purchase` est envoyé au **départ vers WhatsApp**, pas à l'encaissement réel : c'est une
> intention de commande. Si vous préférez ne compter que les ventes confirmées, supprimez
> la ligne `pixel("Purchase", …)` dans `site.js` et gardez `Lead` comme conversion.

Après mise en ligne, vérifiez avec l'extension **Meta Pixel Helper**, puis choisissez
`Lead` (ou `Purchase`) comme événement d'optimisation dans le gestionnaire de publicités.

### 2. Vérifier le numéro WhatsApp

```js
WHATSAPP_NUMBER: "2250701125770"
```

Format international, sans `+` ni espaces. C'est le numéro de la page Facebook du client.

### 3. Remplacer les avis clients

**Le catalogue des motos est réel** (6 Yamaha, photos et prix fournis par le client
en août 2026). En revanche, **les avis clients affichés sont encore fictifs** : il faut
les remplacer par de vrais témoignages ou supprimer la section avant toute campagne
publicitaire payée. Le bandeau jaune en haut du site le rappelle — le retirer une fois
le point réglé.

Tout se modifie dans **`assets/js/site.js`**, en haut du fichier :

- `MOTOS_DEMO` — les 6 motos réelles, un objet par machine
- `ACCESSOIRES_DEMO` — vide : aucun accessoire n'est vendu en ligne, la section
  « Accessoires » du site est un simple appel à contact WhatsApp
- `CATEGORIES` — les 5 tuiles du haut
- `TEMOINS` — les avis (**fictifs**, à remplacer ou supprimer)

```js
{ id:"m1", nom:"…", cat:"…", desc:"…", prix:1250000, img:"assets/img/p-moto-1.webp", badge:"Vedette" }
```

`prix` est un nombre en FCFA (mettre `0` affiche « Sur devis »). `badge` est facultatif.

**Les photos produits manquent volontairement.** Le client a déjà un catalogue WhatsApp
avec les photos de ses vrais produits : ce sont celles-là qu'il faut utiliser, pas des
images générées de motos qu'il ne vend pas — surtout pour une campagne publicitaire.
En attendant, chaque fiche affiche proprement « Photo à venir ».

Pour ajouter une photo : la placer dans `assets/img/` sous le nom indiqué dans `img:`,
au format WebP. Commande de conversion :

```bash
ffmpeg -i photo.jpg -vf "scale=800:-1:flags=lanczos" -c:v libwebp -quality 76 -compression_level 6 assets/img/p-moto-1.webp
```

---

## Poids

Mesuré au premier écran, sur mobile : **~92 Ko** hors vidéo (poster vertical 48 Ko +
JS 23 Ko + couronne 21 Ko).

La vidéo du hero n'est téléchargée que si la connexion le permet :

- jamais si le mode économie de données est actif, ni en 2G ;
- sur mobile, uniquement en 4G, et seulement **après** le premier rendu ;
- jamais si le visiteur a demandé moins d'animations dans son système.

Dans tous les autres cas, le poster WebP s'affiche seul — le hero reste identique à
l'image près, simplement figé.

---

## Origine des visuels

| Fichier | Origine |
|---|---|
| `hero-desktop.mp4`, `hero-mobile.mp4` | Générés sur Google Flow (Veo 3.1) à partir de la photo de la moto du client et d'une photo du pont Alassane Ouattara |
| `hero-poster*.webp` | Première image des vidéos |
| `crown.webp` | Couronne détourée du logo fourni par le client |
| `loc-moto`, `loc-voiture`, `c-accessoires`, `c-entretien` | Générés sur Google Flow (Nano Banana 2) |
| `c-motos.webp` | Image extraite de la vidéo du hero |

Le lettrage du logo est refait en typographie (Anton) plutôt qu'en image : le logo
d'origine a un « WK » noir, illisible sur un fond sombre. Seule la couronne dorée est
reprise telle quelle.

---

## Structure de la page

1. Bandeau défilant · 2. En-tête collant avec panier · 3. Hero vidéo
4. Bande de réassurance · 5. Tuiles de catégories · 6. Grille des motos
7. Location moto et voiture (formulaire de dates → WhatsApp) · 8. Accessoires
9. Entretien · 10. Mur d'avis défilant · 11. Pied cinématique

Le panier est conservé dans le navigateur du visiteur (`localStorage`) : il retrouve sa
sélection s'il revient plus tard.
