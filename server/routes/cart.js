import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtenir le panier de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT ci.*, 
           CASE 
             WHEN ci.item_type = 'course' THEN c.title
             WHEN ci.item_type = 'product' THEN p.name
           END as item_name,
           CASE 
             WHEN ci.item_type = 'course' THEN c.price
             WHEN ci.item_type = 'product' THEN p.price
           END as item_price,
           CASE 
             WHEN ci.item_type = 'course' THEN c.image
             WHEN ci.item_type = 'product' THEN p.image
           END as item_image
    FROM cart_items ci
    LEFT JOIN courses c ON ci.item_type = 'course' AND ci.item_id = c.id
    LEFT JOIN products p ON ci.item_type = 'product' AND ci.item_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.added_at DESC
  `, [userId], (err, items) => {
    if (err) {
      console.error('Erreur lors de la récupération du panier:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    const cartItems = items.map(item => ({
      id: `${item.item_type}_${item.item_id}`,
      name: item.item_name,
      price: item.item_price,
      image: item.item_image,
      quantity: item.quantity,
      type: item.item_type,
      itemId: item.item_id
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ 
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  });
});

// Ajouter un élément au panier
router.post('/add', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId, itemType, quantity = 1 } = req.body;

  if (!itemId || !itemType || !['course', 'product'].includes(itemType)) {
    return res.status(400).json({ message: 'Données invalides' });
  }

  // Vérifier si l'élément existe déjà dans le panier
  db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND item_id = ? AND item_type = ?',
    [userId, itemId, itemType],
    (err, existingItem) => {
      if (err) {
        console.error('Erreur lors de la vérification du panier:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (existingItem) {
        // Mettre à jour la quantité
        db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItem.id],
          function(err) {
            if (err) {
              console.error('Erreur lors de la mise à jour du panier:', err);
              return res.status(500).json({ message: 'Erreur interne du serveur' });
            }
            res.json({ message: 'Quantité mise à jour dans le panier' });
          }
        );
      } else {
        // Ajouter un nouvel élément
        db.run(
          'INSERT INTO cart_items (user_id, item_id, item_type, quantity) VALUES (?, ?, ?, ?)',
          [userId, itemId, itemType, quantity],
          function(err) {
            if (err) {
              console.error('Erreur lors de l\'ajout au panier:', err);
              return res.status(500).json({ message: 'Erreur interne du serveur' });
            }
            res.json({ message: 'Élément ajouté au panier' });
          }
        );
      }
    }
  );
});

// Mettre à jour la quantité d'un élément
router.put('/update', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId, itemType, quantity } = req.body;

  if (quantity <= 0) {
    // Supprimer l'élément si la quantité est 0 ou négative
    db.run(
      'DELETE FROM cart_items WHERE user_id = ? AND item_id = ? AND item_type = ?',
      [userId, itemId, itemType],
      function(err) {
        if (err) {
          console.error('Erreur lors de la suppression du panier:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
        res.json({ message: 'Élément supprimé du panier' });
      }
    );
  } else {
    db.run(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ? AND item_type = ?',
      [quantity, userId, itemId, itemType],
      function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour du panier:', err);
          return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Élément non trouvé dans le panier' });
        }

        res.json({ message: 'Quantité mise à jour' });
      }
    );
  }
});

// Supprimer un élément du panier
router.delete('/remove', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId, itemType } = req.body;

  db.run(
    'DELETE FROM cart_items WHERE user_id = ? AND item_id = ? AND item_type = ?',
    [userId, itemId, itemType],
    function(err) {
      if (err) {
        console.error('Erreur lors de la suppression du panier:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Élément non trouvé dans le panier' });
      }

      res.json({ message: 'Élément supprimé du panier' });
    }
  );
});

// Vider le panier
router.delete('/clear', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run(
    'DELETE FROM cart_items WHERE user_id = ?',
    [userId],
    function(err) {
      if (err) {
        console.error('Erreur lors du vidage du panier:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.json({ message: 'Panier vidé avec succès' });
    }
  );
});

export default router;