var App = (function(lng, undefined) {

	sectionTrigger = function(event) {
		event.stopPropagation();
		setTimeout(function() {
			lng.Notification.success("Event: " + event.type, "Layout events manager", "info", 2);
		}, 500);
	};

	articleTrigger = function(event) {
		event.stopPropagation();
		console.error(event);
	};

	environment = function(event) {
		var environment = lng.Core.environment();
		var el = lng.dom("section > article#environment");

		if (environment.os) {
			el.find("#os > strong").html(environment.os.name);
			el.find("#os > small").html(environment.os.version);
		}
		el.find("#resolution > strong").html(environment.screen.height + "p x " + environment.screen.width + "p");
		el.find("#navigator > strong").html(environment.browser);
		el.find("#navigator > small").html("Mobile: " + environment.isMobile);
	};

	return {
		sectionTrigger: sectionTrigger,
		articleTrigger: articleTrigger,
		environment: environment
	};

})(Lungo);

App.carousel = {prev: null, next: null};

// Algorithm for generating unique IDs. Pass in a prefix like 'moment'.
App.generateUid = function (prefix, separator) {
	var timestamp = new Date().getTime();
	var prefix = prefix || "general";
	var delim = separator || "-";
	// Return a random four character string.
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	// Return the final product.
	return (prefix + delim + timestamp + delim + S4() + S4() + S4());
};

// Moment adding, editing and displaying.
App.Moment = {
	title: '',
	description: '',
	date: '',
	time: '',
	location: '',
	reminder_frequency: '',
	reminder_end: '',
	images: [],
	collaborators: [],

	gather: function() {
		this.title = rediscovr.currentmoment.moment_title = Lungo.dom("#moment-form-title").val();
		this.description = rediscovr.currentmoment.moment_desc = Lungo.dom("#moment-form-desc").val();
		this.location = rediscovr.currentmoment.moment_location = Lungo.dom("#moment-form-location").val();
		this.date = rediscovr.currentmoment.date_happened = Lungo.dom("#moment-form-date").val();
		this.time = rediscovr.currentmoment.time_happened = Lungo.dom("#moment-form-time").val();
		this.reminder_frequency = rediscovr.currentmoment.reminder_frequency = Lungo.dom("#moment-form-reminder-frequency").text();
		this.reminder_end = rediscovr.currentmoment.reminder_end = Lungo.dom("#moment-form-reminder-end").text();
		this.images = rediscovr.currentmoment.images;
	},

	post: function() {
		this.gather();
		var post_data = {
			user: App.user_key,
			title: this.title,
			description: this.description,
			date: this.date,
			time: this.time,
			location: this.location,
			reminder_frequency: this.reminder_frequency,
			reminder_end: this.reminder_end,
			images: this.images,
			owner: 'self',
			collaborators: this.collaborators
		};
		App.database.addMoment(post_data);
		
		// // Make AJAX call.
		// $$.ajax({
		// 	type: 'POST',
		// 	url: 'https://api.etched.com/moment/add',
		// 	data: post_data,
		// 	dataType: 'json', //'json', 'xml', 'html', or 'text'
		// 	async: true,
		// 	success: function(response) {
		// 		if (typeof response === "undefined") {
		// 			console.log("Response empty.");
		// 			return false;
		// 		}
		// 		if (
		// 			response.meta === undefined || 
		// 			response.meta.code === undefined || 
		// 			response.response === undefined || 
		// 			response.response.venues === undefined
		// 		) {
		// 			console.log("Response malformed.");
		// 			return false;
		// 		}
		// 		if (response.meta.code == '200' && response.response.venues.length) {

	}
}

App.utilities = {
	
}

