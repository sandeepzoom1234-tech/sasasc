const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const crypto = require('crypto');

// Multer setup for handling multipart/form-data.
// We are not saving the file, just parsing the form data.
const upload = multer();

/**
 * @route   GET /api/admin/videos
 * @desc    Fetches all videos (published and unpublished)
 * @access  Admin
 */
router.get('/videos', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, video_slug, is_published, created_at FROM videos ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all videos:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/admin/upload
 * @desc    Uploads a new video's metadata
 * @access  Admin
 */
router.post('/upload', upload.single('videoFile'), async (req, res) => {
  // We expect 'title' and 'description' in the form data.
  // The file itself ('videoFile') is ignored on the server, as per requirements.
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Generate a random slug to simulate external hosting.
  const video_slug = crypto.randomBytes(16).toString('hex');

  try {
    const { rows } = await db.query(
      'INSERT INTO videos (title, description, video_slug) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', video_slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error saving video metadata:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   PUT /api/admin/publish/:id
 * @desc    Publishes a video by its ID
 * @access  Admin
 */
router.put('/publish/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'UPDATE videos SET is_published = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(`Error publishing video with id ${id}:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
