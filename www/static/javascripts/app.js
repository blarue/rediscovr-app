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
var pushNotification;

App.config = {
	image_prefix: "http://s3.amazonaws.com/etch-images/",
	local_prefix: ""
};

App.upload_images = [];

// Algorithm for generating unique IDs. Pass in a prefix like 'moment'.
App.generateUid = function (prefix, separator) {
	var timestamp = new Date().getTime();
	prefix = prefix || "general";
	var delim = separator || "-";
	// Return a random four character string.
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	// Return the final product.
	return (prefix + delim + timestamp + delim + S4() + S4() + S4());
};

// Set up a global momentjs var. Gets set below.
var momentjs;

Lungo.ready(function() {

	// Initialize DB.
	App.database.open();
	
	// Create instance of user for the current user.
	App.current_user = new App.user();

	// Check if there is a logged in user.
	App.current_user.getLoggedInUser();

	// Set up the rediscovr object and current moment within it.
	if (typeof rediscovr == "undefined") {
		rediscovr = {};
	}
	if (rediscovr.currentmoment === undefined) {
		rediscovr.currentmoment = {};
	}

	// Move moment javascript to momentjs to avoid confusion.
	momentjs = moment;

	pushNotification = window.plugins.pushNotification;

    $('#topBar').on("click",function(){
        $("#moments-article").animate({ scrollTop: 0 }, "fast");
        });

    var pull_moments = new Lungo.Element.Pull("#moments-article", {
        onPull:"pull down to refresh",
        onRelease:"Release to get new data",
        onRefresh:"Refreshing.....",
        callback:function(){
            console.log("Pull & refresh completed!");
            var m = new App.moments();
            m.getMoments("moments-article");
            pull_moments.hide();
        }
    });
});

