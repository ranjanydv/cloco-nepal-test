const express = require('express');
const router = express.Router();
const artistController = require('../../controllers/artist');
const { authMiddleware, authorizeRoles } = require('../../middleware/auth');


router.get('/', authMiddleware, artistController.getArtists);
router.post('/', authMiddleware, artistController.createArtist);
router.get('/:id', authMiddleware, artistController.getSingleArtist);

// router.patch('/:id', authMiddleware, artistController.updateArtist);
// router.delete('/:id', authMiddleware, authorizeRoles(['super_admin']), artistController.deleteArtist);


module.exports = router;
