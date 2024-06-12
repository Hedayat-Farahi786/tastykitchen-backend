// products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');

// GET top 3 products with extras
router.get('/top', async (req, res) => {
    try {
      // Fetch the top products (where topProduct is true)
      const topProducts = await Product.find({ topProduct: true });
  
      // Create an array to store products with extras
      const productsWithExtras = [];
  
      // Fetch extras for each product's category and add them to the result
      for (const product of topProducts) {
        const category = await Category.findById(product.menuId);
        if (category) {
          productsWithExtras.push({
            product,
            extras: category.extras,
          });
        }
      }
  
      res.status(200).json(productsWithExtras);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.put('/:id/toggleTop', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Toggle the topProduct field
      product.topProduct = !product.topProduct;
  
      // Save the updated product
      await product.save();
  
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Create a new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
    try {
      const { menuId } = req.query;
  
      if (menuId) {
        // If the menuId parameter is provided, filter products by category
        const products = await Product.find({ menuId });
        res.status(200).json(products);
      } else {
        // If no menuId parameter is provided, return all products
        const allProducts = await Product.find().populate('menuId');
        res.status(200).json(allProducts);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product by ID
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
