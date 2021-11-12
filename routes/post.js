const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPosts,
  updatePosts,
  deletePosts,
  postsPhotoUpload
} = require('../controllers/post');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), postsPhotoUpload);

router.route('/').get(getPosts)
router.route('/:categoryId').post(protect, authorize('publisher', 'admin'), createPosts);
router.route('/:id').get(getPost).put(protect, authorize('publisher', 'admin'), updatePosts).delete(protect, authorize('publisher', 'admin'),deletePosts);

module.exports = router;
