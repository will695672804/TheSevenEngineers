import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'the7e.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  console.log('🗄️ Initialisation de la base de données...');

  // Table des utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des formations
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      duration TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 4.5,
      students_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des leçons
  db.run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      duration TEXT NOT NULL,
      video_url TEXT,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    )
  `);

  // Table des inscriptions aux cours
  db.run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      UNIQUE(user_id, course_id)
    )
  `);

  // Table des leçons complétées
  db.run(`
    CREATE TABLE IF NOT EXISTS lesson_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
      UNIQUE(user_id, lesson_id)
    )
  `);

  // Table des produits
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      category TEXT NOT NULL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      stock INTEGER NOT NULL,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table du panier
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Table des commandes
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Table des éléments de commande
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    )
  `);

  // Table des messages
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Insérer des données de test
  insertSampleData();
};

const insertSampleData = () => {
  // Vérifier si des utilisateurs existent déjà
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des utilisateurs:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Insertion des données de test...');
      
      // Créer les utilisateurs par défaut
      const adminPassword = bcrypt.hashSync('admin', 10);
      const userPassword = bcrypt.hashSync('user', 10);

      db.run(`
        INSERT INTO users (name, email, password, role, avatar) VALUES 
        ('Admin THE7E', 'admin@example.com', ?, 'admin', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150'),
        ('Utilisateur Test', 'user@example.com', ?, 'user', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150')
      `, [adminPassword, userPassword]);

      // Insérer les formations
      db.run(`
        INSERT INTO courses (title, description, instructor, price, image, duration, level, category, rating, students_count) VALUES 
        ('Solaire Photovoltaïque', 'Formation pratique sur l''installation et la maintenance des systèmes solaires photovoltaïques', 'Équipe THE7E', 150000, 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?w=400', '1-6 mois', 'Débutant', 'Énergies Alternatives', 4.8, 45),
        ('Domotique Industrielle', 'Conception et réalisation de systèmes domotiques pour l''habitat et l''industrie', 'Équipe THE7E', 200000, 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?w=400', '2-4 mois', 'Intermédiaire', 'Informatique Industrielle', 4.7, 32),
        ('Électronique de Puissance', 'Maîtrise des convertisseurs et systèmes de puissance électronique', 'Équipe THE7E', 180000, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?w=400', '3-5 mois', 'Avancé', 'Électronique', 4.9, 28),
        ('Automatisme Industriel', 'Programmation d''automates et systèmes de contrôle industriel', 'Équipe THE7E', 175000, 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?w=400', '2-4 mois', 'Intermédiaire', 'Automatisme', 4.6, 38),
        ('Réseaux Informatiques', 'Configuration et administration de réseaux d''entreprise', 'Équipe THE7E', 160000, 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?w=400', '2-3 mois', 'Intermédiaire', 'Informatique', 4.7, 42),
        ('Maintenance Industrielle', 'Techniques de maintenance préventive et corrective', 'Équipe THE7E', 140000, 'https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?w=400', '1-3 mois', 'Débutant', 'Maintenance', 4.5, 35),
        ('Instrumentation et Mesure', 'Utilisation d''instruments de mesure et d''analyse', 'Équipe THE7E', 165000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', '2-4 mois', 'Intermédiaire', 'Instrumentation', 4.8, 29),
        ('Énergies Renouvelables', 'Vue d''ensemble des technologies d''énergies renouvelables', 'Équipe THE7E', 155000, 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?w=400', '2-3 mois', 'Débutant', 'Énergies Alternatives', 4.6, 41),
        ('Robotique Industrielle', 'Programmation et maintenance de robots industriels', 'Équipe THE7E', 220000, 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?w=400', '3-6 mois', 'Avancé', 'Robotique', 4.9, 24),
        ('Gestion de Projets Techniques', 'Méthodologies de gestion de projets en ingénierie', 'Équipe THE7E', 130000, 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400', '1-2 mois', 'Débutant', 'Gestion', 4.4, 52)
      `);

      // Insérer les leçons avec des URLs vidéo réelles
      const lessons = [
        // Cours 1: Solaire Photovoltaïque
        [1, 'Principes du photovoltaïque', '3h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 1],
        [1, 'Dimensionnement des systèmes', '3h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 2],
        [1, 'Installation pratique', '6h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 3],
        [1, 'Maintenance et dépannage', '3h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 4],
        
        // Cours 2: Domotique Industrielle
        [2, 'Introduction à la domotique', '3h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 1],
        [2, 'Programmation des automates', '6h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 2],
        [2, 'Intégration des systèmes', '6h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 3],
        
        // Cours 3: Électronique de Puissance
        [3, 'Composants de puissance', '4h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 1],
        [3, 'Convertisseurs DC-DC', '5h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 2],
        [3, 'Onduleurs et redresseurs', '6h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 3],
        [3, 'Applications pratiques', '4h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 4],

        // Cours 4: Automatisme Industriel
        [4, 'Introduction aux automates', '3h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 1],
        [4, 'Programmation ladder', '5h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 2],
        [4, 'Supervision et HMI', '4h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 3],

        // Cours 5: Réseaux Informatiques
        [5, 'Fondamentaux des réseaux', '4h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 1],
        [5, 'Configuration des équipements', '6h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 2],
        [5, 'Sécurité réseau', '5h', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 3]
      ];

      lessons.forEach(lesson => {
        db.run(`
          INSERT INTO lessons (course_id, title, duration, video_url, order_index) 
          VALUES (?, ?, ?, ?, ?)
        `, lesson);
      });

      // Insérer les produits
      db.run(`
        INSERT INTO products (name, description, price, image, category, rating, reviews_count, stock, features) VALUES 
        ('Kit Solaire Photovoltaïque 100W', 'Kit complet pour installation solaire domestique avec panneau, régulateur et batterie', 85000, 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?w=400', 'Énergie Solaire', 4.9, 47, 15, 'Panneau 100W monocristallin,Régulateur MPPT 20A,Batterie 100Ah,Onduleur 300W'),
        ('Multimètre Numérique Professionnel', 'Multimètre haute précision pour mesures électriques et électroniques', 25000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', 'Instruments de Mesure', 4.8, 156, 25, 'Mesure AC/DC,Test de continuité,Mesure de fréquence,Écran LCD rétroéclairé'),
        ('Automate Programmable Siemens S7-1200', 'Automate programmable pour applications industrielles moyennes', 125000, 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?w=400', 'Automatisme', 4.7, 89, 8, 'CPU 1214C,14 entrées/10 sorties,Ethernet intégré,Logiciel TIA Portal'),
        ('Oscilloscope Numérique 100MHz', 'Oscilloscope 4 voies pour analyse de signaux électroniques', 95000, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?w=400', 'Instruments de Mesure', 4.6, 73, 12, '4 voies analogiques,Bande passante 100MHz,Écran couleur 7 pouces,Interface USB/Ethernet'),
        ('Kit de Développement Arduino Mega', 'Kit complet pour projets électroniques et prototypage', 35000, 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?w=400', 'Électronique', 4.8, 234, 30, 'Arduino Mega 2560,Breadboard,Capteurs variés,Composants électroniques'),
        ('Alimentation de Laboratoire 30V/5A', 'Alimentation stabilisée variable pour tests et développement', 45000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400', 'Instruments de Mesure', 4.5, 92, 18, 'Tension 0-30V,Courant 0-5A,Affichage numérique,Protection court-circuit'),
        ('Capteur de Température IoT', 'Capteur connecté pour surveillance à distance', 15000, 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?w=400', 'IoT', 4.7, 167, 45, 'Connexion WiFi,Précision ±0.5°C,Batterie longue durée,Application mobile'),
        ('Moteur Pas-à-Pas NEMA 23', 'Moteur de précision pour applications CNC et robotique', 28000, 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?w=400', 'Robotique', 4.6, 134, 22, 'Couple 1.9Nm,200 pas/tour,Connecteur standard,Driver inclus'),
        ('Panneau Solaire 300W Monocristallin', 'Panneau photovoltaïque haute efficacité', 75000, 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?w=400', 'Énergie Solaire', 4.9, 98, 10, 'Puissance 300W,Efficacité 20%,Garantie 25 ans,Cadre aluminium'),
        ('Régulateur de Charge MPPT 60A', 'Régulateur solaire à suivi du point de puissance maximale', 55000, 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?w=400', 'Énergie Solaire', 4.8, 76, 14, 'Courant 60A,Technologie MPPT,Écran LCD,Communication Bluetooth')
      `);

      console.log('✅ Données de test insérées avec succès!');
    }
  });
};

export { db, initializeDatabase };