App.user = function() {
	return {
		details: {
			user_id: null,
			logged_in: null,
			email: null,
			password: null,
			firstName: null,
			lastName: null,
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

		handleLogin: function(data) {
			console.log(data);
			//console.log("API: " + data.message);
			if (data.id != undefined && data.id != null) {
				this.details.current_user = 1;
				this.details.user_id = data.id;
				this.details.email = data.email;
				this.details.firstName = data.first_name;
				this.details.lastName = data.last_name;
				this.details.city = data.city;
				this.details.state = data.state;
				this.details.country = data.country;
				this.details.phone = data.phone;
				this.details.user_image = data.user_image;

				App.database.addUser(this.details);
				// Do something to show user added.
				Lungo.Notification.success('Success', 'Your login was a great success!', 'ok', 2, function() {
					Lungo.Notification.hide();
					Lungo.Router.section("home");
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
			if (data.id != undefined && data.id != null) {
				console.log(App.current_user);
				App.current_user.details.current_user = 1;
				App.current_user.details.user_id = data.id;
				App.current_user.details.email = data.email;
				App.current_user.details.firstName = data.firstName;
				App.current_user.details.lastName = data.lastName;
				App.current_user.details.city = data.city;
				App.current_user.details.state = data.state;
				App.current_user.details.country = data.country;
				App.current_user.details.phone = data.phone;
				App.current_user.details.user_image = data.user_image;
				console.log("App.current_user.details.user_id:" + App.current_user.details.user_id);
				// Get moments?
				this.moments = new App.moments();
				this.moments.getMoments();
			}
		},

		gatherLoginDetails: function() {
			this.details = {
				email: Lungo.dom("#login-email").val(),
				password: Lungo.dom("#login-password").val()
			}
		},

		validateLogin: function() {
			console.log("Validating.")
			if (this.details.email == null) {
				this.errors.push("You should have an email.");
			}
			if (this.details.password == null) {
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

		addUser: function() {
			this.gatherDetails();
			var api = new App.api();
			api.addUser(this);
		},

		handleAdd: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			if (data.user_id != undefined && data.user_id != null) {
				this.details.user_id = data.user_id;
				this.details.current_user = 1;
				App.database.addUser(this.details);
					// Do something to show user added.
				Lungo.Router.section("home");
			}
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				email: Lungo.dom("#signup-emailadd").val(),
				password: Lungo.dom("#signup-password").val(),
				firstName: Lungo.dom("#signup-firstname").val(),
				lastName: Lungo.dom("#signup-lastname").val(),
				city: Lungo.dom("#signup-city").val(),
				state: Lungo.dom("#signup-state").val(),
				country: Lungo.dom("#signup-country").val(),
				phone: Lungo.dom("#signup-phone").val(),
				image_url: "http://tinyurl.com/dfshdk"
			};

		},

		validate: function() {
			console.log("Validating.")
			// if (this.details.user_id == null) {
			// 	this.errors.push("You should have a user_id.");
			// }
			if (this.details.email == null) {
				this.errors.push("You should have an email.");
			}
			if (this.details.password == null) {
				this.errors.push("You should have a password.");
			}
			if (this.details.firstName == null) {
				this.errors.push("You should have a firstName.");
			}
			if (this.details.lastName == null) {
				this.errors.push("You should have a lastName.");
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
			}
			var api = new App.api();
			api.getCollaborators(this);
		},

		handleGetCollaborators: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			if (data.collaborators != undefined && data.collaborators != null) {
				var c = data.collaborators;
				for (var i = 0; i < c.length; i++) {
					var new_li = "<li class=\"arrow\" data-view-section=\"person\">\
						<div class=\"user-avatar avatar-medium avatar-shadow\">\
							<img src=\"" + App.config.image_prefix + c.user_image + "\"/>\
						</div>\
						<div>\
							<strong class=\"text bold\">" + c.first_name + c.last_name + "</strong>\
							<span class=\"text tiny\">" + c.city + c.ctate + "</span>\
							<br/>\
							<div class=\"num-collaborations\">\
								<span class=\"num\">32</span>\
								<span> collaborations</span>\
							</div>\
						</div>\
					</li>";
					Lungo.dom("#people-article-ul").append(new_li);
					delete new_li;
				}
				// this.details.user_id = data.user_id;
				// this.details.current_user = 1;
				// App.database.addUser(this.details);
				
				// Do something to show user added.
				Lungo.Router.section("people");
			}
			
		}
	}
}
