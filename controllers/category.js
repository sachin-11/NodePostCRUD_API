const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Category = require('../models/Category');

//@desc Get All category
//@route GET /api/v1/category
//@access public

exports.getAllCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.find().populate({
        path: 'user',
        select: 'name',
      });
      res.status(200).json({ success: true, data: category });
});

//@desc create category
//@route POST  /api/v1/category
//@access Private

exports.createCategory = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;
  //Check for published posts
  const publishedCategory = await Category.findOne({ user: req.user.id });
  //if user is not an admin , they can add one Category
  if (publishedCategory && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already create category`,
        400
      )
    );
  }
  const category = await Category.create(req.body);
  res.status(200).json({ success: true, data: category });
});

//desc  update Category
//@route GET /api/v1/category/:id
//@access Private

exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update category`,
        401
      )
    );
  }

  category = await Category.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: category });
});


//desc  delete category
//@route GET /api/v1/category/:id
//@access Private

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`category not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this category`,
        401
      )
    );
  }
  category.remove();
  res.status(200).json({ success: true, data: {} });
});