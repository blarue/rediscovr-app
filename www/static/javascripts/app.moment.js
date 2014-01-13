App.moment = function() {

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
				description: this.details.text,
				date: this.details.date,
				time: this.details.time,
				location: this.details.location,
				reminder_frequency: this.details.reminder_frequency,
				reminder_end: this.details.reminder_end,
				images: this.details.images,
				owner: 'self',
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
