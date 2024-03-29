App.user = function() {
	return {
		details: {
			user_id: null,
			logged_in: null,
			email: null,
			password: null,
			first_name: null,
            last_name: null,
			city: null,
			state: null,
			country: null,
			phone: null,
			image_url: null
		},

		errors: [],
		
		loginUser: function() {
			this.gatherLoginDetails();
			var api = new App.api();
			api.loginUser(this);
		},

		addCollaborator: function() {
			// You were here.
			var DB = new App.db();
			DB.open();
			var p = [this.details.email, this.details.first_name, this.details.last_name, this.details.phone];
			var q = "INSERT OR IGNORE INTO `user` (`email`, `first_name`, `last_name`, `phone`) VALUES (?, ?, ?, ?)";
			DB.db.transaction(
				function(transaction) {
					transaction.executeSql(q, p, 
						function(transaction, results) {
							if (results.insertId !== undefined) {
								console.log("Collaborator: " + results.insertId);
							}
						}, 
						function(transaction, results) {
							//console.log(results);
						}
					);
				}
			);
		},

		handleLogin: function(data) {
			//console.log(data);
			//console.log("API: " + data.message);
			if (data.id != undefined && data.id != null) {
				this.details.current_user = App.current_user.details.current_user = 1;
				this.details.id = App.current_user.details.user_id = data.id;
				this.details.email = App.current_user.details.email = data.email;
				this.details.first_name = App.current_user.details.first_name = data.first_name;
				this.details.last_name = App.current_user.details.last_name = data.last_name;
				this.details.city = App.current_user.details.city = data.city;
				this.details.state = App.current_user.details.state = data.state;
				this.details.country = App.current_user.details.country = data.country;
				this.details.phone = App.current_user.details.phone = data.phone;
				this.details.user_image = App.current_user.details.user_image = data.user_image;

				App.database.addUser(this.details);
				// Do something to show user added.
				Lungo.Notification.success('Success', 'Your login was a great success!', 'ok', 2, function() {
					Lungo.Notification.hide();
					Lungo.Router.section("moments");
				});
			} else if (data.Error != undefined) {
				Lungo.Notification.error('Error', data.Error, 'remove', 3);
			} else {
				Lungo.Notification.error('Error', data, 'remove', 3);
			}
		},

		getLoggedInUser: function() {
			console.log("Checking DB for user.");
			// Check the local DB for a logged in user. Result handled by handleGetUserDB below.
			
			App.database.getCurrentUser(this);
		},

		handleGetUserDB: function(transaction, results) {
			var data = results.rows.item(0);
			console.log(data);
			if (data.id !== undefined && data.id !== null) {
				console.log(App.current_user);
				App.current_user.details.current_user = 1;
				App.current_user.details.user_id = data.user_id;
				App.current_user.details.email = data.email;
				App.current_user.details.first_name = data.first_name;
				App.current_user.details.last_name = data.last_name;
				App.current_user.details.city = data.city;
				App.current_user.details.state = data.state;
				App.current_user.details.country = data.country;
				App.current_user.details.phone = data.phone;
				App.current_user.details.user_image = data.user_image;
				console.log("App.current_user.details.user_id:" + App.current_user.details.user_id);
				// Get moments?
				var DB = new App.db();
				DB.open();
				DB.db.transaction(
					function(transaction) {
						transaction.executeSql("SELECT MAX(`servertime`) AS `last_sync` FROM `moment_sync`;", [], 
							function(transaction, results) {
								console.log(results);
								console.log(results.rows.item(0));
								App.current_user.details.last_sync = results.rows.item(0).last_sync	;
								Lungo.Router.section("moments");
							},
							function(transaction, results) {
								console.log(results);
							}
						);
					}
				);

			}
		},

		gatherLoginDetails: function() {
			this.details = {
				email: Lungo.dom("#login-email").val(),
				password: Lungo.dom("#login-password").val()
			};
		},

		validateLogin: function() {
			console.log("Validating.");
			if (this.details.email === null) {
				this.errors.push("You should have an email.");
			}
			if (this.details.password === null) {
				this.errors.push("You should have a password.");
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
		},

		logout: function() {
			App.database.destroyDB('logout');
		},

		addUser: function() {
			this.gatherDetails();
			var api = new App.api();
			api.addUser(this);
		},

		updateUser: function() {
			this.gatherSettingsDetails();
			var api = new App.api();
			api.updateUser(this);
		},

		handleAdd: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			if (data.user_id !== undefined && data.user_id !== null) {
				this.details.user_id = data.user_id;
				this.details.current_user = 1;
				App.database.addUser(this.details);
					// Do something to show user added.
				Lungo.Router.section("walkthrough-share");
			}
		},

		handleUpdateUser: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			Lungo.Notification.success('Success', 'Your login was a great success!', 'ok', 2);
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				email: Lungo.dom("#signup-emailadd").val(),
				password: Lungo.dom("#signup-password").val(),
                first_name: Lungo.dom("#signup-first_name").val(),
                last_name: Lungo.dom("#signup-last_name").val(),
				city: Lungo.dom("#signup-city").val(),
				state: Lungo.dom("#signup-state").val(),
				country: Lungo.dom("#signup-country").val(),
				phone: Lungo.dom("#signup-phone").val(),
				image_url: "http://tinyurl.com/dfshdk"
			};
		},

		gatherSettingsDetails: function() {
			// Pull values from form to update the details object.
			this.details.user = this.details.user_id;
			this.details.email = Lungo.dom("#settings-email").val();
			this.details.oldPassword = Lungo.dom("#settings-current-password").val();
			this.details.newPassword = Lungo.dom("#settings-new-password1").val();
			this.details.newPassword2 = Lungo.dom("#settings-new-password2").val();
			this.details.first_name = Lungo.dom("#settings-first_name").val();
			this.details.last_name = Lungo.dom("#settings-last_name").val();
			this.details.city = Lungo.dom("#settings-city").val();
			this.details.state = Lungo.dom("#settings-state").val();
			this.details.country = Lungo.dom("#settings-country").val();
			this.details.phone = Lungo.dom("#settings-phonenumber").val();
			this.details.push_notify = ((Lungo.dom("#settings-push").get(0).checked) ? "1" : "0");
			this.details.email_notify = ((Lungo.dom("#settings-email-share").get(0).checked) ? "1" : "0");
			this.details.newsletter = ((Lungo.dom("#settings-newsletter").get(0).checked) ? "1" : "0");
		},

		validate: function(neworupdate) {
			if (neworupdate == null) {
				neworupdate = "new";
			}
			console.log("Validating.")
			// if (this.details.user_id == null) {
			// 	this.errors.push("You should have a user_id.");
			// }
			if (this.details.email == null) {
				this.errors.push("You should have an email.");
			}
			if (neworupdate == "new") {
				if (this.details.password == null) {
					this.errors.push("You should have a password.");
				}
			}
			if (neworupdate == "update") {
				if (this.details.oldPassword == null || this.details.newPassword != null || this.details.newPassword2 == null) {
					if (this.details.oldPassword == null || this.details.oldPassword.length) {
						this.errors.push("You must provide your old password.");
					}
					if (this.details.newPassword2 == null || this.details.newPassword2.length) {
						this.errors.push("You must verify your password.");
					}
					if (this.details.newPassword != null && this.details.newPassword2 == null) {
						if (this.details.newPassword != this.details.newPassword2) {
							this.errors.push("Both new password values must match.");
						}
					}
				}
			}
			if (this.details.first_name == null) {
				this.errors.push("You should have a first name.");
			}
			if (this.details.last_name == null) {
				this.errors.push("You should have a last name.");
			}
			if (this.details.city == null) {
				this.errors.push("You should have a city.");
			}
			if (this.details.state == null) {
				this.errors.push("You should have a state.");
			}
			if (this.details.country == null) {
				this.errors.push("You should have a country.");
			}
			// if (this.details.phone == null) {
			// 	this.errors.push("You should have a phone.");
			// }
			// if (this.details.image_url == null) {
			// 	this.errors.push("You should have a image_url.");
			// }
			if (this.errors.length) {
				console.log("Problem(s) encountered validating user data.");
				for (var i = 0; i < this.errors.length; i++) {
					console.log(this.errors[i]);
				}
				return false;
			} else {
				return true;
			}
		},

		getCollaborators: function() {
			this.details = {
				user: App.current_user.details.user_id
			};
			var api = new App.api();
			api.getCollaborators(this);
		},

		handleGetCollaborators: function(data) {
			var _this = this;
			console.log(data);
			console.log("API: " + data.message);
			if (data.collaborators !== undefined && data.collaborators !== null) {
				var c = data.collaborators;
				Lungo.dom("#people-article-ul").html("");
				for (var i = 0; i < c.length; i++) {
					if (c[i].first_name !== '' || c[i].first_name !== '') {
						var person_id = c[i].id;
						var person_image = App.config.image_prefix + c[i].user_image;
						var person_name = c[i].first_name + " " + c[i].last_name;
						var person_location = c[i].city + ", " + c[i].ctate;
						var person_collaborations = c[i].collaborations;

						var new_li = document.createElement("li");
						Lungo.dom(new_li).attr("id", "person-" + person_id);
						Lungo.dom(new_li).addClass("arrow");
						Lungo.dom(new_li).addClass("people-list-item");
						var new_li_html = "" + 
							"<div class=\"user-avatar avatar-medium avatar-shadow\">" + 
								"<img src=\"" + person_image + "\"/>" + 
							"</div>" + 
							"<div>" + 
								"<strong class=\"text bold people-name\">" + person_name + "</strong>" + 
								"<span class=\"text tiny people-location\">" + person_location + "</span>" + 
								"<br/>" + 
								"<div class=\"num-collaborations\">" + 
									"<span class=\"num\">" + person_collaborations + "</span>" + 
									"<span> collaborations</span>" + 
								"</div>" + 
							"</div>";
						Lungo.dom(new_li).html(new_li_html);
						Lungo.dom(new_li).tap(function(e) {
							_this.getOneCollaborator(Lungo.dom(this).attr("id"));
						});
						Lungo.dom("#people-article-ul").append(new_li);
					}
				}
				
				// Do something to show user added.
				Lungo.Router.section("people");
			}
		},

		getOneCollaborator: function(person_id) {
			//console.log(person_id);
			var sel = "#" + person_id;
			var id = person_id.split("-")[1];
			Lungo.dom("#person-moments-container").html("");
			//console.log(Lungo.dom(sel + " > div > img").attr("src"));
			Lungo.dom("#person-user-image").attr("src", Lungo.dom(sel + " > div > img").attr("src"));
			//console.log(Lungo.dom(sel + " .people-name").text());
			Lungo.dom("#person-username").text(Lungo.dom(sel + " .people-name").text());
			//console.log(Lungo.dom(sel + " .people-location").text());
			Lungo.dom("#person-location").text(Lungo.dom(sel + " .people-location").text());
			//console.log(Lungo.dom(sel + " .num").text());
			Lungo.dom("#person-collaborations-num").text(Lungo.dom(sel + " .num").text());
			var u = new App.user();
			u.getUserMoments(id);
			Lungo.Router.section("person");
		},

		getUserMoments: function(user_id) {
			var m = new App.moments();
			m.getCollaboratorsMoments(user_id, "#person-moments-container");
		},

        //get groups
        getGroups: function() {
            this.details = {
                user: App.current_user.details.user_id
            };

            Lungo.dom("#groups-article-ul").html("<li>\
				<div class=\"groupdiv\">\
					<span id=\"add-new-group-img\"  class=\"user-avatar icon plus addnew on-left tag\"></span>\
					<input id=\"add-new-group-input\" type=\"text\" placeholder=\"Add New Group\" class=\"addnew\">\
					<span id=\"add-new-group-btn\" class=\"user-avatar icon ok-sign addnew on-right\" style=\"display:none; float: right;\"></span>\
				</div>\
            </li>");

            var api = new App.api();
            api.getGroups(this);
        },

        handleGetGroups: function(data) {
            console.log(data);
            console.log("API: " + data.message);

            if (data.groups != undefined && data.groups != null) {
                var c = data.groups;

                for (var i = 0; i < c.length; i++) {
                    var new_li = document.createElement("li");
                    Lungo.dom(new_li).addClass("arrow");
                    //Lungo.dom(new_li).addAttr("data-view-section", "group");
                    Lungo.dom(new_li).data("groupid", this.details.api_id);

                    // Add action for tap.
                    Lungo.dom(new_li).tap(function() {
                        this.details = {
                            user: App.current_user.details.user_id,
                            group: Lungo.dom(this).data("groupid")
                        }
                        var api = new App.api();
                        api.getGroupMembers(this);
                        //Lungo.Router.section("group");
                    });

                    new_li.html("<div class=\"groupdiv\">\
                     <span class=\"text hilite\">" + c[i].name + "</span>\
                    </div>\
                    <div style=\"clear:both;\"></div>");

                    Lungo.dom("#groups-article-ul").append(new_li);
                    delete new_li;
                }
                // this.details.user_id = data.user_id;
                // this.details.current_user = 1;
                // App.database.addUser(this.details);

                // Do something to show user added.
                Lungo.Router.section("groups");
            }
        }
    }
}