# ititch-app
npx ts-node seed/seedPacks.ts
npx ts-node seed/createUsers.ts
npx ts-node seed/seedTheme.ts

Postgresql  psql -h localhost -p 5432 -U postgres -d postgres

# Migration :
npx sequelize-cli migration:generate --name add-pdfUrl-to-courses
npx sequelize-cli db:migrate
# js
function somme(a,b) {
     return a + b }

let [a, b] = input().split(" ").map(Number)
result=somme(a,b)
console.log(result);

# python
def somme(a, b):
    return a + b

a, b = map(int, input().split())
result=somme(a,b)
print(result);

# sql
code :
SELECT * FROM users;
Input :
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO users (name) VALUES ('Alice'), ('Bob');
Output :
[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]

# install ts dep
--legacy-peer-deps  

# colors
•  primary: #D4AF37 (or pâle) - Utilisé pour les boutons principaux, liens ou éléments interactifs clés, ajoutant une touche de prestige. 
•  Secondary: #F5F5F5 (blanc cassé) - Employé pour les textes et éléments secondaires comme les sous-titres ou bordures, assurant lisibilité et élégance. 
•  Accent: #2F2F2F (anthracite) - Serveur de fond principal ou de zones d’accentuation, offrant une base sérieuse et moderne. 
•  Background: #2F2F2F (anthracite) - Base principale de l’interface pour une apparence cohérente et professionnelle. 
•  Text: #F5F5F5 (blanc cassé) - Couleur dominante pour le texte, garantissant un contraste élevé avec le fond anthracite.

•  primary: #D4AF37 (or pâle) - Utilisé pour les boutons principaux, liens ou éléments interactifs clés, ajoutant une touche de prestige. 
•  Secondary: #F5F5F5 (blanc cassé) - Employé pour les textes et éléments secondaires comme les sous-titres ou bordures, assurant lisibilité et élégance. 
•  Accent: #322e2c - Serveur de fond principal ou de zones d’accentuation, offrant une base sérieuse et moderne. 
•  Background: #322e2c - Base principale de l’interface pour une apparence cohérente et professionnelle. 
•  Text: #F5F5F5 (blanc cassé) - Couleur dominante pour le texte, garantissant un contraste élevé avec le fond anthracite.
Rouge : #821944
Bleu : #A8E6E6

# Font
Din next lt arabic
Montserrat