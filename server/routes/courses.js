import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

// Obtenir toutes les formations
router.get('/', (req, res) => {
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
    query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
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
router.get('/:id', (req, res) => {
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
router.post('/', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  const { title, description, instructor, price, duration, level, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const query = `
    INSERT INTO courses (title, description, instructor, price, image, duration, level, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [title, description, instructor, price, image, duration, level, category];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création de la formation:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.status(201).json({
      message: 'Formation créée avec succès',
      courseId: this.lastID
    });
  });
});


// Mise à jour d'une formation (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  const courseId = req.params.id;
  const { title, description, instructor, price, duration, level, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const query = `
    UPDATE courses
    SET title = ?, description = ?, instructor = ?, price = ?, image = ?,
        duration = ?, level = ?, category = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const params = [title, description, instructor, price, image, duration, level, category, courseId];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de la formation:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    res.json({ message: 'Formation mise à jour avec succès' });
  });
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const courseId = req.params.id;

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

export default router;