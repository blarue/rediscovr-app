App.group = function() {
	return {
		details: {
			id: null,
			user_id: null,
			name: null,
			collaborators: null
		},

		errors: [],

		addGroup: function() {
			this.gatherDetails();
			var api = new App.api();
			api.addGroup(this);
		},

		updateGroup: function() {
			this.gatherUpdateDetails();
			var api = new App.api();
			api.updateGroup(this);
		},

		handleAddGroup: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			if (data.group != undefined && data.group != null) {
				this.details.id = data.group.id;
				//App.database.addGroup(this.details);
					// Do something to show user added.
				 Lungo.Router.section("groups");
			}
		},

		handleUpdateGroup: function(data) {
			console.log(data);
			console.log("API: " + data.message);
			Lungo.Notification.success('Success', 'Your group was updatted successfully!', 'ok', 2);
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				user_id: App.current_user.details.user,
				name: Lungo.dom('#add-new-group-input').val(),
				collaborators: null
			};
		},

		gatherSettingsDetails: function() {
			// Pull values from form to update the details object.
			this.details.id = App.current_user.details.id,
			this.details.user_id = App.current_user.details.user_id,
			this.details.name = Lungo.dom('#add-new-group-input').val(),
			this.details.collaborators = null;
			// this.details.newPassword = Lungo.dom("#settings-new-password1").val();
			// this.details.newPassword2 = Lungo.dom("#settings-new-password2").val();
			// this.details.firstName = Lungo.dom("#settings-firstname").val();
			// this.details.lastName = Lungo.dom("#settings-lastname").val();
			// this.details.city = Lungo.dom("#settings-city").val();
			// this.details.state = Lungo.dom("#settings-state").val();
			// this.details.country = Lungo.dom("#settings-country").val();
			// this.details.phone = Lungo.dom("#settings-phonenumber").val();
			// this.details.push_notify = ((Lungo.dom("#settings-push").get(0).checked) ? "1" : "0");
			// this.details.email_notify = ((Lungo.dom("#settings-email-share").get(0).checked) ? "1" : "0");
			// this.details.newsletter = ((Lungo.dom("#settings-newsletter").get(0).checked) ? "1" : "0");
		},

		validate: function(neworupdate) {
			// if (neworupdate == null) {
				// neworupdate = "new";
			// }
			// console.log("Validating.")
			// if (this.details.user_id == null) {
				// this.errors.push("You should have a user_id.");
			// }
			// if (this.details.email == null) {
				// this.errors.push("You should have an email.");
			// }
			// if (neworupdate == "new") {
				// if (this.details.password == null) {
					// this.errors.push("You should have a password.");
				// }
			// }
			// if (neworupdate == "update") {
				// if (this.details.oldPassword == null || this.details.newPassword != null || this.details.newPassword2 == null) {
					// if (this.details.oldPassword == null || this.details.oldPassword.length) {
						// this.errors.push("You must provide your old password.");
					// }
					// if (this.details.newPassword2 == null || this.details.newPassword2.length) {
						// this.errors.push("You must verify your password.");
					// }
					// if (this.details.newPassword != null && this.details.newPassword2 == null) {
						// if (this.details.newPassword != this.details.newPassword2) {
							// this.errors.push("Both new password values must match.");
						// }
					// }
				// }
			// }
			// if (this.details.firstName == null) {
				// this.errors.push("You should have a firstName.");
			// }
			// if (this.details.lastName == null) {
				// this.errors.push("You should have a lastName.");
			// }
			// if (this.details.city == null) {
				// this.errors.push("You should have a city.");
			// }
			// if (this.details.state == null) {
				// this.errors.push("You should have a state.");
			// }
			// if (this.details.country == null) {
				// this.errors.push("You should have a country.");
			// }
			// if (this.details.phone == null) {
				// this.errors.push("You should have a phone.");
			// }
			// if (this.details.image_url == null) {
				// this.errors.push("You should have a image_url.");
			// }
			// if (this.errors.length) {
				// console.log("Problem(s) encountered validating user data.");
				// for (var i = 0; i < this.errors.length; i++) {
					// console.log(this.errors[i]);
				// }
				// return false;
			// } else {
				// return true;
			// }
			return true;
		}
    }
}

