const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/shorten', urlController.shortenURL);
router.get('/:alias', urlController.redirectURL);
router.get('/analytics/:alias', urlController.getAnalytics);
router.put('/update/:alias', urlController.updateAliasOrTTL);
router.delete('/delete/:alias', urlController.deleteAlias);

module.exports = router;
