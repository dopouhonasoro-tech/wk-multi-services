# Espace produits — mise en route

Le client peut ajouter, modifier, masquer et supprimer ses motos et accessoires
directement depuis son téléphone ou son ordinateur, sur `/admin.html`, sans
toucher au code. Les changements apparaissent sur le site en quelques secondes,
sans redéploiement.

Tant que cette mise en route n'est pas faite, le site continue de fonctionner
normalement avec le catalogue de démonstration — rien ne casse.

---

## 1. Créer le projet Supabase (fait — projet **WK MULTISERVICES**)

Sur [supabase.com](https://supabase.com), dans le projet créé :

1. Menu **Project Settings → API**. Deux valeurs à copier :
   - **Project URL** (ressemble à `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (une longue clé, ou une clé qui commence par `sb_publishable_`)
   - ⚠️ Ne jamais copier la clé **service_role** — celle-ci donne tous les droits
     et ne doit jamais apparaître dans le site.

2. Envoie-moi ces deux valeurs (URL + clé publique), je les mets dans
   `maquette/assets/js/config.js`.

## 2. Créer les tables (une seule fois)

Dans Supabase : **SQL Editor → New query**, coller le contenu de
[`supabase/schema.sql`](../supabase/schema.sql) en entier, puis **Run**.

Ça crée :
- la table `produits` (motos et accessoires)
- les règles de sécurité (le site public ne peut que *lire* les produits actifs ;
  seul un administrateur connecté peut ajouter/modifier/supprimer)
- l'espace de stockage des photos, avec les mêmes règles

## 3. Créer le compte du gérant

Dans Supabase : **Authentication → Users → Add user**.
- E-mail et mot de passe de ton choix (ceux que le client utilisera pour se connecter)
- Coche **Auto Confirm User** (sinon un e-mail de confirmation est requis)

C'est le seul compte à créer : un seul gérant, pas d'inscription publique.

## 4. Connecter le site

Dans `maquette/assets/js/config.js` :

```js
SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJhbG..." // ou "sb_publishable_..."
```

Publier (`git push`, Netlify redéploie automatiquement).

## 5. Utiliser l'espace produits

Ouvrir `https://<le-site>/admin.html`, se connecter avec le compte créé à
l'étape 3. Pour chaque produit : photo, catégorie, nom, prix, description.
La photo est automatiquement redimensionnée avant l'envoi — pas besoin de la
retoucher avant.

Le bouton œil masque un produit sans le supprimer (utile pour une rupture de
stock temporaire). Le lien vers cette page est en bas du site public
(« Espace produits »), à retirer ou déplacer si tu préfères qu'il soit moins visible.

---

## Ce que ça coûte

Le plan gratuit Supabase suffit largement pour ce volume (quelques dizaines de
produits, un seul utilisateur admin) : 500 Mo de base de données, 1 Go de
stockage d'images, 5 Go de bande passante par mois. Le client n'a rien à payer
tant que le catalogue reste dans ces ordres de grandeur.

## Limite connue

Le catalogue en direct remplace la démonstration **catégorie par catégorie** :
si le client n'a encore ajouté aucun accessoire, les accessoires de démonstration
restent affichés le temps qu'il en ajoute au moins un. Dès le premier accessoire
ajouté, toute la catégorie bascule sur les vraies données.
