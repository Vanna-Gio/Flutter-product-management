const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imageUrl = `/uploads/images/${req.file.filename}`;
  res.json({ image_url: imageUrl });
});

module.exports = router;
