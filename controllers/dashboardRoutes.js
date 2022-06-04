const router = require('express').Router();
const { User, Blog, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const dashboardDb = await Blog.findAll(req.params.id, {
      include: [
        {
          attributes: ['id', 'name', 'information', 'date_created'],
        },
      ],
    });

    const userblogs = dashboardDb.map((blog) => blog.get({ plain: true }));

    res.render('dashboard', {
      userblogs,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.get('/singleBlog/:id', async (req, res) => {
//   try {
//     const blogDb = await Blog.findByPk(req.params.id, {
//       attributes: ['id', 'name', 'information'],
//     });

//     const blogData = blogDb.get({ plain: true });

//     res.render('singleBlog', {
//       blogData,
//       logged_in: req.session.logged_in,
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// post a blog to the dashboard
router.post('/', async (req, res) => {
  try {
    const newBlog = await Blog.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newBlog);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update blog after it has been made
router.put('/:id', async (req, res) => {
  const { name, information } = req.body;
  try {
    const updatedBlog = await Blog.update(req.params.id, {
      name,
      information,
    });

    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleteBlog = await Blog.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json(deleteBlog);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
