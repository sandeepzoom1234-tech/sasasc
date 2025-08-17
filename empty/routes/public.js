const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route   GET /api/videos
 * @desc    Fetches all published videos
 * @access  Public
 */
router.get('/videos', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, video_slug, created_at FROM videos WHERE is_published = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching videos:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/videos/:slug
 * @desc    Fetches a single published video by its slug
 * @access  Public
 */
router.get('/videos/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, video_slug, created_at FROM videos WHERE video_slug = $1 AND is_published = TRUE',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found or not published' });
    }

    res.json(rows[0]);
  } catch (err)
    console.error(`Error fetching video with slug ${slug}:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
