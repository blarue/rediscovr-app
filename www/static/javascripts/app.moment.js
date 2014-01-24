App.moment = function() {
	var dbmoment = {};
	return {
		details: {
			moment_id: null,
			user: null,
			title: null,
			text: null,
			location: null,
			date: null,
			images: []
		},

		errors: [],

		addMoment: function() {
			this.gatherDetails();
			var api = new App.api();
			api.addMoment(this);
		},

		cacheMoment: function() {
			var _this = this;

			// Start DB.
			var DB = new App.db();
			DB.open();

			// Add creator as user to local DB.
			//console.log("Attempting to add creator.");
			var c = _this.dbmoment.creator;
			//console.log(JSON.stringify(_this.dbmoment.creator));
			var c_data_array = [c.id, c.email, c.first_name, c.last_name, c.city, c.state, c.country, c.user_image, c.current_user];
			var c_query = "INSERT OR IGNORE INTO `user` \
						(`id`, `email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(c_query, c_data_array, 
						function(transaction, results) {console.log(results);}, 
						function(transaction, results) {console.log(results);}
					);
				}
			);

			// Add moment to local DB.
			//console.log("Attempting to add moment.");
			var m = _this.dbmoment;
			//console.log(JSON.stringify(_this.dbmoment));
			var m_data_array = [m.id, m.title, m.text, m.date, m.creator.id, m.location];
			var m_query = "INSERT OR IGNORE INTO `moment` \
						(`id`, `title`, `text`, `date`, `user`, `location`) \
						VALUES (?, ?, ?, ?, ?, ?);";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(m_query, m_data_array, 
						function(transaction, results) {console.log(results);}, 
						function(transaction, results) {console.log(results);}
					);
				}
			);

			// Add collaborators as user to local DB.
			//console.log("Attempting to collaborators to moment.");
			if (_this.dbmoment.collaborators != undefined && _this.dbmoment.collaborators.length) {
				for (var j = 0; j < _this.dbmoment.collaborators.length; j++) {
					var cc = _this.dbmoment.collaborators[j];
					var cc_data_array = [cc.id, cc.email, cc.first_name, cc.last_name, cc.city, cc.state, cc.country, cc.user_image, cc.current_user];
					var cc_query = "INSERT OR IGNORE INTO `user` \
						(`id`, `email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
					DB.db.transaction(
						function(transaction) {
							transaction.executeSql(cc_query, cc_data_array, 
								function(transaction, results) {
									console.log(results);
									var mu_data_array = [_this.dbmoment.id, cc.id];
									var mu_query = "INSERT OR IGNORE INTO `moment_user` \
										(`user_id`, `moment_id`) \
										VALUES (?, ?);";
									DB.db.transaction(
										function(transaction) {
											transaction.executeSql(mu_query, mu_data_array, 
												function(transaction, results) {
													console.log(results);
												}, 
												function(transaction, results) {console.log(results);}
											);
										}
									);
								}, 
								function(transaction, results) {console.log(results);}
							);
						}
					);
				}
			}

			// Add images to local DB.
			//console.log("Attempting to images to moment.");
			if (_this.dbmoment.images != undefined && _this.dbmoment.images.length) {
				for (var j = 0; j < _this.dbmoment.images.length; j++) {
					//console.log(JSON.stringify(_this.dbmoment.images[j]));
					var image = _this.dbmoment.images[j];
					var i_data_array = [image, 'moment', _this.dbmoment.creator.id];
					var i_query = "INSERT OR IGNORE INTO `image` (`name`, `type`, `owner`) VALUES (?, ?, ?);";
					DB.db.transaction(
						function(transaction) {
							transaction.executeSql(i_query, i_data_array, 
								function(transaction, results) {
									//console.log(results);
									//console.log("ImageID: " + results.insertId);
									//console.log("MomentID: " + _this.dbmoment.id);
									var im_data_array = [_this.dbmoment.id, results.insertId, 1];
									var im_query = "INSERT OR IGNORE INTO `moment_image` (`moment_id`, `image_id`, `primary`) VALUES (?, ?, ?);";
									DB.db.transaction(
										function(transaction) {
											transaction.executeSql(im_query, im_data_array, 
												function(transaction, results) {console.log(results);}, 
												function(transaction, results) {console.log(results);}
											);
										}
									);
								}, function(transaction, results) {console.log(results);}
							);
						}
					);
				}
			}
		},

		handleAdd: function(data) {
			console.log("API: " + data.message);
			if (data.moment_id != undefined && data.moment_id != null) {
				this.details.moment_id = data.moment_id;
				// Do something to show moment added.
				this.post();
			}
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details.user = App.current_user.details.user_id,
			this.details.title = rediscovr.currentmoment.moment_title = Lungo.dom("#moment-form-title").val();
			this.details.text = rediscovr.currentmoment.moment_desc = Lungo.dom("#moment-form-desc").val();
			this.details.location = rediscovr.currentmoment.moment_location = Lungo.dom("#moment-form-location").val();
			this.details.date = rediscovr.currentmoment.date_happened = Lungo.dom("#moment-form-date").val();
			this.details.time = rediscovr.currentmoment.time_happened = Lungo.dom("#moment-form-time").val();
			this.details.reminder_frequency = rediscovr.currentmoment.reminder_frequency = Lungo.dom("#moment-form-reminder-frequency").text();
			this.details.reminder_end = rediscovr.currentmoment.reminder_end = Lungo.dom("#moment-form-reminder-end").text();
			this.details.images = rediscovr.currentmoment.images;
		},

		post: function() {
			var post_data = {
				user: this.details.user,
				title: this.details.title,
				text: this.details.text,
				user: App.current_user.details.user_id,
				date: this.details.date + " " + this.details.time,
				location: this.details.location,
				reminder_frequency: this.details.reminder_frequency,
				reminder_end: this.details.reminder_end,
				images: this.details.images,
				collaborators: this.details.collaborators
			};
			App.database.addMoment(post_data);
		},


		validate: function() {
			if (this.details.user == null) {
				this.errors.push("User missing.");
			}
			if (this.details.title == null) {
				this.errors.push("Title missing.");
			}
			if (this.details.text == null) {
				this.errors.push("Description (text) missing.");
			}
			if (this.details.location == null) {
				this.errors.push("Location missing.");
			}
			if (this.details.date == null) {
				this.errors.push("Date missing.");
			}
			if (!this.details.images.length) {
				this.errors.push("Images empty.");
			}

			if (this.errors.length) {
				console.log("Problem(s) encountered validating user data.");
				for (var i = 0; i < this.errors.length; i++) {
					console.log(this.errors[i]);
				}
				return false;
			} else {
				return true;
			}
		}
	}
}
