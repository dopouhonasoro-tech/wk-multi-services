# Comment m'envoyer les produits du client

## 1. Les photos
Dépose-les telles quelles dans `photos/` (le dossier à côté de ce fichier).
Peu importe le nom de fichier ou le format (JPG, PNG, HEIC, capture WhatsApp) —
je m'occupe de les recadrer, alléger et convertir.

## 2. Les caractéristiques
Remplis `catalogue.csv` (ouvrable dans Excel) : une ligne par produit.
- **photo** : le nom exact du fichier déposé dans `photos/` pour ce produit
- **categorie** : `moto` ou `accessoire`
- **nom**, **caracteristique** (sous-titre doré, ex. "Électrique", "Protection")
- **description** : une phrase courte
- **prix** : en FCFA, chiffres seuls (ex. 1250000). Laisser vide si "sur devis"
- **badge** : facultatif (ex. "Vedette", "Best-seller"), sinon laisser vide

Si un produit a plusieurs photos, ajoute plusieurs lignes avec le même nom —
je garderai la meilleure ou j'en ferai un mini-diaporama, dis-moi ta préférence.

## 3. Une fois rempli
Dis-le-moi simplement dans le chat ("le catalogue est prêt dans le dossier") —
je lis le CSV et les photos, je génère les fiches produits et je remplace le
catalogue provisoire du site.

Pas besoin de format parfait : si une info manque ou est ambiguë, je te demande.
