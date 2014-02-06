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
			alert("Running addMoment from app.moment.js");
			var _this = this;
			// Start DB.
			var DB = new App.db();
			DB.open();

			this.details.creator = App.current_user.details;
			this.details.creator.id = App.current_user.details.user_id;
			this.details.images = [];

			this.gatherDetails();
			var m = this.details;
			var m_data_array = [m.title, m.text, m.date, App.current_user.details.user_id, m.location];
			var m_query = "INSERT OR IGNORE INTO `moment` \
						(`title`, `text`, `date`, `user`, `location`) \
						VALUES (?, ?, ?, ?, ?);";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(m_query, m_data_array, 
						function(transaction, results) {
							_this.details.id = results.insertId;

							if (_this.details.collaborators.length) {
								for (var j = 0; j < _this.details.collaborators.length; j++) {
									var u = new App.user();
									u.details.email = _this.details.collaborators[j].email;
									u.details.first_name = _this.details.collaborators[j].name;
									u.details.first_last = _this.details.collaborators[j].name;
									u.details.phone = '';
									u.addCollaborator(_this.details.id);
								}
							}

							if (rediscovr.currentmoment.image_list.length) {
								var q = "INSERT INTO `moment_image` (`moment_id`, `image_id`) VALUES (?, ?)";
								for (var i = 0; i < rediscovr.currentmoment.image_list.length; i++) {
									console.log("i: " + i);
									var p = [_this.details.id, rediscovr.currentmoment.image_list[i].image_id];
									if (_this.details.images == undefined) {
										_this.details.images = [];	
									}
									console.log("i: " + i);
									_this.details.images.push(rediscovr.currentmoment.image_list[i].d);
									console.log("i: " + i);
									// Keep i set after we enter this function.
									var _i = i;
									DB.db.transaction(
										function(transaction) {
											console.log("_i: " + _i);
											transaction.executeSql(q, p, 
												function(transaction, results) {
													console.log("_i: " + _i);
													if (_i == rediscovr.currentmoment.image_list.length - 1) {
														var api = new App.api();
														api.addMoment(_this);
														_this.showMoment("prepend");
													}
												},
												function(transaction, results) {
													console.log(results);
												}
											);
										}
									);
								}
							} else {
								var api = new App.api();
								api.addMoment(_this);
								_this.showMoment("prepend");
							}
						}, 
						function(transaction, results) {
							//console.log(results);
						}
					);
				}
			);
		},

		showMoment: function(placement) {
			if (placement == null) {
				placement = "append";
			}
			console.log("Running showMoment.");
			var _this = this;
			// Start DB.
			var DB = new App.db();
			DB.open();
			var p = [this.details.moment_id];
			var q = "SELECT * FROM `moment_image` JOIN `image` ON `image`.`id` = `moment_image`.`image_id` WHERE `moment_id` = ?";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(q, p, 
						function(transaction, results) {
							if (results.rows != undefined && results.rows.length) {
								for (var j=0; j < results.rows.length; j++) {
									//console.log(_this);
									_this.details.images.push(results.rows.item(j).data64);
								}
								return _this.renderMoment(placement);
							} else {
								return _this.renderMoment(placement);
							}
						},
						App.database.errorHandler
					);
				}
			);
		},

		renderMoment: function(placement) {
			// Need to add this to moment. Work in progress.
			// Lungo.dom(".moment-header").each(function() { this.addEventListener("click", function(event) {if (Lungo.dom(event.target)) { alert(Lungo.dom(event.target)); } else { alert("Didn't work."); } }) });

			console.log("Running renderMoment.");
			//console.log(JSON.stringify(this.details));
			var _this = this;
			var imgdiv_class = "";
			if (this.details.images != undefined) {
				switch (this.details.images.length) {
					case 1:
						imgdiv_class = "one-image";
						break;
					case 2:
						imgdiv_class = "one-half";
						break;
					case 3:
						imgdiv_class = "one-third";
						break;
					case 4:
					default:
						imgdiv_class = "one-fourth";
						break;
				}
			}

			// Build out moment.
			var moment_item = document.createElement("div");
			Lungo.dom(moment_item).addClass("moment-item");
			var moment_header = document.createElement("div");
			Lungo.dom(moment_header).addClass("moment-item-header");
			Lungo.dom(moment_header).data("momentid", this.details.api_id);

			// Add action for tap.
			Lungo.dom(moment_header).tap(function() {
				var chosen_moment = new App.moment();
				chosen_moment.domnode = "#one-moment-article-container";
				Lungo.dom(chosen_moment.domnode).html("");
				App.database.getMoment(Lungo.dom(this).data("momentid"), chosen_moment);
				Lungo.Router.section("one-moment");
			});

			var moment_header_html = "<div class=\"user-avatar avatar-small\">\
						<img src=\"" + App.config.image_prefix + this.details.creator.user_image + "\"/>\
					</div>\
					<div class=\"moment-header\">\
						<span class=\"moment-title\">" + this.details.title + "</span>\
						<span class=\"moment-location\">" + this.details.location + "</span>\
					</div>\
					<div class=\"clearfix\">&nbsp;</div>";
			Lungo.dom(moment_header).html(moment_header_html);
			Lungo.dom(moment_item).append(moment_header);

			// Add images to moment.
			for (var img = 0; img < this.details.images.length; img++) {
				var img_src;
				if (this.details.images[img].substr(0, 4) === "data") {
					img_src = this.details.images[img]
				} else {
					img_src = App.config.image_prefix + this.details.images[img];
				}
				// Create div to hold moment image.
				var moment_imgdiv = document.createElement("div");
				Lungo.dom(moment_imgdiv).addClass("moment-image");
				Lungo.dom(moment_imgdiv).addClass(imgdiv_class);
				// Create anchor to hold image.
				var moment_anchor = document.createElement("a");
				Lungo.dom(moment_anchor).addClass("fancybox");
				//Lungo.dom(moment_anchor).attr("rel", "group");
				Lungo.dom(moment_anchor).attr("href", img_src);
				// Create image.
				var moment_imgimg = document.createElement("img");
				Lungo.dom(moment_imgimg).attr("id", "moment-" + this.details.moment_id);
				Lungo.dom(moment_imgimg).attr("src", img_src);
                Lungo.dom(moment_imgimg).attr("style", "padding:2px;");
				// Add image to anchor.
				Lungo.dom(moment_anchor).append(moment_imgimg);
				// Add anchor to div.
				Lungo.dom(moment_imgdiv).append(moment_anchor);
				// Add div to moment.
				Lungo.dom(moment_item).append(moment_imgdiv);
				delete moment_imgdiv;
				delete moment_anchor;
				delete moment_imgimg;
			}
			delete moment_img;

			// Create desc div.
			var moment_descdiv = document.createElement("div");
			Lungo.dom(moment_descdiv).addClass("moment-description");
			// Create desc text.
			var moment_descspan = document.createElement("span");
			Lungo.dom(moment_descspan).text(this.details.text);
			// Add desc text to div.
			Lungo.dom(moment_descdiv).append(moment_descspan);
			// Add desc div to moment.
			Lungo.dom(moment_item).append(moment_descdiv);
			
			// Process date format. Uses moment.js (no relation)
			var ds = momentjs(this.details.date).format("MMM D, YYYY h:mm A");

			// Create datetime div.
			var moment_datediv = document.createElement("div");
			Lungo.dom(moment_datediv).addClass("moment-datetime");
			// Create datetime text.
			var moment_datespan = document.createElement("span");
			Lungo.dom(moment_datespan).text(ds);
			// Add text to div.
			Lungo.dom(moment_datediv).append(moment_datespan)
			// Add date div to moment item.
			Lungo.dom(moment_item).append(moment_datediv);

			// Set default domnode if not set.
			if (this.domnode == undefined) {
				this.domnode = "#moments-article-container";
			}

			// If we should be on the moments page, go there.
			if (Lungo.Router.history() != "moments" && placement == "prepend") {
				Lungo.Router.section("moments");
			}

			// Prepend or Append
			switch (placement) {
				case "append":
					Lungo.dom(this.domnode).append(moment_item);
					break;
				case "prepend":
					Lungo.dom(this.domnode).prepend(moment_item);
					break;
				case "replace":
					Lungo.dom(this.domnode).html(moment_item);
					break;
			}
            
			$(".fancybox").fancybox({
				fitToView: false,
			    autoSize: false,
			    afterLoad: function () {
			        this.width = 320;
			    }
			});

			delete moment_item;
		},

		cacheMoment: function() {
			var _this = this;
			this.details.moment_id = this.details.id;

			// Start DB.
			var DB = new App.db();
			DB.open();

			// Add creator as user to local DB.
			//console.log("Attempting to add creator.");
			var c = _this.details.creator;
			c.current_user = (c.id == App.current_user.details.user_id) ? 1 : 0;
			var c_data_array = [c.id, c.email, c.first_name, c.last_name, c.city, c.state, c.country, c.user_image, c.current_user];
			var c_query = "INSERT OR IGNORE INTO `user` \
						(`id`, `email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
			console.log(c_data_array + " " + c_query);
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(c_query, c_data_array, 
						function(transaction, results) {
							console.log(results);
						}, 
						function(transaction, errors) {
							console.log(errors);
						}
					);
				}
			);

			// Add moment to local DB.
			//console.log("Attempting to add moment.");
			var m = _this.details;
			//console.log(JSON.stringify(_this.details));
			var m_data_array = [m.moment_id, m.title, m.text, m.date, m.creator.id, m.location];
			var m_query = "INSERT OR IGNORE INTO `moment` \
						(`moment_id`, `title`, `text`, `date`, `user`, `location`) \
						VALUES (?, ?, ?, ?, ?, ?);";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(m_query, m_data_array, 
						function(transaction, results) {
							console.log("Moment Insert ID: " + results.insertId);
							_this.details.id = results.insertId;
						}, 
						function(transaction, errors) {
							console.log(errors);
						}
					);
				}
			);

			// Add collaborators as user to local DB.
			//console.log("Attempting to collaborators to moment.");
			if (_this.details.collaborators != undefined && _this.details.collaborators.length) {
				for (var j = 0; j < _this.details.collaborators.length; j++) {
					var cc = _this.details.collaborators[j];
					var cc_data_array = [cc.id, cc.email, cc.first_name, cc.last_name, cc.city, cc.state, cc.country, cc.user_image, cc.current_user];
					var cc_query = "INSERT OR IGNORE INTO `user` \
						(`id`, `email`, `first_name`, `last_name`, `city`, `state`, `country`, `user_image`, `current_user`) \
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
					DB.db.transaction(
						function(transaction) {
							transaction.executeSql(cc_query, cc_data_array, 
								function(transaction, results) {
									//console.log(results);
									var mu_data_array = [cc.id, _this.details.moment_id];
									var mu_query = "INSERT OR IGNORE INTO `moment_user` \
										(`user_id`, `moment_id`) \
										VALUES (?, ?);";
									DB.db.transaction(
										function(transaction) {
											transaction.executeSql(mu_query, mu_data_array, 
												function(transaction, results) {
													//console.log(results);
												}, 
												function(transaction, results) {
													//console.log(results);
												}
											);
										}
									);
								}, 
								function(transaction, results) {
									//console.log(results);
								}
							);
						}
					);
				}
			}

			// Add images to local DB.
			//console.log("Attempting to images to moment.");
			if (_this.details.images != undefined && _this.details.images.length) {
				for (var j = 0; j < _this.details.images.length; j++) {
					var image = _this.details.images[j];
					console.log(JSON.stringify(image));
					var imgr = new App.image();
					imgr.generateImageBlob(image, 4, function(d) {
						console.log("There should be a blob.");
						//console.log(d);
						var i_data_array = [image, 'moment', _this.details.creator.id, d, 1];
						//console.log(i_data_array);
						var i_query = "INSERT OR IGNORE INTO `image` (`name`, `type`, `owner`, `data64`, `saved`) VALUES (?, ?, ?, ?, ?);";
						DB.db.transaction(
							function(transaction) {
								transaction.executeSql(i_query, i_data_array, 
									function(transaction, results) {
										console.log(results);
										console.log("ImageID: " + results.insertId);
										console.log("MomentID: " + _this.details.id);
										var im_data_array = [_this.details.id, results.insertId, 1];
										var im_query = "INSERT OR IGNORE INTO `moment_image` (`moment_id`, `image_id`, `primary`) VALUES (?, ?, ?);";
										DB.db.transaction(
											function(transaction) {
												transaction.executeSql(im_query, im_data_array, 
													function(transaction, results) {
														console.log(results);
													}, 
													function(transaction, errors) {
														console.log("errors" + errors);
													}
												);
											}
										);
									}, function(transaction, results) {
										//console.log(results);
									}
								);
							}
						);
					});
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

		handleGet: function(data) {

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
			this.details.collaborators = rediscovr.currentmoment.collaborators;
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
			if (this.details.images == undefined || !this.details.images.length) {
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
