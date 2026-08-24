# WK Multi-Services

Site vitrine e-commerce de **WK Multi-Services** — vente de motos, accessoires et pièces,
location de motos et de voitures, entretien. Marcory Zone 4, Abidjan, Côte d'Ivoire.

Les visiteurs composent leur commande sur le site, puis sont redirigés vers **WhatsApp
Business** avec un récapitulatif prérempli. Le site est conçu pour recevoir du trafic de
campagnes publicitaires Facebook, avec un Pixel Meta déjà câblé.

HTML / CSS / JavaScript statique. Aucun build, aucune dépendance.

## Démarrer en local

```bash
node serve.js
```

Puis http://localhost:4175

## Déploiement

Site 100 % statique : aucune étape de build, n'importe quel hébergeur statique convient.
Domaine : **https://wkmultiservices.org**

### Cloudflare Pages (hébergeur actuel)

Réglages à saisir une seule fois, à la création du projet :

| Champ | Valeur |
|---|---|
| Framework preset | `None` |
| Build command | *(laisser vide)* |
| Build output directory | `maquette` |

Les en-têtes de cache sont dans `maquette/_headers`.

### Netlify (ancien hébergeur)

`netlify.toml` est conservé à la racine : il suffit à reconnecter le projet à Netlify si
besoin. Les déploiements y ont été interrompus en août 2026, le plan gratuit ayant épuisé
ses crédits de build pour le cycle.

## Avant la mise en ligne

Voir **[maquette/LISEZ-MOI.md](maquette/LISEZ-MOI.md)** — trois points à traiter :
renseigner l'ID du Pixel Meta, vérifier le numéro WhatsApp, et remplacer le catalogue
provisoire par les vrais produits et les vraies photos.

---

Conçu par **DO Communication**.
