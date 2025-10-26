import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin, optionalAuthenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de Multer pour l'upload d'images et vidéos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Autoriser les images et vidéos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seules les images et vidéos sont autorisées.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  }
});

const router = express.Router();

// Obtenir toutes les formations
router.get('/', optionalAuthenticateToken, (req, res) => {
  const { category, level, search } = req.query;
  let query = `
    SELECT c.*, 
           COUNT(l.id) as lesson_count,
           CASE WHEN e.user_id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled,
           COALESCE(e.progress, 0) as progress
    FROM courses c
    LEFT JOIN lessons l ON c.id = l.course_id
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
    WHERE 1=1
  `;
  const params = [req.user?.id || null];

  if (category) {
    query += ' AND c.category = ?';
    params.push(category);
  }

  if (level) {
    query += ' AND c.level = ?';
    params.push(level);
  }

  if (search) {
    query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.instructor LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' GROUP BY c.id ORDER BY c.created_at DESC';

  db.all(query, params, (err, courses) => {
    if (err) {
      console.error('Erreur lors de la récupération des formations:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.json({ courses });
  });
});

// Obtenir une formation par ID
router.get('/:id', optionalAuthenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user?.id || null;

  // Récupérer la formation
  db.get(`
    SELECT c.*, 
           CASE WHEN e.user_id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled,
           COALESCE(e.progress, 0) as progress
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
    WHERE c.id = ?
  `, [userId, courseId], (err, course) => {
    if (err) {
      console.error('Erreur lors de la récupération de la formation:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // Récupérer les leçons
    db.all(`
      SELECT l.*, 
             CASE WHEN lc.user_id IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM lessons l
      LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_index
    `, [userId, courseId], (err, lessons) => {
      if (err) {
        console.error('Erreur lors de la récupération des leçons:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      course.lessons = lessons;
      res.json({ course });
    });
  });
});

// S'inscrire à une formation
router.post('/:id/enroll', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  // Vérifier si l'utilisateur est déjà inscrit
  db.get(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
    [userId, courseId],
    (err, enrollment) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'inscription:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (enrollment) {
        return res.status(409).json({ message: 'Vous êtes déjà inscrit à cette formation' });
      }

      // Inscrire l'utilisateur
      db.run(
        'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
        [userId, courseId],
        function(err) {
          if (err) {
            console.error('Erreur lors de l\'inscription:', err);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
          }

          // Mettre à jour le nombre d'étudiants
          db.run(
            'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
            [courseId]
          );

          res.json({ message: 'Inscription réussie' });
        }
      );
    }
  );
});

// Marquer une leçon comme terminée
router.post('/:courseId/lessons/:lessonId/complete', authenticateToken, (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user.id;

  // Vérifier si l'utilisateur est inscrit au cours
  db.get(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
    [userId, courseId],
    (err, enrollment) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'inscription:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!enrollment) {
        return res.status(403).json({ message: 'Vous devez être inscrit à cette formation' });
      }

      // Marquer la leçon comme terminée
      db.run(
        'INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)',
        [userId, lessonId],
        function(err) {
          if (err) {
            console.error('Erreur lors de la completion de la leçon:', err);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
          }

          // Calculer et mettre à jour le progrès
          updateCourseProgress(userId, courseId);

          res.json({ message: 'Leçon marquée comme terminée' });
        }
      );
    }
  );
});

// Fonction pour mettre à jour le progrès d'un cours
function updateCourseProgress(userId, courseId) {
  db.all(`
    SELECT l.id,
           CASE WHEN lc.user_id IS NOT NULL THEN 1 ELSE 0 END as is_completed
    FROM lessons l
    LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = ?
    WHERE l.course_id = ?
  `, [userId, courseId], (err, lessons) => {
    if (err) return;

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.is_completed).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    db.run(
      'UPDATE enrollments SET progress = ? WHERE user_id = ? AND course_id = ?',
      [progress, userId, courseId]
    );
  });
}

// Routes d'administration (Admin only)

