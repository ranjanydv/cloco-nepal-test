const express = require('express');
const router = express.Router();
const musicController = require('../../controllers/music');
const { authMiddleware, authorizeRoles } = require('../../middleware/auth');


router.get('/', authMiddleware, musicController.getMusic);
router.post('/', authMiddleware, authorizeRoles(['artist']), musicController.createMusic);
router.get('/byArtist/:id', authMiddleware, musicController.getMusicByArtist);
router.patch('/:id', authMiddleware, authorizeRoles(['artist']), musicController.updateMusic);
router.delete('/:id', authMiddleware, authorizeRoles(['artist']), musicController.deleteMusic);


module.exports = router;

