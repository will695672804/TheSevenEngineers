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

// Obtenir tous les produits
router.get('/', (req, res) => {
  const { category, search, sortBy } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Tri
  switch (sortBy) {
    case 'price-low':
      query += ' ORDER BY price ASC';
      break;
    case 'price-high':
      query += ' ORDER BY price DESC';
      break;
    case 'rating':
      query += ' ORDER BY rating DESC';
      break;
    default:
      query += ' ORDER BY name ASC';
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    // Parser les features JSON
    const productsWithFeatures = products.map(product => ({
      ...product,
      features: product.features ? product.features.split(',') : []
    }));

    res.json({ products: productsWithFeatures });
  });
});

// Obtenir un produit par ID
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      console.error('Erreur lors de la récupération du produit:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Parser les features
    product.features = product.features ? product.features.split(',') : [];

    res.json({ product });
  });
});

// Routes d'administration
router.post('/', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  const { name, description, price, category, stock, features } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  const featuresString = Array.isArray(features) ? features.join(',') : features;

  const query = `
    INSERT INTO products (name, description, price, image, category, stock, features)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [name, description, price, image, category, stock, featuresString];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création du produit:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    res.status(201).json({
      message: 'Produit créé avec succès',
      productId: this.lastID
    });
  });
});

router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category, stock, features } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  const featuresString = Array.isArray(features) ? features.join(',') : features;

  const query = `
    UPDATE products
    SET name = ?, description = ?, price = ?, image = ?, category = ?,
        stock = ?, features = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const params = [name, description, price, image, category, stock, featuresString, productId];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit mis à jour avec succès' });
  });
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const productId = req.params.id;

  db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  });
});

// Mettre à jour le stock
router.patch('/:id/stock', authenticateToken, requireAdmin, (req, res) => {
  const productId = req.params.id;
  const { stock } = req.body;

  db.run(
    'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [stock, productId],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du stock:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      res.json({ message: 'Stock mis à jour avec succès' });
    }
  );
});

export default router;