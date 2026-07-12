const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenance,
  resolveMaintenance,
  closeMaintenance,
} = require('../controllers/maintenanceController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'maint-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);

router.get('/', getAllMaintenanceRequests);
router.get('/:id', getMaintenanceRequestById);
router.post('/', upload.single('photo'), createMaintenanceRequest);
router.patch('/:id/approve', roleMiddleware('Admin', 'Asset Manager'), approveMaintenanceRequest);
router.patch('/:id/reject', roleMiddleware('Admin', 'Asset Manager'), rejectMaintenanceRequest);
router.patch('/:id/assign-technician', roleMiddleware('Admin', 'Asset Manager'), assignTechnician);
router.patch('/:id/start', roleMiddleware('Admin', 'Asset Manager'), startMaintenance);
router.patch('/:id/resolve', resolveMaintenance);
router.patch('/:id/close', roleMiddleware('Admin', 'Asset Manager'), closeMaintenance);

module.exports = router;
