const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  getAssetHistory,
} = require('../controllers/assetController');

// Multer config for asset photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);

router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.get('/:id/history', getAssetHistory);
router.post('/', roleMiddleware('Admin', 'Asset Manager'), upload.single('photo'), createAsset);
router.put('/:id', roleMiddleware('Admin', 'Asset Manager'), upload.single('photo'), updateAsset);

module.exports = router;
