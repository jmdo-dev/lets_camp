var express = require('express'),
	router = express.Router(),
	Campground = require('../models/campground'),
	middleware = require('../middleware');

// Define escapeRegex function for search feature
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

//INDEX - show all campgrounds
router.get('/', function(req, res) {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({ name: regex }, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render('./campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
			}
		});
	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render('./campgrounds/index', { campgrounds: allCampgrounds });
			}
		});
	}
});

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, function(req, res) {
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = { name: name, price: price, image: image, description: desc, author: author };
	// Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			//redirect back to campgrounds page
			res.redirect('/campgrounds');
		}
	});
});

//NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

// SHOW - shows more info about one campground
router.get('/:id', function(req, res) {
	//find the campground with provided ID
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash('error', 'Campground not found');
			res.redirect('back');
		} else {
			console.log(foundCampground);
			res.render('campgrounds/show', { campground: foundCampground });
		}
	});
});

// EDIT - Campground Route

router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// UPDATE - Campground route

router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

// DESTROY - Campground route

router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;