App.database = {
	// DB Stuff
	shortname: 'moments', 
	version: '1.0', 
	displayname: 'moments', 
	maxsize: 65536,
	db: {},

	open: function() {
		this.db = openDatabase(this.shortname, this.version, this.displayname, this.maxsize);
		this.createTables();
	},

	createTables: function() {
		console.log("Trying to create table.");
		console.log(typeof this.db);
		// Moment table
		var moment_definition = "\
			CREATE TABLE IF NOT EXISTS `moment`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`title` TEXT NOT NULL, \
				`desc` TEXT NULL, \
				`date_happened` DATE, \
				`time_happened` TIME, \
				`location` TEXT NOT NULL, \
				`reminder` TEXT NOT NULL DEFAULT 'Never', \
				`reminder_end` TEXT NOT NULL DEFAULT 'Never', \
				`owner` TEXT NOT NULL DEFAULT 'self' \
			);";
		// Image table
		var image_definition = "\
			CREATE TABLE IF NOT EXISTS `image`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`name` TEXT NOT NULL, \
				`type` TEXT NOT NULL DEFAULT 'Moment', \
				`owner` TEXT NOT NULL DEFAULT 'self' \
			);";
		// Moment/Image map table.
		var moment_image_definition = "\
			CREATE TABLE IF NOT EXISTS `moment_image`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`moment_id` INTEGER NOT NULL, \
				`image_id` INTEGER NOT NULL, \
				`primary` INTEGER NOT NULL DEFAULT 1 \
			);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(moment_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
			}
		);
	},

	addMoment: function(d) {
		var data_array = [d.title, d.description, d.date, d.time, d.location, d.reminder_frequency, d.reminder_end, d.owner];
		var query = "INSERT INTO `moment` (`title`, `desc`, `date_happened`, `time_happened`, `location`, `reminder`, `reminder_end`, `owner`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleInsertedMoment, App.database.errorHandler);
				transaction.executeSql('SELECT last_insert_rowid() AS `moment_id`;', [], App.database.getInsertedMomentId, App.database.errorHandler);
			}
		);
		if (rediscovr.currentmoment.images.length) {
			for (var i = 0; i < rediscovr.currentmoment.images.length; i++) {
				var data_array = {
					name: rediscovr.currentmoment.images[i],
					type: 'moment',
					owner: 'self'
				}
				App.database.addImage(data_array);
			}
		}
		Lungo.Notification.show(
			"check",                //Icon
			"Success",              //Title
			3,                      //Seconds
			App.database.nullDataHandler       //Callback function
		);
	},
	
	addImage: function(d) {
		var data_array = [d.name, d.type, d.owner];
		var query = "INSERT INTO `image` (`name`, `type`, `owner`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql('SELECT last_insert_rowid() AS `image_id`;', [], App.database.getInsertedImageId, App.database.errorHandler);
			}
		);
	},

	associateImage: function(d) {
		var data_array = [d.moment_id, d.image_id, d.primary];
		var query = "INSERT INTO `moment_image` (`moment_id`, `image_id`, `primary`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.nullDataHandler, App.database.errorHandler);
			}
		);
	},

	getMoments: function(mine, limit) {
		this.db.transaction(
			function(transaction) {
				transaction.executeSql('SELECT * FROM `moment`;', [], App.database.logMoment(transaction, results), App.database.errorHandler);
			}
		);
	},

	logMoment: function(transaction, results) {
		for (var i=0; i < results.rows.length; i++) {
			var string = '';
			var row = results.rows.item(i);
			string += row.title + ', ';
			string += row.desc + ', ';
			string += row.date_happened + ', ';
			string += row.location + ', ';
			string += row.reminder + ', ';
			string += row.reminder_end + ', ';
			console.log(string);
		}
	},

	errorHandler: function(transaction, error) {
		// error.message is a human-readable string.
		// error.code is a numeric error code
		console.log('Oops.  Error was '+error.message+' (Code '+error.code+')');

		// Handle errors here
		var we_think_this_error_is_fatal = true;
		if (we_think_this_error_is_fatal) return true;
		return false;
	},

	nullDataHandler: function(transaction, results) {
		// Do nothing.
		console.log(results);
		Lungo.Notification.hide();
	},

	handleInsertedMoment: function(transaction, results) {
		console.log(results.insertId);
		rediscovr.currentmoment.moment_id = results.insertId;
	},

	handleInsertedImage: function(transaction, results) {
		var image_id = results.insertId;
		console.log(rediscovr.currentmoment.moment_id + ', ' + image_id);
		
		var data_array = {
			moment_id: rediscovr.currentmoment.moment_id,
			image_id: image_id,
			primary: 1
		};
		this.associateImage(data_array);
	},

	// When passed as the error handler, this silently causes a transaction to fail.
	killTransaction: function(transaction, error) {
		return true;
	}
}



