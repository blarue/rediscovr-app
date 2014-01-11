App.user = function() {
	return {
		details: {
			user_id: null,
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
				// Do something to show user added.
			}
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {email:"christy.mchugh@thecrack.com",password:"123xyz", firstName:"Chris", lastName:"McHugh", city:"Philadelphia", state:"PA", country:"US", phone:"(610) 223-1886", image_url:"http://tinyurl.com/dfshdk"};

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
		}
	}
}
