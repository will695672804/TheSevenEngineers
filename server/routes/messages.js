import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtenir les messages de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT m.*, u.name as sender_name
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.user_id = ?
    ORDER BY m.created_at ASC
  `, [userId], (err, messages) => {
    if (err) {
      console.error('Erreur lors de la récupération des messages:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    const formattedMessages = messages.map(msg => {
  let isoTimestamp = null;

  if (msg.created_at && !isNaN(Date.parse(msg.created_at))) {
    isoTimestamp = new Date(msg.created_at).toISOString();
  }

  return {
    id: msg.id,
    text: msg.content,
    sender: msg.sender_type,
    timestamp: isoTimestamp,
    isRead: Boolean(msg.is_read)
  };
});

    res.json({ messages: formattedMessages });
  });
  
});

// Envoyer un message
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;
  const senderType = req.user.role === 'admin' ? 'admin' : 'user';

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Le contenu du message est requis' });
  }

  db.run(
    'INSERT INTO messages (user_id, sender_type, content, is_read) VALUES (?, ?, ?, ?)',
    [userId, senderType, content.trim(), senderType === 'user'],
    function(err) {
      if (err) {
        console.error('Erreur lors de l\'envoi du message:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      // Si c'est un message utilisateur, envoyer une réponse automatique après 2 secondes
      if (senderType === 'user') {
        setTimeout(() => {
          db.run(
            'INSERT INTO messages (user_id, sender_type, content, is_read) VALUES (?, ?, ?, ?)',
            [userId, 'admin', 'Merci pour votre message ! Un administrateur vous répondra bientôt.', false]
          );
        }, 2000);
      }

      res.status(201).json({ 
        message: 'Message envoyé avec succès',
        messageId: this.lastID 
      });
    }
  );
});

// Marquer un message comme lu
router.patch('/:id/read', authenticateToken, (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;

  db.run(
    'UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?',
    [messageId, userId],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du message:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Message non trouvé' });
      }

      res.json({ message: 'Message marqué comme lu' });
    }
  );
});

// Obtenir le nombre de messages non lus
router.get('/unread-count', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND sender_type = ? AND is_read = 0',
    [userId, 'admin'],
    (err, result) => {
      if (err) {
        console.error('Erreur lors du comptage des messages non lus:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.json({ unreadCount: result.count });
    }
  );
});

// Routes d'administration
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT m.*, u.name as user_name, u.email as user_email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
  `, (err, messages) => {
    if (err) {
      console.error('Erreur lors de la récupération de tous les messages:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.json({ messages });
  });
});

// Obtenir les conversations par utilisateur
router.get('/conversations', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT u.id, u.name, u.email,
           COUNT(m.id) as message_count,
           MAX(m.created_at) as last_message_at,
           SUM(CASE WHEN m.sender_type = 'user' AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count
    FROM users u
    LEFT JOIN messages m ON u.id = m.user_id
    WHERE u.role = 'user'
    GROUP BY u.id
    HAVING message_count > 0
    ORDER BY last_message_at DESC
  `, (err, conversations) => {
    if (err) {
      console.error('Erreur lors de la récupération des conversations:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.json({ conversations });
  });
});

// Envoyer un message à un utilisateur spécifique (admin)
router.post('/send-to-user', authenticateToken, requireAdmin, (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content || content.trim().length === 0) {
    return res.status(400).json({ message: 'ID utilisateur et contenu requis' });
  }

  db.run(
    'INSERT INTO messages (user_id, sender_type, content, is_read) VALUES (?, ?, ?, ?)',
    [userId, 'admin', content.trim(), false],
    function(err) {
      if (err) {
        console.error('Erreur lors de l\'envoi du message:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.status(201).json({ 
        message: 'Message envoyé avec succès',
        messageId: this.lastID 
      });
    }
  );
});

export default router;