Lungo.ready(function() {

	// Initialize DB.
	App.database.open();

	// Set up the rediscovr object and current moment within it.
	if (typeof rediscovr == "undefined") {
		rediscovr = {};
	}
	if (rediscovr.currentmoment == undefined) {
		rediscovr.currentmoment = {};
	}
	rediscovr.currentmoment.moment_title       = "Rockin' Out!";
	rediscovr.currentmoment.moment_desc        = "Rockin' Out! Woo hoo hoo!";
	rediscovr.currentmoment.moment_location    = "Philadelphia, PA";
	rediscovr.currentmoment.date_happened      = "2013-12-10";
	rediscovr.currentmoment.time_happened      = "12:15";
	rediscovr.currentmoment.reminder_frequency = "Monthly";
	rediscovr.currentmoment.reminder_end       = "Never";


	/*

	*/

	// Lungo.Aside.show();
	// Lungo.Router.section("notification");

	// Lungo.Notification.show();
	// Lungo.Notification.show("home", "Please wait...");
	// Lungo.Notification.show("magic");

	// Lungo.Notification.show("Please wait", "user", 2, function(){ alert(1); });

	// Lungo.Notification.error('Lorem ipsum dolor sit amet', "    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis veritatis similique sed qui doloribus inventore doloremque temporibus ab totam...", 'remove');
	// Lungo.Notification.success('Lorem ipsum dolor sit amet', "    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis veritatis similique sed qui doloribus inventore doloremque temporibus ab totam...", 'ok');
	// Lungo.Notification.confirm({
	//     icon: 'user',
	//     title: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
	//     description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo amet nulla dolorum hic eum debitis dolorem expedita? Commodi molestiae tempora totam explicabo sed deserunt cum iusto eos perspiciatis ea in.',
	//     accept: {
	//         icon: 'checkmark',
	//         label: 'Accept',
	//         callback: function(){ alert("Yes!"); }
	//     },
	//     cancel: {
	//         icon: 'close',
	//         label: 'Cancel',
	//         callback: function(){ alert("No!"); }
	//     }
	// });
	// Lungo.Notification.html("<h1 class='title'>Title</h1><article>aslkdkals</article><a href='#' class='button large anchor' >Seleccionar</a>", "Cancelar");
	// Lungo.Notification.push("Lorem ipsum dolor sit amet", "home");

});

