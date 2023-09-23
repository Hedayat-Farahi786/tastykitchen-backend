// testimonials.js (create a new file for testimonials routes)
const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonial');

// Create a new testimonial
router.post('/', async (req, res) => {
  try {
    const { author, content } = req.body;

    const newTestimonial = new Testimonial({
      author,
      content,
    });

    await newTestimonial.save();

    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a testimonial by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { author, content },
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a testimonial by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

    if (!deletedTestimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