Lungo.Events.init({
    'load section#moments': function(event) {
        var m = new App.moments();
        m.getMoments();
        Lungo.dom("#moments-article").empty();
        m.getMoments();
    },

	'load section#add-moment': function(event) {
		// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true

		var default_date = momentjs().format("YYYY-MM-DD");
		Lungo.dom("#moment-form-date").val(default_date);

		var default_time = momentjs().format("HH:mm:ss");
		Lungo.dom("#moment-form-time").val(default_time);

		window.setTimeout(function() {
			if (Lungo.dom("#moment-form-location").val() === "") {
				console.log("Requesting GPS...");
				// We might want to go with this...
				// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true
				navigator.geolocation.getCurrentPosition(
					function(position) {
						var url = "http://maps.googleapis.com/maps/api/geocode/json";
						var req = {
							latlng: position.coords.latitude + "," + position.coords.longitude,
							sensor: "true"
						};
						//alert(url + $$.serializeParameters(req, "?"));
						$$.get(url, req, function(data) {
							if (data !== undefined && data.results !== undefined && data.status == "OK") {
								var formatted_address = data.results[0].address_components[0].short_name + " " + // Number
									data.results[0].address_components[1].short_name + ", " + // Street
									data.results[0].address_components[4].short_name + ", " + // City
									data.results[0].address_components[5].short_name; // State

								Lungo.dom("#moment-form-location").val(formatted_address);
							} else {
								alert(JSON.stringify(data));
							}
						}, "json");
					}
				);
			}
		}, 600);
	},

	// List of people load event.
	'load section#people': function(event) {
		var c = new App.user();
		c.getCollaborators();
	},

	'tap .people-list-item': function(event) {
		console.log(this.id);
		var user_id = this.id.split("-")[this.id.split("-").length - 1];
		var c = new App.user();
		c.getUserMoments(user_id);
	},

	// Login
	'tap #login-done': function() {
        $(document.activeElement).blur();
		App.current_user.loginUser();
	},

    // Groups
    'load section#groups': function(event) {
//        var c = new App.user();
        App.current_user.getGroups();

        $('#add-new-group-input').focus(function() {
            Lungo.dom("#add-new-group-img").hide();
            Lungo.dom("#add-new-group-img").removeClass('tag');
            Lungo.dom("#add-new-group-btn").show();
            Lungo.dom("#add-new-group-btn").addClass('tag');
        });

        $('#add-new-group-input').blur(function() {
            if(Lungo.dom('#add-new-group-input').val() === "") {
                Lungo.dom("#add-new-group-img").show();
                Lungo.dom("#add-new-group-img").addClass('tag');
                Lungo.dom("#add-new-group-btn").hide();
                Lungo.dom("#add-new-group-btn").removeClass('tag');
            }
        });

    },

    // Signup
	'tap #signup-done': function() {
        $(document.activeElement).blur();
		if(!ValidationSignForm())
			return false;

		App.current_user.addUser();
	},

	// Signup
	'tap #settings-save': function() {
		App.current_user.updateUser();
	},

	'tap #aside-logout': function() {
		App.current_user.logout();
	},

	'tap #left-sidecar-aside-close': function() {
		Lungo.Aside.hide();
	},
	
	// TODO: Change the following to a class selector so we don't have to repeat.
	'tap #moment-form-upload-files': function() {
		// Pop up a prompt (using confirm) to choose camera or photo library.
		navigator.notification.confirm(
			'',
			function(buttonIndex) {
				console.log(buttonIndex);
				switch (buttonIndex) {
					case 1:
						console.log("Capture from camera.");
						App.photo.getPhoto();
						break;
					case 2:
						console.log("Capture from library.");
						App.photo.getPhoto(pictureSource.PHOTOLIBRARY);
						break;
					case 3:
						return false;
				}
			},
			'Upload a photo', // Title?
			['Take a photo','Choose Existing', 'Cancel']
		);
	},
	
	// TODO: Change the following to a class selector so we don't have to repeat.
	'tap #moment-photos-upload-files': function() {
		// Pop up a prompt (using confirm) to choose camera or photo library.
		navigator.notification.confirm(
			'',
			function(buttonIndex) {
				console.log(buttonIndex);
				switch (buttonIndex) {
					case 1:
						console.log("Capture from camera.");
						App.photo.getPhoto();
						break;
					case 2:
						console.log("Capture from library.");
						App.photo.getPhoto(pictureSource.PHOTOLIBRARY);
						break;
					case 3:
						return false;
				}
			},
			'Upload a photo', // Title?
			['Take a photo','Choose Existing', 'Cancel']
		);
	},

    'load section#notifications': function(event) {
        console.log("Load notifications page....");
        var notifications = new App.notification();
        notifications.getNotifications();
    },

    'tap #profile-upload-file': function() {
        console.log(2);
        Lungo.dom("#profile-upload-file").on("change", App.photo.getProfilePics);
    },

    'load section#notifications': function(event) {
        console.log("Load notifications page....");
        var notifications = new App.notification();
        notifications.getNotifications();
    },

    'tap #profile-upload-file': function() {
        console.log(2);
        Lungo.dom("#profile-upload-file").on("change", App.photo.getProfilePics);
    },

	// User Settings load event.
	'load section#settings': function(event) {
		console.log(App.current_user);
		if (App.current_user.details.firstName !== undefined) {
			Lungo.dom("#settings-firstname").val(App.current_user.details.firstName);
		}
		if (App.current_user.details.lastName !== undefined) {
			Lungo.dom("#settings-lastname").val(App.current_user.details.lastName);
		}
		if (App.current_user.details.email !== undefined) {
			Lungo.dom("#settings-email").val(App.current_user.details.email);
		}
		if (App.current_user.details.city !== undefined) {
			Lungo.dom("#settings-city").val(App.current_user.details.city);
		}
		if (App.current_user.details.state !== undefined) {
			Lungo.dom("#settings-state").val(App.current_user.details.state);
		}
		if (App.current_user.details.country !== undefined) {
			Lungo.dom("#settings-country").val(App.current_user.details.country);
		}
		if (App.current_user.details.phone !== undefined) {
			Lungo.dom("#settings-phonenumber").val(App.current_user.details.phone);
		}
	},

	'load section#profile': function(event) {
		var username = "";
		var location = "";
		if (App.current_user.details.user_image !== undefined) {
			Lungo.dom("#profile-user-image").attr("src", App.config.image_prefix + App.current_user.details.user_image);
		}
		if (App.current_user.details.firstName !== undefined) {
			username += App.current_user.details.firstName + "  ";
		}
		if (App.current_user.details.lastName !== undefined) {
			username += App.current_user.details.lastName;
		}
		Lungo.dom("#profile-username").text(username);
		if (App.current_user.details.city !== undefined) {
			location = App.current_user.details.city;
		}
		if (App.current_user.details.state !== undefined) {
			location += ", " + App.current_user.details.state;
		}
		Lungo.dom("#profile-location").text(location);
		// Get moments from DB.
		var db = new App.db();
        db.open();
        var my_moment_count = 0;
        var param = [0]; //[App.current_user.details.user_id];
        var query = "SELECT COUNT(*) AS `allmoments` FROM `moment` WHERE `user` != ?";
        db.db.transaction(
            function(transaction) {
                transaction.executeSql(query, param,
                    function(transaction, results) {
                        my_moment_count = results.rows.item(0).allmoments;
                        Lungo.dom("#profile-stats-allmoments").text(my_moment_count);
                    },
                    function(transaction, error) { console.log('Oops.  Error was '+error.message+' (Code '+error.code+')'); }
                );
            }
        );
        /*		delete db;

         // Get moments from DB.
         var db = new App.db();
         db.open();
         */
        var collaborations_count = 0;
        var param1 = [App.current_user.details.user_id];
        var query1 = "SELECT COUNT(*) AS `collaboation` FROM moment, moment_user WHERE moment.moment_id=moment_user.moment_id and moment_user.user_id=?";
        db.db.transaction(
            function(transaction) {
                transaction.executeSql(query1, param1,
                    function(transaction, results) {
                        collaborations_count = results.rows.item(0).collaboation;
                        Lungo.dom("#profile-stats-collaborations").text(collaborations_count);
                    },
                    function(transaction, error) { console.log('Oops.  Error was '+error.message+' (Code '+error.code+')'); }
                );
            }
        );

        var private_count = 0;
        var param2 = [0];//[App.current_user.details.user_id];
        var query2 = "SELECT COUNT(*) AS `collaboation` FROM `moment` WHERE `user` != ?";
        db.db.transaction(
            function(transaction) {
                transaction.executeSql(query2, param2,
                    function(transaction, results) {
                        private_count = results.rows.item(0).collaboation - collaborations_count;
                        Lungo.dom("#profile-stats-private").text(private_count);
                    },
                    function(transaction, error) { console.log('Oops.  Error was '+error.message+' (Code '+error.code+')'); }
                );
            }
        );
        delete db;
        // var private_count = my_moment_count - collaborations_count;
        //	Lungo.dom("#profile-stats-private").text(private_count);
        //	Lungo.dom("#profile-stats-collaborations").text("0");
        
        Lungo.dom(".moment-item").remove();
        
		var m = new App.moments();
		m.getMoments("#profile-article");
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
		rediscovr.currentmoment.curr_image = 0;
		//rediscovr.currentmoment.num_images = Lungo.dom("#moment-form-upload-files").get(0).files.length;
		rediscovr.currentmoment.num_images = Lungo.dom("#add-moment-selected-images").children().length;
		rediscovr.currentmoment.image_list = [];

		// Resize & Store images
		var myurl, new_name, imgr;
		var url_tool = window.webkitURL;
		var files = [];
		for (var i = 0; i < Lungo.dom("#add-moment-selected-images").children().length; i++) {
			var full_path = Lungo.dom("#add-moment-selected-images").children()[i].src;
			var path_split = full_path.split("/");
			var filename = path_split[path_split.length - 1];
			files.push(filename);
		}
		//var files = Lungo.dom("#moment-form-upload-files").get(0).files;
		if (files.length) {
			for (var i = 0; i < files.length; i++) {
				//myurl = url_tool.createObjectURL(files[i]);
				//var n = files[i].name.split(".");
				var n = files[i].split(".");
				var ext = n[n.length - 1];
				//var new_name = App.generateUid('moment') + "." + ext;
				var types = {
					video: ["mov", "mp4", "m4v"],
					image: ["jpg", "jpeg", "png", "gif"]
				};
				var is_vid = (types.video.indexOf(ext.toLowerCase()) != -1) ? true : false;
				var is_img = (types.image.indexOf(ext.toLowerCase()) != -1) ? true : false;
				var asset_type = (is_img) ? "image" : "video";
				var file_name = files[i];

				console.log("new_name: " + file_name);
				// var imgr = new App.image();
				// imgr.mode = "cache-new";
				// imgr.cacheNewImage(files[i], new_name, function(res) {
				data_array = [file_name, 'moment', asset_type, App.current_user.details.user_id, 0];
				//console.log(data_array);
				query = "INSERT OR IGNORE INTO `image` (`name`, `purpose`, `type`, `owner`, `saved`) VALUES (?, ?, ?, ?, ?);";
				var DB = new App.db();
				DB.open();
				DB.db.transaction(function(transaction){transaction.executeSql(query, data_array, 
					function(transaction, results) {
						//console.log(results);
						console.log("ImageID: " + results.insertId);
						rediscovr.currentmoment.image_list.push({url_hash: file_name, image_id: results.insertId});
						console.log(rediscovr.currentmoment.image_list);
					},
					function(transaction, errors) {
						console.log(errors);
					}
				);});
				rediscovr.currentmoment.curr_image++;
				if (rediscovr.currentmoment.curr_image == rediscovr.currentmoment.num_images) {
					if (Lungo.dom("#moment-form-post-button").text() == "Post") {
						console.log("Last image. Add moment.");
						// Save moment.
						var m = new App.moment();
						m.addMoment();
					} else if (Lungo.dom("#moment-form-post-button").text() == "Edit") {
						alert("Editing");
						var m = new App.moment();
						m.editMoment();
					}
				}
				//});
				// imgr = new App.image();
				// imgr.generateImageBlob(myurl, 4, function(d) {
				//	console.log("There should be a blob.");
				//	//console.log(d);
				//	data_array = [new_name, 'moment', App.current_user.details.user_id, d, 0];
				//	//console.log(data_array);
				//	query = "INSERT OR IGNORE INTO `image` (`name`, `type`, `owner`, `data64`, `saved`) VALUES (?, ?, ?, ?, ?);";
				//	var DB = new App.db();
				//	DB.open();
				//	DB.db.transaction(
				//		function(transaction) {
				//			transaction.executeSql(query, data_array, 
				//				function(transaction, results) {
				//					//console.log(results);
				//					console.log("ImageID: " + results.insertId);
				//					rediscovr.currentmoment.image_list.push({url_hash: new_name, image_id: results.insertId, d: d});
				//				},
				//				function(transaction, errors) {
				//					console.log(errors);
				//				}
				//			);
				//		}
				//	);
				//	rediscovr.currentmoment.curr_image++;
				//	if (rediscovr.currentmoment.curr_image == rediscovr.currentmoment.num_images) {
				//		if (Lungo.dom("#moment-form-post-button").text() == "Post") {
				//			console.log("Last image. Add moment.")
				//			// Save moment.
				//			var m = new App.moment();
				//			m.addMoment();
				//		} else if (Lungo.dom("#moment-form-post-button").text() == "Edit") {
				//			alert("Editing");
				//			var m = new App.moment();
				//			m.editMoment();
				//		}
				//	}
				// });
			}
		} else {
			if (Lungo.dom("#moment-form-post-button").text() == "Post") {
				console.log("Last image. Add moment.");
				// Save moment.
				var m = new App.moment();
				m.addMoment();
			} else if (Lungo.dom("#moment-form-post-button").text() == "Edit") {
				alert("Editing");
				var m = new App.moment();
				m.editMoment();
			}
		}
	},

	'load section#add-moment-location': function(event) {
		Lungo.dom("#location-searchbox").on("blur", function() {
			rediscovr.mapping.query = Lungo.dom("#location-searchbox").get(0).value;
			rediscovr.mapping.search();
		});
		rediscovr.mapping.addMap();
	},

	'load article#moments-years-article': function(event) {
		var m = new App.moments();
		m.getMomentsYears();
	},

	'load article#moments-months-article': function(event) {
		var m = new App.moments();
		m.getMomentsMonths();
	},

	'tap #add-moment-cancel': function() {
		Lungo.dom(".selectedphotos").hide();
		Lungo.dom("#add-moment-file-upload").show();
		Lungo.dom("#add-moment-selected-images").html("");
		Lungo.dom("#moment-form-title").val("");
		Lungo.dom("#moment-form-desc").val("");
		var default_date = momentjs().format("YYYY-MM-DD");
		Lungo.dom("#moment-form-date").val(default_date);
		var default_time = momentjs().format("HH:mm:ss");
		Lungo.dom("#moment-form-time").val(default_time);
		Lungo.dom("#moment-form-location").val("");
		Lungo.dom("#moment-form-reminder-frequency").text("Yearly");
		Lungo.dom("#moment-form-reminder-end").text("Never");
		Lungo.dom("#add-moment-invite").text("Invite Collaborators");
		// jQuery? Why not..?
		$("#moment-form-upload-files").replaceWith($("#moment-form-upload-files").clone());

	},

	// 'tap #moment-edit-button': function() {
	//	App.database.getMomentForEdit();
	// },

	'tap #select-contacts-list li': function() {
		if (Lungo.dom(this).hasClass('selected')) {
			Lungo.dom(this).removeClass('selected');
		} else {
			Lungo.dom(this).addClass('selected');
		}
	},

    'load article#moments-article': function(event) {
        // console.log("======================");
        //var m = new App.moments();
        //m.getMoments("moments-article");
    },
    'load article#moments-months-article': function(event) {

    },
    'load article#moments-years-article': function(event) {
        console.log("++++++++++++");
        var pull_example = new Lungo.Element.Pull("#moments-years-article", {
            onPull:"pull down to refresh",
            onRelease:"Release to get new data",
            onRefresh:"Refreshing.....",
            callback:function(){
                console.log("Pull & refresh completed!");
                Lungo.dom("#moments-article").empty();
                var m = new App.moments();
                m.getMoments();
                pull_example.hide();
            }
        });
        //var m = new App.moments();
        //m.getMoments("moments-article");
    },

    'tap #add-moment-select-contacts-done': function() {
		var txt = "";
		if (rediscovr.currentmoment.collaborators === undefined) {
			rediscovr.currentmoment.collaborators = [];
		}

		Lungo.dom("#select-contacts-list li.selected div.contact-details").each(function() {
			rediscovr.currentmoment.collaborators.push({
				name: Lungo.dom(this).children("strong").text(),
				email: Lungo.dom(this).children("span").text()
			});
			txt += Lungo.dom(this).children("strong").text() + ", ";
		});

		Lungo.dom("#add-moment-invite").text(txt.substr(0, txt.length - 2));
		Lungo.Router.back();
	},

	'load section#add-moment-select-contacts': function(event) {
		function onSuccess(contacts) {
			//alert('Found ' + contacts.length + ' contacts.');
			Lungo.dom("#select-contacts-list").html("");
			var new_li;
			var has_email = true;
			var has_image = false;
			// Sort contacts alphabetically using function below.
			var c = contacts.sort(contactSort);
			for (var i = 0; i < c.length; i++) {
				has_email = true;
				has_image = false;
				var user_img = "img/user2-icon@2x.png";
				if (c[i].photos != undefined && c[i].photos != null && c[i].photos.length) {
					for (var j = 0; j < c[i].photos.length; j++) {
						if (c[i].photos[j].pref == true || (j == (c[i].photos.length - 1) && user_img == "img/user2-icon@2x.png")) {
							user_img = c[i].photos[j].value;
							has_image = true;
						}
					}
				}
				new_li = "<li class=\"\">\
					<div class=\"user-avatar avatar-tiny avatar-shadow\">\
						<img src=\"" + user_img + "\"/>\
					</div>\
					<div class=\"contact-details\">\
						<strong class=\"text bold\">" + c[i].name.formatted + "</strong>";
						
				if (c[i].emails != undefined && c[i].emails != null && c[i].emails.length) {
					for (var j = 0; j < c[i].emails.length; j++) {
						var email_add = "";
						if (c[i].emails[j].pref == true || (j == (c[i].emails.length - 1) && !email_add.length)) {
							email_add = "<span class=\"text tiny\">" + c[i].emails[j].value + "</span>";
						}
					}
					new_li += email_add;
				} else {
					has_email = false;
				}
				new_li += "</div>\
					</li>";
				if (has_email) {
					// Put contacts with images at the top.
					// if (has_image) {
					// 	Lungo.dom("#select-contacts-list").prepend(new_li);
					// } else {
					Lungo.dom("#select-contacts-list").append(new_li);
					// }
				}
			}
		}

		function onError(contactError) {
			alert('onError!');
		}

		var contactSort = function(a, b) {
			aname = a.name.givenName + ' ' + a.name.familyName;
			bname = b.name.givenName + ' ' + b.name.familyName;
			return aname < bname ? -1 : (aname == bname ? 0 : 1);
		};

		// find all contacts with 'Bob' in any name field
		var options      = new ContactFindOptions();
		options.filter   = "";
		options.multiple = true;
		var fields       = ["displayName", "name", "emails", "photos"];
		navigator.contacts.find(fields, onSuccess, onError, options);

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

	}

});

function onNotificationAPN (event) {
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    alert('device token = ' + result);
}
function successHandler (result) {
    alert('result = ' + result);
}
if ( device.platform == 'android' || device.platform == 'Android' )
{
    pushNotification.register(
        successHandler,
        errorHandler, {
            "senderID":"replace_with_sender_id",
            "ecb":"onNotificationGCM"
        });
}
else
{
    pushNotification.register(
        tokenHandler,
        errorHandler, {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
        });
}
function errorHandler (error) {
    alert('error = ' + error);
}