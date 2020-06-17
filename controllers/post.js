const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Post = require('../models/Post');

//@desc Get All posts
//@route GET /api/v1/posts
//@access public

exports.getPosts = asyncHandler(async (req, res, next) => {
  let query;
  //copy req.query
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);


  let queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace( /\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  query = Post.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
   const total = await Post.countDocuments();


  const posts  = await query;

  //Pagination results
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  
  next();
   
  res.status(200).json({ success: true, count: posts.length, pagination, data: posts });
});

//@desc Get single post
//@route GET /api/v1/posts/:id
//@access public

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'user',
    select: 'name role',
  });

  if (!post) {
    return next(new ErrorResponse(`No post with id ${req.params.id}`), 404);
  }

  res.status(200).json({ success: true, count: post.length, data: post });
});

//@desc create post
//@route POST  /api/v1/posts
//@access Private

exports.createPosts = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;
  //Check for published atricle
  const publishedPosts = await Post.findOne({ user: req.user.id });
  //if user is not an admin , they can add one posts
  if (publishedPosts && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already publish posts`,
        400
      )
    );
  }
  const post = await Post.create(req.body);
  res.status(200).json({ success: true, data: post });
});

//desc  update posts
//@route GET /api/v1/posts/:id
//@access Private

exports.updatePosts = asyncHandler(async (req, res, next) => {
  let posts = await Post.findById(req.params.id);
  if (!posts) {
    return next(
      new ErrorResponse(`Posts not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is posts owner
  if (posts.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update bootcamp`,
        401
      )
    );
  }

  posts = await Post.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: posts });
});


//desc  delete posts
//@route GET /api/v1/posts/:id
//@access Private

exports.deletePosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.findById(req.params.id);
  if (!posts) {
    return next(
      new ErrorResponse(`posts not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is post owner
  if (posts.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this posts`,
        401
      )
    );
  }
  posts.remove();
  res.status(200).json({ success: true, data: {} });
});