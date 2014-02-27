// Class for INSERT UPDATE DELETE to local database.
App.database = {
	// DB Stuff
	shortname: 'moments', 
	version: '1.1', 
	displayname: 'moments', 
	maxsize: 10*1024*1024,
	db: {},

	open: function() {
		this.db = openDatabase(this.shortname, "", this.displayname, this.maxsize);
		this.createTables();
	},

	createTables: function() {
		console.log("Trying to create table.");
		console.log(typeof this.db);
		// User table (id = Local, user_id = API ID)
		var user_definition = "" + 
			"CREATE TABLE IF NOT EXISTS `user`(" + 
				"`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " + 
				"`user_id` INTEGER UNIQUE NULL, " + 
				"`first_name` TEXT NULL, " + 
				"`last_name` TEXT NULL, " + 
				"`email` TEXT NOT NULL, " + 
				"`phone` TEXT NULL, " + 
				"`city` TEXT NULL, " + 
				"`state` TEXT NULL, " + 
				"`country` TEXT NULL, " + 
				"`user_image` TEXT NULL, " + 
				"`current_user` INTEGER NOT NULL DEFAULT 0 " + 
			");";

		// Moment table (id = Local, moment_id = API ID)
		var moment_definition = "\
			CREATE TABLE IF NOT EXISTS `moment`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`moment_id` INTEGER UNIQUE NULL, \
				`title` TEXT NOT NULL, \
				`text` TEXT NULL, \
				`user` INTEGER NOT NULL, \
				`location` TEXT NOT NULL, \
				`date` DATETIME, \
				`reminder` TEXT NOT NULL DEFAULT 'Never', \
				`reminder_end` TEXT NOT NULL DEFAULT 'Never' \
			);";
		// Image table (id = Local, user_id = API ID)
		var image_definition = "" + 
			"CREATE TABLE IF NOT EXISTS `image`(" + 
				"`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " + 
				"`image_id` INTEGER UNIQUE NULL, " + 
				"`name` TEXT UNIQUE NOT NULL, " + 
				"`purpose` TEXT NOT NULL DEFAULT 'Moment', " + 
				"`type` TEXT NOT NULL DEFAULT 'image', " + 
				"`owner` INTEGER NOT NULL, " + 
				"`saved` INTEGER NOT NULL DEFAULT 0 " + 
			");";
		// Moment/Image map table.
		var moment_image_definition = "\
			CREATE TABLE IF NOT EXISTS `moment_image`(\
				`moment_id` INTEGER NOT NULL, \
				`image_id` INTEGER NOT NULL, \
				`primary` INTEGER NOT NULL DEFAULT 1, \
				PRIMARY KEY (`moment_id`, `image_id`) \
			);";
		// Moment/User (Collaborator) map table.
		var moment_user_definition = "\
			CREATE TABLE IF NOT EXISTS `moment_user` ( \
				`user_id` INTEGER NOT NULL, \
				`moment_id` INTEGER NOT NULL, \
				PRIMARY KEY (`user_id`,`moment_id`) \
			);";
		// Moment Sync.
		var moment_sync_definition = "\
			CREATE TABLE IF NOT EXISTS `moment_sync` ( \
				`servertime` INTEGER NOT NULL PRIMARY KEY \
			);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(user_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_user_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_sync_definition, [], App.database.nullDataHandler, App.database.errorHandler);
			}
		);
	},

	addUser: function(d) {
		// console.log("Adding logged in user to local DB.");
		// console.log(d);
		d.current_user = (d.current_user != undefined && d.current_user) ? 1 : 0;

		if (d.id != undefined) {
			var data_array = [d.id, d.email, d.first_name, d.last_name, d.city, d.state, d.country, d.user_image, d.current_user];
			var query = "INSERT OR IGNORE INTO `user` (`user_id`, `email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
		} else {
			var data_array = [d.email, d.first_name, d.last_name, d.city, d.state, d.country, d.image, d.current_user];
			var query = "INSERT INTO `user` (`email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
		}		
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleInsertedUser, App.database.errorHandler);
			}
		);
	},

	addMoment: function(d) {
		console.log("Attempting to add moment.");
		if (d.id != undefined && d.id != null && d.id) {
			var data_array = [d.id, d.title, d.text, d.date, d.user, d.location, d.reminder_frequency, d.reminder_end];
			var query = "INSERT OR IGNORE INTO `moment` (`moment_id`, `title`, `text`, `date`, `user`, `location`, `reminder`, `reminder_end`) \
				VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
			this.db.transaction(
				function(transaction) {
					transaction.executeSql(query, data_array, App.database.nullDataHandler, App.database.errorHandler);
				}
			);
		} else {
			var data_array = [d.title, d.text, d.date, d.user, d.location, d.reminder_frequency, d.reminder_end];
			var query = "INSERT OR IGNORE INTO `moment` (`title`, `text`, `date`, `user`, `location`, `reminder`, `reminder_end`) \
				VALUES (?, ?, ?, ?, ?, ?, ?);";
			this.db.transaction(
				function(transaction) {
					transaction.executeSql(query, data_array, App.database.handleInsertedMoment, App.database.errorHandler);
				}
			);
		}
	},
	
	addImage: function(d, moment_id) {
		console.log("Attempting to add image.");
		var data_array = [d.name, d.type, d.owner];
		var query = "INSERT OR IGNORE INTO `image` (`name`, `type`, `owner`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				if (moment_id != undefined && moment_id != null && moment_id) {
					this.tmp_moment_id = moment_id;
					transaction.executeSql(query, data_array, App.database.handleCachedImage, App.database.errorHandler);
				} else {
					transaction.executeSql(query, data_array, App.database.handleInsertedImage, App.database.errorHandler);
				}
			}
		);
	},

	flagImageSaved: function(filename) {
		this.open();
		var data_array = [filename];
		var query = "UPDATE `image` SET `saved` = 1 WHERE `name` = ?";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, 
					function(transaction, results) {
						console.log("Image updated.");
					},
					function(transaction, errors) {
						console.log("Flag image saved error:");
						console.log(errors);
					}
				);
			}
		);
	},

	associateImage: function(d) {
		var data_array = [d.moment_id, d.image_id, d.primary];
		var query = "INSERT OR IGNORE INTO `moment_image` (`moment_id`, `image_id`, `primary`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleAssociatedImage, App.database.errorHandler);
			}
		);
	},

	getCurrentUser: function(ref) {
		//Query DB for logged in user.
		var query = "SELECT * FROM `user` WHERE `current_user` = 1";
		console.log(query);
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, [], ref.handleGetUserDB, App.database.errorHandler);
			}
		);
	},

	getMoments: function(owner, order, limit, ref) {
		console.log("Running DB getMoments");
		this.myref = ref;
		var wheres = [{sql: "`title` IS NOT NULL", param: null}];
		var _limit = '';
		var _order = '';
		var _data = [];
		var _this = this;

		if (owner != undefined) {
			wheres.push({sql: "`user` = ?", param: owner});
		}
		if (limit != undefined) {
			_limit = " LIMIT " + limit;
		}
		if (order != undefined) {
			_order = " ORDER BY " + order;
		}
		if (wheres.length) {
			for (var i = 0; i < wheres.length; i++) {
				if (i == 0) {
					var _where = " WHERE ";
				} else {
					_where += " AND ";
				}
				_where += wheres[i].sql;
				if (wheres[i].param != null) {
					_data.push(wheres[i].param);
				}
			}
		}
		var _query = "SELECT `moment`.*, \
				`user`.`user_id` AS `user_id`, `user`.`first_name`, `user`.`last_name`, \
				`user`.`email`, `user`.`city`, `user`.`state`, `user`.`user_image` \
			FROM `moment` \
			JOIN `user` ON `user`.`user_id` = `moment`.`user` " + _where + _order + _limit;

		// Find moments
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(_query, _data, 
					function(transaction, results) {
						// Loop through moments.
						if (results.rows != undefined && results.rows.length) {
							var returnobj = {
								count: results.rows.length,
								moments: []
							}
							for (var i=0; i < results.rows.length; i++) {
								var m = results.rows.item(i);
								var moment = new App.moment();
								//console.log(_this.myref);
								moment.domnode = _this.myref.domnode;
								moment.details.moment_id = m.moment_id;
								moment.details.api_id = m.moment_id;
								moment.details.user = m.user_id;
								moment.details.title = m.title;
								moment.details.text = m.text;
								moment.details.location = m.location;
								moment.details.date = m.date;
								moment.details.creator = {};
								moment.details.creator.id = m.user_id;
								moment.details.creator.first_name = m.first_name;
								moment.details.creator.last_name = m.last_name;
								moment.details.creator.email = m.email;
								moment.details.creator.city = m.city;
								moment.details.creator.state = m.state;
								moment.details.creator.user_image = m.user_image;
								moment.showMoment("append");
								if (Lungo.Router.history != "moments") {
									Lungo.Router.section("moments");
								}
							}
						}
					},
					App.database.errorHandler
				);
			}
		);
	},

	getMomentForEdit: function(moment_id, ref) {
		var _this = this;
		console.log("Running DB getMoment for moment_id: " + moment_id);
		var _query = "SELECT `moment`.*, \
				`user`.`user_id` AS `user_id`, `user`.`first_name`, `user`.`last_name`, \
				`user`.`email`, `user`.`city`, `user`.`state`, `user`.`user_image` \
			FROM `moment` \
			JOIN `user` ON `user`.`user_id` = `moment`.`user` \
			WHERE `moment`.`moment_id` = ? \
			LIMIT 1 ";
		//console.log(_query);
		// Find moments
		this.db.transaction(function(transaction){transaction.executeSql(_query, [moment_id], 
			function(transaction, results) {
				// Loop through moments.
				if (results.rows != undefined && results.rows.length) {
					var m = results.rows.item(0);
					//Lungo.dom(".selectedphotos").hide();
					//Lungo.dom("#add-moment-selected-images").html("");
					Lungo.dom("#add-moment > header > h1.title").text("Edit Moment");
					Lungo.dom("#moment-form-post-button").text("Edit");
					Lungo.dom("#moment-form-title").val(m.title);
					Lungo.dom("#moment-form-desc").val(m.text);
					Lungo.dom("#moment-form-date").val(momentjs(m.date).format("YYYY-MM-DD"));
					Lungo.dom("#moment-form-time").val(momentjs(m.date).format("HH:mm:ss"));
					Lungo.dom("#moment-form-location").val(m.location);
					Lungo.dom("#moment-form-reminder-frequency").text(m.reminder);
					Lungo.dom("#moment-form-reminder-end").text(m.reminder_end);
					Lungo.dom("#moment-form-moment-id").val(moment_id);
					var _q_img = "SELECT `i`.* \
						FROM `image` `i` \
						JOIN `moment_image` `mi` ON `i`.`id` = `mi`.`image_id` \
						JOIN `moment` `m` ON `mi`.`moment_id` = `m`.`id` \
						WHERE `m`.`moment_id` = ?";
					//console.log(_q_img);
					_this.db.transaction(function(transaction){transaction.executeSql(_q_img, [moment_id],
						function(transaction, results) {
							console.log(moment_id);
							if (results.rows != undefined && results.rows.length) {
								Lungo.dom("#add-moment-selected-images").html("");
								for (var i = 0; i < results.rows.length; i++) {
									var mimg = results.rows.item(i);
									//var chosen_image = "<img style=\"display:inline-block;width:70px;height:70px;border:1px solid #ddd;\" src=\"" + mimg.data64 + "\" />";
									var chosen_image = document.createElement("img");
									Lungo.dom(chosen_image).attr("style", "display:inline-block;width:70px;height:70px;border:1px solid #ddd;");
									Lungo.dom(chosen_image).attr("src", App.config.local_prefix + mimg.name);
									if (i == 0) {
										var collection_image = chosen_image.cloneNode(true);
										Lungo.dom(collection_image).tap(function() {
											Lungo.Router.section("add-moment-photos");
										});
										Lungo.dom("#add-moment-image-collection").append(collection_image);
									}
									Lungo.dom(chosen_image).tap(function(e) {
										var _this = this;
										Lungo.Notification.confirm({
											icon: null,
											title: 'Are you sure you want to remove this photo?',
											description: '',
											accept: {
												icon: 'checkmark',
												label: 'Accept',
												callback: function(){ Lungo.dom(_this).hide(); }
											},
											cancel: {
												icon: 'close',
												label: 'Cancel',
												callback: function(){ alert("No!"); }
											}
										});
									});

									Lungo.dom("#add-moment-selected-images").append(Lungo.dom(chosen_image));
									Lungo.dom(".selectedphotos").show();
								}
								Lungo.dom("#add-moment-image-collection").append("<span class=\"tag count\">" + Lungo.dom("#add-moment-selected-images").children().length + "</span>");
							}
						}, App.database.errorHandler);
					});
					// Get collaborators.
					var _q_col = "SELECT `u`.* \
						FROM `user` `u` \
						JOIN `moment_user` `mu` ON `u`.`user_id` = `mu`.`user_id` \
						WHERE `mu`.`moment_id` = ?";
					console.log(_q_col);
					var sel_col = "";
					_this.db.transaction(function(transaction){transaction.executeSql(_q_col, [moment_id],
						function(transaction, results) {
							console.log(moment_id);
							if (results.rows != undefined && results.rows.length) {
								Lungo.dom("#add-moment-invite").html("");
								for (var i = 0; i < results.rows.length; i++) {
									var mcol = results.rows.item(i);
									sel_col += mcol.first_name + " " + mcol.last_name + ", ";
								}
								Lungo.dom("#add-moment-invite").text(sel_col.substr(0, sel_col.length - 2));
							} else {
								Lungo.dom("#add-moment-invite").text("Invite Collaborators");
							}
						}, App.database.errorHandler);
					});
					//Lungo.dom("#add-moment-invite").text("Invite Collaborators");
					// jQuery? Why not..?
					//$("#moment-form-upload-files").replaceWith($("#moment-form-upload-files").clone());
					Lungo.Router.section("add-moment");
				}
			}, App.database.errorHandler);
		});
	},


	getMoment: function(moment_id, ref) {
		console.log("Running DB getMoment for moment_id: " + moment_id);
		var _query = "SELECT `moment`.*, \
				`user`.`user_id` AS `user_id`, `user`.`first_name`, `user`.`last_name`, \
				`user`.`email`, `user`.`city`, `user`.`state`, `user`.`user_image` \
			FROM `moment` \
			JOIN `user` ON `user`.`user_id` = `moment`.`user` \
			WHERE `moment`.`moment_id` = ? \
			LIMIT 1 ";
		//console.log(_query);
		// Find moments
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(_query, [moment_id], 
					function(transaction, results) {
						// Loop through moments.
						if (results.rows != undefined && results.rows.length) {
							var returnobj = {
								count: results.rows.length,
								moments: []
							}
							for (var i=0; i < results.rows.length; i++) {
								var m = results.rows.item(i);
								var moment = new App.moment();
								moment.domnode = ref.domnode;
								moment.details.moment_id = m.id;
								moment.details.api_id = m.moment_id;
								moment.details.user = m.user_id;
								moment.details.title = m.title;
								moment.details.text = m.text;
								moment.details.location = m.location;
								moment.details.date = m.date;
								moment.details.creator = {};
								moment.details.creator.id = m.user_id;
								moment.details.creator.first_name = m.first_name;
								moment.details.creator.last_name = m.last_name;
								moment.details.creator.email = m.email;
								moment.details.creator.city = m.city;
								moment.details.creator.state = m.state;
								moment.details.creator.user_image = m.user_image;
								moment.showMoment("append");
								if (Lungo.Router.history != "moments") {
									Lungo.Router.section("moments");
								}
							}
						}
					},
					App.database.errorHandler
				);
			}
		);
	},

	// countMoments: function(owner) {
	// 	var param = [owner];
	// 	var query = "SELECT COUNT(*) FROM `moment` WHERE `owner` = ?";
	// 	this.db.transaction(
	// 		function(transaction) {
	// 			transaction.executeSql(query, param, App.database.logMoment, App.database.errorHandler);
	// 		}
	// 	);
	// },

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

	handleInsertedMoment: function(transaction, results) {
		console.log("MomentID: " + results.insertId);
		rediscovr.currentmoment.moment_id = results.insertId;
		
		// if (rediscovr.currentmoment.images.length) {
		// 	for (var i = 0; i < rediscovr.currentmoment.images.length; i++) {
		// 		var data_array = {
		// 			name: rediscovr.currentmoment.images[i],
		// 			type: 'moment',
		// 			owner: 'self'
		// 		}
		// 		App.database.addImage(data_array);
		// 	}
		// }
		Lungo.Notification.show(
			"check",                //Icon
			"Success",              //Title
			3,                      //Seconds
			function() {
				m = new App.moments();
				m.refreshMoments();       //Callback function
			}
		);
	},

	handleInsertedUser: function(transaction, results) {
		// Do something.
	},

	handleInsertedImage: function(transaction, results) {
		console.log("ImageID: " + results.insertId);
		var image_id = results.insertId;
		console.log(rediscovr.currentmoment.moment_id + ', ' + image_id);
		
		var data_array = {
			moment_id: rediscovr.currentmoment.moment_id,
			image_id: image_id,
			primary: 1
		};
		App.database.associateImage(data_array);
	},

	handleCachedImage: function(transaction, results) {
		console.log("ImageID: " + results.insertId);
		var image_id = results.insertId;
		console.log(this.tmp_moment_id + ', ' + image_id);
		
		var data_array = {
			moment_id: this.tmp_moment_id,
			image_id: image_id,
			primary: 1
		};
		App.database.associateImage(data_array);
		delete this.tmp_moment_id;
	},

	handleAssociatedImage: function(transaction, results) {
		console.log("MomentImageID: " + results.insertId);
	},

	destroyDB: function(reason, ref) {
		var command;
		switch (reason) {
			case "version":
			case "logout":
				command = "DROP TABLE";
				break;
			//case "logout":
			default:
				command = "DELETE FROM";
				break;
		}
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(command + " `user`", [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(command + " `image`", [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(command + " `moment`", [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(command + " `moment_image`", [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(command + " `moment_user`", [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(command + " `moment_sync`", [], App.database.nullDataHandler, App.database.errorHandler);
			}
		);
		if (reason != undefined && reason == 'logout') {
			window.setTimeout(function() {
				Lungo.Notification.show(
					"check",                //Icon
					"Success",              //Title
					3,                      //Seconds
					function() {
						window.location.reload();
					}
				);
			}, 1000);
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

	// When passed as the error handler, this silently causes a transaction to fail.
	killTransaction: function(transaction, error) {
		return true;
	}
}
