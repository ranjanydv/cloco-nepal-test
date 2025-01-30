const express = require('express');
const router = express.Router();
const artistController = require('../../controllers/artist');
const { authMiddleware, authorizeRoles } = require('../../middleware/auth');


router.get('/', authMiddleware, artistController.getArtists);
router.get('/manager', authMiddleware, artistController.getArtistsByManager);
router.get('/export', authMiddleware, authorizeRoles(['artist_manager']), artistController.exportArtist)
router.post('/', authMiddleware, authorizeRoles(['artist_manager']), artistController.createArtist);
router.post('/import', authMiddleware, authorizeRoles(['artist_manager']), artistController.importArtists);
router.get('/:id', authMiddleware, artistController.getSingleArtist);
router.get('/byUser/:id', authMiddleware, artistController.getSingleArtistByUser);

router.patch('/:id', authMiddleware, authorizeRoles(['artist_manager']), artistController.updateArtist);
router.delete('/:id', authMiddleware, authorizeRoles(['artist_manager']), artistController.deleteArtist);


module.exports = router;
