const express = require('express');
const router = express.Router();

const InitiativeController = require('../controllers/initiativeController');
const TeamController = require('../controllers/teamController');

// Middleware for request logging
router.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Initiative routes
router.post('/initiatives', InitiativeController.create);
router.get('/initiatives', InitiativeController.getAll);
router.get('/initiatives/:id', InitiativeController.getById);
router.post('/initiatives/:id/generate', InitiativeController.generateArtifacts);
router.post('/initiatives/:id/launch', InitiativeController.launch);
router.get('/initiatives/:id/dashboard', InitiativeController.getDashboard);

// Team routes
router.get('/teams', TeamController.getAll);
router.get('/teams/:id', TeamController.getById);
router.post('/teams', TeamController.create);
router.put('/teams/:id', TeamController.update);
router.delete('/teams/:id', TeamController.delete);

// Initiative routes (add DELETE)
router.delete('/initiatives/:id', InitiativeController.delete);
router.put('/initiatives/:id', InitiativeController.update);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('❌ API Error:', error.message);
    
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;