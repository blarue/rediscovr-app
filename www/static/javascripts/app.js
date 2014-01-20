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
	image_prefix: "http://s3.amazonaws.com/etch-images/"
};

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
	if (rediscovr.currentmoment == undefined) {
		rediscovr.currentmoment = {};
	}

	pushNotification = window.plugins.pushNotification;
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

	'load section#add-moment': function(event) {
		// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true

		console.log("Requesting GPS...");
		// We might want to go with this...
		// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true
		navigator.geolocation.getCurrentPosition(
			function(position) {
				var url = "http://maps.googleapis.com/maps/api/geocode/json";
				var req = {
					latlng: position.coords.latitude + "," + position.coords.longitude,
					sensor: "true"
				}
				alert(url + $$.serializeParameters(req, "?"));
				$$.get(url, req, function(data) {
					if (data != undefined && data.results != undefined && data.status == "OK") {
						Lungo.dom("#moment-form-location").val(data.results[0].formatted_address);
					} else {
						alert(JSON.stringify(data));
					}
				}, "json");
			}
		);
	},

	// List of people load event.
	'load section#people': function(event) {
		var c = new App.user();
		c.getCollaborators();
	},

	'load section#person': App.sectionTrigger,

	// Login
	'tap #login-done': function() {
		App.current_user.loginUser();
	},

	// Signup
	'tap #signup-done': function() {
		App.current_user.addUser();
	},

	'tap #moment-form-upload-files': function() {
		Lungo.dom("#moment-form-upload-files").on("change", App.photo.getPics);
	},

	// User Settings load event.
	'load section#settings': function(event) {
		console.log(App.current_user);
		if (App.current_user.details.firstName != undefined) {
			Lungo.dom("#settings-firstname").val(App.current_user.details.firstName);
		}
		if (App.current_user.details.lastName != undefined) {
			Lungo.dom("#settings-lastname").val(App.current_user.details.lastName);
		}
		if (App.current_user.details.email != undefined) {
			Lungo.dom("#settings-email").val(App.current_user.details.email);
		}
		if (App.current_user.details.city != undefined) {
			Lungo.dom("#settings-city").val(App.current_user.details.city);
		}
		if (App.current_user.details.state != undefined) {
			Lungo.dom("#settings-state").val(App.current_user.details.state);
		}
		if (App.current_user.details.country != undefined) {
			Lungo.dom("#settings-country").val(App.current_user.details.country);
		}
		if (App.current_user.details.phone != undefined) {
			Lungo.dom("#settings-phonenumber").val(App.current_user.details.phone);
		}
	},

	// 'tap #moment-capture-button': function() {
	// 	try {
	// 		navigator.camera.getPicture(function(imageData) {
	// 				// var fs = Lungo.dom("#moment-form-upload-files").get(0).files;
	// 				// for (var i = 0; i < fs.length; i++) {
	// 				// 	var chosen_images = "<img style=\"display:inline-block;width:40px;height:40px;margin-right:.3em;margin-bottom:.3em;\" src=\"" + imageData + "\" />";
	// 				// 	Lungo.dom("#add-moment-selected-images").append(chosen_images);	
	// 				// }
	// 			}, 
	// 			function() {
	// 				alert("Nooo")
	// 			}, {
	// 				quality: 50, 
	// 				destinationType: Camera.DestinationType.FILE_URI, 
	// 				sourceType: Camera.PictureSourceType.PHOTOLIBRARY
	// 			}
	// 		);
	// 	} catch (e) {
	// 		alert(JSON.stringify(e));
	// 	}
	// },

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
		Lungo.Notification.show();
		rediscovr.currentmoment.curr_image = 0;
		rediscovr.currentmoment.num_images = Lungo.dom("#moment-form-upload-files").get(0).files.length;
		// Upload images.
		rediscovr.currentmoment.images = [];
		var s3upload = s3upload != null ? s3upload : new S3Upload({
			file_dom_selector: 'moment-form-upload-files',
			s3_sign_put_url: 'http://api.etched.io/api/fileupload',

			onProgress: function(percent, message) { // Use this for live upload progress bars
				console.log('Upload progress: ', percent, message);
			},
			onFinishS3Put: function(public_url) { // Get the URL of the uploaded file
				console.log('Upload finished: ', public_url);
				var url_parts = public_url.split("/");
				rediscovr.currentmoment.images.push({url_hash: url_parts[url_parts.length - 1]});
				rediscovr.currentmoment.curr_image++;
				if (rediscovr.currentmoment.curr_image == rediscovr.currentmoment.num_images) {
					// Save moment.
					var m = new App.moment();
					m.addMoment();
				}
			},
			onError: function(status) {
				console.log('Upload error: ', status);
				Lungo.Notification.hide();
			}
		});
	},

	'load section#add-moment-location': function(event) {
		Lungo.dom("#location-searchbox").on("blur", function() {
			rediscovr.mapping.query = Lungo.dom("#location-searchbox").get(0).value;
			rediscovr.mapping.search();
		});
		rediscovr.mapping.addMap();
	},

	'tap #select-contacts-list li': function() {
		rediscovr.currentmoment.collaborators = [{
			name: Lungo.dom(this).children('div').children('strong').text(),
			email: Lungo.dom(this).children('div').children('span').text()
		}];
		Lungo.dom("#add-moment-invite").text(rediscovr.currentmoment.collaborators[0].name);
		Lungo.Router.back();
	},

	'load section#add-moment-select-contacts': function(event) {
		function onSuccess(contacts) {
		    //alert('Found ' + contacts.length + ' contacts.');
		    Lungo.dom("#select-contacts-list").html("");
		    var new_li;
		    var has_email = true;
		    var c = contacts;
		    for (var i = 0; i < contacts.length; i++) {
		    	has_email = true;
		    	var user_img = "img/user2-icon@2x.png";
		    	if (c[i].photos != undefined && c[i].photos != null && c[i].photos.length) {
					for (var j = 0; j < c[i].photos.length; j++) {
			    		if (c[i].photos[j].pref == true || (j == (c[i].photos.length - 1) && user_img == "img/user2-icon@2x.png")) {
							user_img = c[i].photos.value;
						}
					}
		    	}
		    	new_li = "<li class=\"\">\
		    		<div class=\"user-avatar avatar-tiny avatar-shadow\">\
						<img src=\"" + user_img + "\"/>\
					</div>\
					<div>\
						<strong class=\"text bold\">" + c[i].name.formatted + user_img + "</strong>";
						
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
			    	Lungo.dom("#select-contacts-list").append(new_li);
			    }
		    }
		};

		function onError(contactError) {
		    alert('onError!');
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