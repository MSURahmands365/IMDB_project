const express = require ('express');
const authController=require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware'); 
const { changePassword } = require('../controllers/accountController');
const activityLogger = require('../middlewares/logger.middleware');
const { deleteAccount } = require('../controllers/deleteAccount');
const activityModel=require('../controllers/activityController')
const router= express.Router();

// 
router.post('/signup', authController.signup); 
router.post('/signin', authController.signin); 

router.post('/signout', authMiddleware, activityLogger, authController.signout);
router.patch('/passwordchange', authMiddleware, activityLogger, changePassword);
router.get('/', authMiddleware, activityLogger, authController.getProfile);
router.delete('/deleteaccount',authMiddleware, activityLogger,deleteAccount)
router.get('/activities',authMiddleware, activityModel.getActivity)
module.exports= router;

