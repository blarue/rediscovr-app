App.api = function() {
	
	var config = {
		url: "http://api.etched.io/api/",
		token: "1234567890",
		controller: "",
		action: "",
		method: "POST",
		callback: ""
	}

	return {
		loginUser: function(ref) {
			console.log("Running loginUser");
			if (ref.validateLogin() === true) {
				console.log("Validates. " + config.url + "login" + $$.serializeParameters(ref.details, "?"));
				$$.get(config.url + "login", ref.details, function(data) {
					ref.handleLogin(data);
				}, "json");
			} else {
				console.log("User doesn't validate.");
			}
		},

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

		getMoments: function(ref) {
			console.log("Running getMoments");
			console.log(config.url + "moment" + $$.serializeParameters(ref.details, "?"));
			$$.get(config.url + "moment", ref.details, function(data) {
				ref.handleGet(data);
			}, "json");
		},

		getCollaborators: function(ref) {
			console.log("Running getCollaborators");
			console.log(config.url + "collaborator" + $$.serializeParameters(ref.details, "?"));
			$$.get(config.url + "collaborator", ref.details, function(data) {
				ref.handleGetCollaborators(data);
			}, "json");	
		}
	}
}
