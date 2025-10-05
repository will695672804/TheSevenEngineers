import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtenir tous les utilisateurs (admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, name, email, role, avatar, phone, address, created_at FROM users WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, users) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    // Compter le total
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error('Erreur lors du comptage des utilisateurs:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Obtenir un utilisateur par ID
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  // Vérifier que l'utilisateur peut accéder à ces données
  if (req.user.role !== 'admin' && req.user.id != userId) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }

  db.get(
    'SELECT id, name, email, role, avatar, phone, address, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    }
  );
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, address, role } = req.body;

  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user.id != userId) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }

  // Seuls les admins peuvent modifier le rôle
  let updateQuery = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  let params = [name, email, phone, address, userId];

  if (req.user.role === 'admin' && role) {
    updateQuery = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [name, email, phone, address, role, userId];
  }

  db.run(updateQuery, params, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      }
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  });
});

// Changer le mot de passe
router.patch('/:id/password', authenticateToken, (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user.id != userId) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
  }

  // Pour les non-admins, vérifier l'ancien mot de passe
  if (req.user.role !== 'admin') {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel requis' });
    }

    db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Erreur lors de la récupération du mot de passe:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
        if (err) {
          console.error('Erreur lors de la vérification du mot de passe:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (!isMatch) {
          return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        }

        updatePassword(userId, newPassword, res);
      });
    });
  } else {
    updatePassword(userId, newPassword, res);
  }
});

function updatePassword(userId, newPassword, res) {
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erreur lors du hashage du mot de passe:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId],
      function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour du mot de passe:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        res.json({ message: 'Mot de passe mis à jour avec succès' });
      }
    );
  });
}

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  // Empêcher la suppression de son propre compte
  if (req.user.id == userId) {
    return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// Obtenir les statistiques des utilisateurs
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM users',
    'SELECT COUNT(*) as admins FROM users WHERE role = "admin"',
    'SELECT COUNT(*) as users FROM users WHERE role = "user"',
    'SELECT COUNT(*) as recent FROM users WHERE created_at > datetime("now", "-30 days")'
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }))
  .then(results => {
    res.json({
      total: results[0].total,
      admins: results[1].admins,
      users: results[2].users,
      recentUsers: results[3].recent
    });
  })
  .catch(err => {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  });
});

export default router;