Lungo.Events.init({
	'load section#layoutevents'     : App.sectionTrigger,

	'unload section#layoutevents'   : App.sectionTrigger,

	'load article#environment'      : App.environment,

	'load article#touchevents'      : function(event) {

		["singleTap", "doubleTap", "hold",
			"swipe", "-swiping", "swipeLeft", "swipeRight", "swipeUp", "swipeDown",
			"rotate", "rotateLeft", "rotateRight",
			"pinch", "pinchIn", "pinchOut",
			"drag", "dragLeft", "dragRight", "dragUp", "dragDown"].forEach(function(type) {
			$$("article#touchevents #gestures").on(type, function(event) {
				$$(this).siblings('.console.output').append(' | ' + type);
			});
		});

		$$("[data-action=clean_console]").tap(function(event) {
			$$('.console.output').html("");
		});

		$$("[data-action=twitter]").tap(function(event) {
			window.open("https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Flungo.tapquo.com%2F&text=@lungojs a framework for developers who want to design, build and share cross device apps", "_blank");
		});

	},


	'load section#carousel': function(event) {
		App.carousel = Lungo.Element.Carousel($$('[data-control=carousel]')[0], function(index, element) {
			Lungo.dom("section#carousel .title span").html(index + 1);
		});
	},

	'tap section#carousel > header [data-direction=left]':  App.carousel.prev,

	'tap section#carousel > header [data-direction=right]': App.carousel.next,

	'load section#pull': function(event) {
		App.pull = new Lungo.Element.Pull('section#pull article', {
			onPull: "Pull down to refresh",
			onRelease: "Release to get new data",
			onRefresh: "Refreshing...",
			callback: function() {
				alert("Pull & Refresh completed!");
				App.pull.hide();
			}
		});
	},

	// Testing doing something... anything on section load.
	// 'load section#add-moment': function(event) {
	// 	Lungo.Notification.confirm({
	// 		icon: 'user',
	// 		title: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
	// 		description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo amet nulla dolorum hic eum debitis dolorem expedita? Commodi molestiae tempora totam explicabo sed deserunt cum iusto eos perspiciatis ea in.',
	// 		accept: {
	// 			icon: 'checkmark',
	// 			label: 'Accept',
	// 			callback: function(){ alert("Yes!"); }
	// 		},
	// 		cancel: {
	// 			icon: 'close',
	// 			label: 'Cancel',
	// 			callback: function(){ alert("No!"); }
	// 		}
	// 	});
	// },

	'load section#add-moment': function(event) {
		Lungo.dom("#moment-form-title").val(rediscovr.currentmoment.moment_title);
		Lungo.dom("#moment-form-desc").val(rediscovr.currentmoment.moment_desc);
		Lungo.dom("#moment-form-location").val(rediscovr.currentmoment.moment_location);
		Lungo.dom("#moment-form-date").val(rediscovr.currentmoment.date_happened);
		Lungo.dom("#moment-form-time").val(rediscovr.currentmoment.time_happened);
		Lungo.dom("#moment-form-reminder-frequency").text(rediscovr.currentmoment.reminder_frequency);
		Lungo.dom("#moment-form-reminder-end").text(rediscovr.currentmoment.reminder_end);
	},

	// Reminder frequency panel.
	'tap #reminder-frequency-article button': function() {
		Lungo.dom("#reminder-frequency-article button.dark").children(".icon").remove();
		Lungo.dom("#reminder-frequency-article button.dark").toggleClass("dark").toggleClass("light");
		Lungo.dom(this).toggleClass('dark');
		Lungo.dom("#reminder-frequency-article button.dark").append("<span class='icon ok'></span>");
		rediscovr.currentmoment.reminder_frequency = Lungo.dom(this).children('abbr').html();
		Lungo.dom("#moment-form-reminder-frequency").text(rediscovr.currentmoment.reminder_frequency);
	},

	// Reminder end panel.
	'tap #reminder-end-article button': function() {
		Lungo.dom("#reminder-end-article button.dark").children(".icon").remove();
		Lungo.dom("#reminder-end-article button.dark").toggleClass("dark").toggleClass("light");
		Lungo.dom(this).toggleClass('dark');
		Lungo.dom("#reminder-end-article button.dark").append("<span class='icon ok'></span>");
		rediscovr.currentmoment.reminder_end = Lungo.dom(this).children('abbr').html();
		Lungo.dom("#moment-form-reminder-end").text(rediscovr.currentmoment.reminder_end);
	},

	'tap #moment-form-post-button': function() {
		// Upload images.
		rediscovr.currentmoment.images = [];
		var s3upload = s3upload != null ? s3upload : new S3Upload({
			file_dom_selector: 'moment-form-upload-files',
			s3_sign_put_url: 'http://192.241.156.130/s3_allow.php',
			onProgress: function(percent, message) { // Use this for live upload progress bars
				console.log('Upload progress: ', percent, message);
			},
			onFinishS3Put: function(public_url) { // Get the URL of the uploaded file
				console.log('Upload finished: ', public_url);
				rediscovr.currentmoment.images.push(public_url);
			},
			onError: function(status) {
				console.log('Upload error: ', status);
			}
		});

		// Save moment.
		App.Moment.post();
	},

	'load section#add-moment-location': function(event) {
		Lungo.dom("#location-searchbox").on("blur", function() {
			rediscovr.mapping.query = Lungo.dom("#location-searchbox").get(0).value;
			rediscovr.mapping.search();
		});
		rediscovr.mapping.addMap();
	},

	'load section#add-moment-select-contacts': function(event) {
		/*
		var options = [];
		var filter = ["displayName", "addresses"];
		var contact_results = function (contacts) {
			for (var i = 0; i < contacts.length; i++) {
			for (var j = 0; j < contacts[i].addresses.length; j++) {
			alert(
			"Pref: "           + contacts[i].addresses[j].pref          + "\n" +
			"Type: "           + contacts[i].addresses[j].type          + "\n" +
			"Formatted: "      + contacts[i].addresses[j].formatted     + "\n" +
			"Street Address: " + contacts[i].addresses[j].streetAddress + "\n" +
			"Locality: "       + contacts[i].addresses[j].locality      + "\n" +
			"Region: "         + contacts[i].addresses[j].region        + "\n" +
			"Postal Code: "    + contacts[i].addresses[j].postalCode    + "\n" +
			"Country: "        + contacts[i].addresses[j].country);
			}
		}
		var contact_error = function (contactError) {
			alert('onError!');
		}
		navigator.contacts.find(filter, contact_results, contact_error, options);
		*/

	},

	'touch article#notification a[data-action=normal]': function() {
		Lungo.Notification.show('user', 'Title', 2);
	},

	'touch article#notification a[data-action=loading]': function() {
		Lungo.Notification.show();
		setTimeout(Lungo.Notification.hide, 3000);
	},

	'touch article#notification a[data-action=success]': function() {
		Lungo.Notification.success('Title', 'Description', 'ok', 2);
	},

	'touch article#notification a[data-action=error]': function() {
		Lungo.Notification.error('Title', 'Description', 'remove', 2);
	},

	'touch article#notification a[data-action=confirm]': function() {
		Lungo.Notification.confirm({
			icon: 'user',
			title: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo amet nulla dolorum hic eum debitis dolorem expedita? Commodi molestiae tempora totam explicabo sed deserunt cum iusto eos perspiciatis ea in.',
			accept: {
				icon: 'checkmark',
				label: 'Accept',
				callback: function(){ alert("Yes!"); }
			},
			cancel: {
				icon: 'close',
				label: 'Cancel',
				callback: function(){ alert("No!"); }
			}
		});
	},

	'touch article#notification a[data-action=html]': function() {
		Lungo.Notification.html('<h1>Hello World</h1>', "Close");
	},

	'touch article#notification a[data-action=chaining]': function() {
		Lungo.Notification.show('user', 'user', 2, function() {
			Lungo.Notification.error('Title 2', 'Description 2', 'remove',  2, function() {
				Lungo.Notification.show('cog', 'cog', 2, function() {
					Lungo.Notification.html('<h1>Hello World</h1>', "Close");
				});
			});
		});
	}

});