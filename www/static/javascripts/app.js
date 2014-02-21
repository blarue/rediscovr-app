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
	if (rediscovr.currentmoment == undefined) {
		rediscovr.currentmoment = {};
	}

	// Move moment javascript to momentjs to avoid confusion.
	momentjs = moment;
	delete moment;

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
             Lungo.dom("#moments-article").empty();
             var m = new App.moments();
             m.getMoments();
        	 pull_moments.hide();
       	}
    });
});

Lungo.Events.init({

	'load section#add-moment': function(event) {
		// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true

		var default_date = momentjs().format("YYYY-MM-DD");
		Lungo.dom("#moment-form-date").val(default_date);

		var default_time = momentjs().format("HH:mm:ss");
		Lungo.dom("#moment-form-time").val(default_time);

		window.setTimeout(function() {
			if (Lungo.dom("#moment-form-location").val() == "") {
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
						//alert(url + $$.serializeParameters(req, "?"));
						$$.get(url, req, function(data) {
							if (data != undefined && data.results != undefined && data.status == "OK") {
								Lungo.dom("#moment-form-location").val(data.results[0].formatted_address);
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

	'load section#person': App.sectionTrigger,

	// Login
	'tap #login-done': function() {
        $(document.activeElement).blur();
		App.current_user.loginUser();
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

	'tap #moment-form-upload-files': function() {
		navigator.notification.confirm(
			'',
			function(buttonIndex) {
				console.log(buttonIndex);
				switch (buttonIndex) {
					case 1:
						console.log("Camera");
						App.photo.getPhoto();
						break;
					case 2:
						console.log("Library");
						App.photo.getPhoto(pictureSource.PHOTOLIBRARY);
						break;
					case 3:
						return false;
						break;
				}
			},
			'Upload a photo', // Title?
			['Take a photo','Choose Existing', 'Cancel']
		);
		//App.photo.getPhoto(pictureSource.PHOTOLIBRARY);
		//Lungo.dom("#moment-form-upload-files").on("change", App.photo.getPics);

	},

	'tap #moment-photos-upload-files': function() {
		Lungo.dom("#moment-photos-upload-files").on("change", App.photo.getPics);
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

	'load section#profile': function(event) {
		var username = "";
		var location = "";
		if (App.current_user.details.user_image != undefined) {
			Lungo.dom("#profile-user-image").attr("src", App.config.image_prefix + App.current_user.details.user_image);
		}
		if (App.current_user.details.firstName != undefined) {
			username += App.current_user.details.firstName + "  ";
		}
		if (App.current_user.details.lastName != undefined) {
			username += App.current_user.details.lastName;
		}
		Lungo.dom("#profile-username").text(username);
		if (App.current_user.details.city != undefined) {
			location = App.current_user.details.city;
		}
		if (App.current_user.details.state != undefined) {
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
	/*	Lungo.dom("#reminder-frequency-article button.dark").children(".icon").remove();
		Lungo.dom("#reminder-frequency-article button.dark").toggleClass("dark").toggleClass("light");
		Lungo.dom(this).toggleClass('dark');
		Lungo.dom("#reminder-frequency-article button.dark").append("<span class='icon ok'></span>");
		rediscovr.currentmoment.reminder_frequency = Lungo.dom(this).children('abbr').html();
		Lungo.dom("#moment-form-reminder-frequency").text(rediscovr.currentmoment.reminder_frequency);
    */
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
        try{
            var m_names = new Array("January", "February", "March","April", "May", "June", "July","August", "September","October", "November", "December");

            var d = Lungo.dom("#moment-form-date").val().split("-");
            var curr_date = d[2];
            var curr_month = parseInt(d[1])-1;
            var curr_year = d[0];
            var startDate = new Date(m_names[curr_month] +" " + curr_date + ", " + curr_year +" " + Lungo.dom("#moment-form-time").val());
            var endDate = startDate;
            //console.log(startDate + "/" + endDate + "/" + new Date());

            var title = Lungo.dom("#moment-form-title").val();
            var location = Lungo.dom("#moment-form-location").val();
            var notes = Lungo.dom("#moment-form-desc").val();
            var success = function(message) {  console.log("success");};
            var error = function(message) {  console.log("failed");};

            window.plugins.calendar.createEvent(title,location,notes,startDate,endDate,success,error);

        }catch(e){
            console.log(e);
        }

        rediscovr.currentmoment.curr_image = 0;
		rediscovr.currentmoment.num_images = Lungo.dom("#moment-form-upload-files").get(0).files.length;
		rediscovr.currentmoment.image_list = [];

		// Resize & Store images
		var myurl, new_name, imgr;
		var url_tool = window.webkitURL;
		var files = Lungo.dom("#moment-form-upload-files").get(0).files;
        for (var i = 0; i < files.length; i++) {
            myurl = url_tool.createObjectURL(files[i]);
            var new_name = App.generateUid('moment') + '.jpg';
            console.log("new_name: " + new_name);
            imgr = new App.image();
            imgr.generateImageBlob(myurl, 4, function(d) {
                console.log("There should be a blob.");
                //console.log(d);
                data_array = [new_name, 'moment', App.current_user.details.user_id, d, 0];
                //console.log(data_array);
                query = "INSERT OR IGNORE INTO `image` (`name`, `type`, `owner`, `data64`, `saved`) VALUES (?, ?, ?, ?, ?);";
                var DB = new App.db();
                DB.open();
                DB.db.transaction(
                    function(transaction) {
                        transaction.executeSql(query, data_array,
                            function(transaction, results) {
                                //console.log(results);
                                console.log("ImageID: " + results.insertId);
                                rediscovr.currentmoment.image_list.push({url_hash: new_name, image_id: results.insertId, d: d});
                            },
                            function(transaction, errors) {
                                console.log(errors);
                            }
                        );
                    }
                );
                rediscovr.currentmoment.curr_image++;
                if (rediscovr.currentmoment.curr_image == rediscovr.currentmoment.num_images) {
                    console.log("Last image. Add moment.")
                    // Save moment.
                    var m = new App.moment();
                    m.addMoment();
                }
            });
        }
    },

    'load section#add-moment-location': function(event) {
		Lungo.dom("#location-searchbox").on("blur", function() {
			rediscovr.mapping.query = Lungo.dom("#location-searchbox").get(0).value;
			rediscovr.mapping.search();
		});
		rediscovr.mapping.addMap();
	},

	'tap #select-contacts-list li': function() {
		if (Lungo.dom(this).hasClass('selected')) {
			Lungo.dom(this).removeClass('selected');
		} else {
			Lungo.dom(this).addClass('selected');
		}
	},

	'tap #add-moment-select-contacts-done': function() {
		var txt = "";
		if (rediscovr.currentmoment.collaborators == undefined) {
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
                    if (has_image) {
                        Lungo.dom("#select-contacts-list").prepend(new_li);
                    } else {
                        Lungo.dom("#select-contacts-list").append(new_li);
                    }
                }
            }
		};

		function onError(contactError) {
		    alert('onError!');
		};

		var contactSort = function(a, b) {
            aname = a.name.familyName + ' ' + a.name.givenName;
            bname = b.name.familyName + ' ' + b.name.givenName;
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