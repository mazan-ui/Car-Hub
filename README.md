# Car Hub

Full stack car showcase website. Made by Mazan.

Stack: HTML, CSS, JavaScript (frontend) / Node.js + Express (backend) / MongoDB (database)

## Chalane ka tareeqa

1. Folder mein terminal kholein aur chalayein: `npm install`
2. `.env.example` ko copy karke `.env` banayein aur apni values likhein (MONGODB_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS)
3. `npm start` chalayein, phir browser mein http://localhost:3000 kholein
4. Pehli dafa chalane par teeno gariyan (Alto, City, Civic) khud database mein add ho jati hain
5. Admin panel: http://localhost:3000/admin

## WhatsApp aur contact number

Numbers `.env` mein hain (WHATSAPP_NUMBER, CONTACT_PHONE). Frontend unhein `/api/config` se leta hai, isliye number badalna ho to sirf `.env` badlein.

## Vercel par deploy

Vercel project ki Settings > Environment Variables mein `.env` wali saari values dalein (MONGODB_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS, WHATSAPP_NUMBER, CONTACT_PHONE), phir deploy karein. MongoDB Atlas mein Network Access par 0.0.0.0/0 allow karna zaroori hai.

## Folder structure

- server.js: Express server
- models/Car.js: car ka database model
- routes/cars.js: gariyon ki API (admin ke liye token zaroori)
- routes/admin.js: admin login
- middleware/auth.js: token check
- seed/: default cars
- public/: website (index.html, admin.html, css, js, images)