// Création d'une formation (Admin only)
router.post('/', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'lessonVideos', maxCount: 50 }
]), (req, res) => {
  try {
    console.log('📥 Requête de création de formation reçue');
    console.log('📋 Corps de la requête:', req.body);
    console.log('📁 Fichiers reçus:', req.files);

    // Validation des champs requis
    const { title, description, instructor, price: rawPrice, duration, level, category } = req.body;
    
    if (!title || !description || !instructor || !duration || !level || !category) {
      return res.status(400).json({ 
        message: 'Tous les champs sont obligatoires: titre, description, instructeur, durée, niveau, catégorie' 
      });
    }

    // Gestion de l'image
    let image = null;
    if (req.files && req.files.image && req.files.image[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    } else if (req.body.imageUrl) {
      image = req.body.imageUrl;
    }

    if (!image) {
      return res.status(400).json({ message: 'Une image est requise' });
    }

    // Validation du prix
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Prix invalide' });
    }

    const query = `
      INSERT INTO courses (title, description, instructor, price, image, duration, level, category, students_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    const params = [title, description, instructor, price, image, duration, level, category];

    console.log('💾 Insertion du cours en base...');
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('❌ Erreur lors de la création de la formation:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur lors de la création du cours' });
      }

      const courseId = this.lastID;
      console.log(`✅ Cours créé avec ID: ${courseId}`);

      // Traitement des leçons
      let lessonsMeta = [];
      
      // Essayer de parser les leçons depuis le corps de la requête
      if (req.body.lessons && typeof req.body.lessons === 'string') {
        try {
          lessonsMeta = JSON.parse(req.body.lessons);
        } catch (parseErr) {
          console.warn('⚠️ Impossible de parser lessons JSON, utilisation de la structure alternative');
        }
      } else if (Array.isArray(req.body.lessons)) {
        lessonsMeta = req.body.lessons;
      }

      // Si pas de leçons fournies, répondre directement
      if (!Array.isArray(lessonsMeta) || lessonsMeta.length === 0) {
        console.log('ℹ️ Aucune leçon fournie');
        return res.status(201).json({ 
          message: 'Formation créée avec succès', 
          courseId 
        });
      }

      console.log(`📚 ${lessonsMeta.length} leçon(s) à créer`);

      // Récupérer les fichiers vidéo
      const lessonFiles = (req.files && req.files.lessonVideos) || [];
      console.log(`🎥 ${lessonFiles.length} fichier(s) vidéo reçu(s)`);

      // Insérer les leçons une par une
      const insertNextLesson = (index) => {
        if (index >= lessonsMeta.length) {
          console.log('✅ Toutes les leçons créées avec succès');
          return res.status(201).json({ 
            message: 'Formation et leçons créées avec succès', 
            courseId 
          });
        }

        const lesson = lessonsMeta[index];
        if (!lesson.title || !lesson.duration) {
          console.warn(`⚠️ Leçon ${index} ignorée: titre ou durée manquant`);
          return insertNextLesson(index + 1);
        }

        // Trouver le fichier vidéo correspondant
        let videoFile = null;
        if (lessonFiles.length > index) {
          videoFile = lessonFiles[index];
        }

        const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : (lesson.videoUrl || lesson.video_url || null);
        const orderIndex = lesson.order_index || lesson.orderIndex || index + 1;

        console.log(`💾 Insertion leçon ${index + 1}: "${lesson.title}"`);

        db.run(
          'INSERT INTO lessons (course_id, title, duration, video_url, order_index) VALUES (?, ?, ?, ?, ?)',
          [courseId, lesson.title, lesson.duration, videoUrl, orderIndex],
          function(err) {
            if (err) {
              console.error(`❌ Erreur lors de la création de la leçon ${index + 1}:`, err);
              // Continuer avec les leçons suivantes malgré l'erreur
            } else {
              console.log(`✅ Leçon ${index + 1} créée avec ID: ${this.lastID}`);
            }
            insertNextLesson(index + 1);
          }
        );
      };

      insertNextLesson(0);
    });

  } catch (error) {
    console.error('💥 Erreur inattendue lors de la création de la formation:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Mise à jour d'une formation (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'lessonVideos', maxCount: 50 }
]), (req, res) => {
  const courseId = req.params.id;
  
  try {
    console.log(`📥 Requête de mise à jour du cours ${courseId} reçue`);
    console.log('📋 Corps de la requête:', req.body);
    console.log('📁 Fichiers reçus:', req.files);

    // Récupérer le cours existant
    db.get('SELECT * FROM courses WHERE id = ?', [courseId], (getErr, existingCourse) => {
      if (getErr) {
        console.error('❌ Erreur lors de la lecture du cours existant:', getErr);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!existingCourse) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }

      console.log('📖 Cours existant trouvé:', existingCourse.title);

      // Fusionner les données avec les valeurs existantes
      const {
        title = existingCourse.title,
        description = existingCourse.description,
        instructor = existingCourse.instructor,
        price: priceRaw,
        duration = existingCourse.duration,
        level = existingCourse.level,
        category = existingCourse.category,
      } = req.body;

      // Gestion de l'image
      let image = existingCourse.image;
      if (req.files && req.files.image && req.files.image[0]) {
        image = `/uploads/${req.files.image[0].filename}`;
        console.log('🖼️ Nouvelle image uploadée:', image);
      } else if (req.body.image && req.body.image !== 'null' && req.body.image !== 'undefined') {
        image = req.body.image;
        console.log('🖼️ Image mise à jour via URL:', image);
      }

      // Validation du prix
      const price = typeof priceRaw !== 'undefined' && priceRaw !== null && priceRaw !== '' 
        ? parseFloat(priceRaw) 
        : existingCourse.price;

      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Prix invalide' });
      }

      const query = `
        UPDATE courses 
        SET title = ?, description = ?, instructor = ?, price = ?, image = ?,
            duration = ?, level = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const params = [title, description, instructor, price, image, duration, level, category, courseId];

      console.log('💾 Mise à jour du cours en base...');
      
      db.run(query, params, function(err) {
        if (err) {
          console.error('❌ Erreur lors de la mise à jour de la formation:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur lors de la mise à jour' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Formation non trouvée' });
        }

        console.log('✅ Cours mis à jour avec succès');

        // Traitement des leçons si fournies
        let lessonsMeta = [];
        
        if (req.body.lessons && typeof req.body.lessons === 'string') {
          try {
            lessonsMeta = JSON.parse(req.body.lessons);
          } catch (parseErr) {
            console.warn('⚠️ Impossible de parser lessons JSON pour la mise à jour');
          }
        } else if (Array.isArray(req.body.lessons)) {
          lessonsMeta = req.body.lessons;
        }

        if (Array.isArray(lessonsMeta) && lessonsMeta.length > 0) {
          console.log(`📚 Mise à jour de ${lessonsMeta.length} leçon(s)`);
          updateLessons(courseId, lessonsMeta, req.files, res);
        } else {
          res.json({ message: 'Formation mise à jour avec succès' });
        }
      });
    });

  } catch (error) {
    console.error('💥 Erreur inattendue lors de la mise à jour de la formation:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Fonction pour mettre à jour les leçons
function updateLessons(courseId, lessonsMeta, files, res) {
  // Supprimer les leçons existantes
  db.run('DELETE FROM lessons WHERE course_id = ?', [courseId], (deleteErr) => {
    if (deleteErr) {
      console.error('❌ Erreur lors de la suppression des anciennes leçons:', deleteErr);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour des leçons' });
    }

    console.log('🗑️ Anciennes leçons supprimées');

    const lessonFiles = (files && files.lessonVideos) || [];

    // Insérer les nouvelles leçons
    const insertNextLesson = (index) => {
      if (index >= lessonsMeta.length) {
        console.log('✅ Toutes les leçons mises à jour avec succès');
        return res.json({ message: 'Formation et leçons mises à jour avec succès' });
      }

      const lesson = lessonsMeta[index];
      if (!lesson.title || !lesson.duration) {
        console.warn(`⚠️ Leçon ${index} ignorée: titre ou durée manquant`);
        return insertNextLesson(index + 1);
      }

      let videoFile = null;
      if (lessonFiles.length > index) {
        videoFile = lessonFiles[index];
      }

      const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : (lesson.videoUrl || lesson.video_url || null);
      const orderIndex = lesson.order_index || lesson.orderIndex || index + 1;

      db.run(
        'INSERT INTO lessons (course_id, title, duration, video_url, order_index) VALUES (?, ?, ?, ?, ?)',
        [courseId, lesson.title, lesson.duration, videoUrl, orderIndex],
        function(err) {
          if (err) {
            console.error(`❌ Erreur lors de la création de la leçon ${index + 1}:`, err);
          } else {
            console.log(`✅ Leçon ${index + 1} créée: "${lesson.title}"`);
          }
          insertNextLesson(index + 1);
        }
      );
    };

    insertNextLesson(0);
  });
}

// Supprimer une formation (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const courseId = req.params.id;

  // Commencer une transaction
  db.serialize(() => {
    // Supprimer les complétions de leçons
    db.run('DELETE FROM lesson_completions WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)', [courseId]);
    
    // Supprimer les inscriptions
    db.run('DELETE FROM enrollments WHERE course_id = ?', [courseId]);
    
    // Supprimer les leçons
    db.run('DELETE FROM lessons WHERE course_id = ?', [courseId]);
    
    // Supprimer le cours
    db.run('DELETE FROM courses WHERE id = ?', [courseId], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la formation:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }

      res.json({ message: 'Formation supprimée avec succès' });
    });
  });
});

// Middleware de gestion d'erreurs pour Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux' });
    }
    return res.status(400).json({ message: `Erreur Multer: ${error.message}` });
  }
  next(error);
});

export default router;