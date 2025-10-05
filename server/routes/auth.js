import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Connexion
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        console.error('Erreur lors de la connexion:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Erreur lors de la vérification du mot de passe:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (!isMatch) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      });
    }
  );
});

// Inscription
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  // Vérifier si l'utilisateur existe déjà
  db.get(
    'SELECT id FROM users WHERE email = ?',
    [email],
    (err, existingUser) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (existingUser) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
      }

      // Hasher le mot de passe
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Erreur lors du hashage du mot de passe:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        // Créer l'utilisateur
        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Erreur lors de la création de l\'utilisateur:', err);
              return res.status(500).json({ message: 'Erreur interne du serveur' });
            }

            const token = jwt.sign(
              { 
                id: this.lastID, 
                email: email, 
                role: 'user' 
              },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              token,
              user: {
                id: this.lastID,
                name: name,
                email: email,
                role: 'user',
                avatar: null
              }
            });
          }
        );
      });
    }
  );
});

// Obtenir le profil utilisateur
router.get('/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, name, email, role, avatar, phone, address FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Erreur lors de la récupération du profil:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    }
  );
});

// Mettre à jour le profil
router.put('/profile', authenticateToken, (req, res) => {
  const { name, phone, address } = req.body;

  db.run(
    'UPDATE users SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, phone, address, req.user.id],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.json({ message: 'Profil mis à jour avec succès' });
    }
  );
});

export default router;