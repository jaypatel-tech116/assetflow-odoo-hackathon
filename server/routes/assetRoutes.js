const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { listAssets, getAsset, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');

router.use(verifyToken);
router.get('/', listAssets);
router.get('/:id', getAsset);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
