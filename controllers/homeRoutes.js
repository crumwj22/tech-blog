const router = require('express').Router();
const { User, Blog, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const homepageData = await Blog.findAll({
      include: [
        {
          attributes: ['id', 'name', 'created'],
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const blogs = homepageData.map((blog) => blog.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', {
      blogs,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/blog/:id', async (req, res) => {
  try {
    const blogDataDb = await Blog.findByPk(req.params.id, {
      attributes: ['id', 'name', 'information', 'date_created'],
      include: [
        User,
        {
          model: Comment,
          include: [User],
        },
      ],
    });

    const commentDataDb = await Comment.findAll(req.params.id, {
      attributes: ['id', 'information', 'date_created'],
      include: {
        model: User,
        attributes: ['name'],
      },
    });

    const blogData = await blogDataDb.get({ plain: true });
    const commentData = await commentDataDb.map((comment) =>
      comment.get({ plain: ture })
    );
    blogData.comments = blogData;

    res.render('blog', {
      blogData,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
// router.get('/profile', withAuth, async (req, res) => {
//   try {
//     // Find the logged in user based on the session ID
//     const userData = await User.findByPk(req.session.user_id, {
//       attributes: { exclude: ['password'] },
//       include: [{ model: Blog }],
//     });

//     const user = userData.get({ plain: true });

//     res.render('profile', {
//       ...user,
//       logged_in: true,
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// router.get('/login', (req, res) => {
//   // If the user is already logged in, redirect the request to another route
//   if (req.session.logged_in) {
//     res.redirect('/profile');
//     return;
//   }

//   res.render('login');
// });

module.exports = router;
