App.api = function() {
	
	var config = {
		url: "http://ben.rediscovr.me/api/",
		token: "1234567890",
		controller: "",
		action: "",
		method: "POST",
		callback: ""
	}

	return {
	 	addUser: function(ref) {
	 		console.log("Running addUser");
			if (ref.validate() === true) {
				console.log("Validates. " + config.url + "user  " + JSON.stringify(ref.details));
				$$.post(config.url + "user", JSON.stringify(ref.details), function(data) {
					ref.handleAdd(data);
				}, "json");
			} else {
				console.log("User doesn't validate.");
			}
		},

		addMoment: function(ref) {
			console.log("Running addMoment");
			if (ref.validate() === true) {
				console.log("Validates. " + config.url + "moment  " + JSON.stringify(ref.details));
				$$.post(config.url + "moment", JSON.stringify(ref.details), function(data) {
					ref.handleAdd(data);
				}, "json");
			} else {
				console.log("Moment doesn't validate.");
			}
		},

		getMoments: function() {

		}
	}
}
