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
			}
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				user: "26",
				title: "Snozberries", 
				text: "We are the music makers. We are the dreamers of the dream.", 
				location: "Philadelphia, PA", 
				date: "2013-12-15",
				images: [
					{url_hash: "moment-1389334722529-1aec6640bd58.jpg"},
					{url_hash: "moment-1389329773842-f1c9a64f614e.jpg"}
				]
			}
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
