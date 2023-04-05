const express = require('express');
const router = express.Router();
const Package = require('../models/package');

router.post('/packages', async (req, res) => {
  try {
    const package = new Package(req.body);
    await package.save();
    res.status(201).send(package);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
