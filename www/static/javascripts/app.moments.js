App.moments = function() {

	return {
		details: {
			user: null,
			since: null
		},

		errors: [],

		getMoments: function() {
			this.gatherDetails();
			var api = new App.api();
			api.getMoments(this);
		},

		handleGet: function(data) {
			console.log(data);
			if (data.server_time != undefined) {
				App.current_user.details.last_sync = data.server_time;
			}
			if (data.count != undefined && (data.count + 0) > 0) {
				if (data.moments != undefined && data.moments.length == (data.count + 0)) {
					console.log("API: Returned " + data.count + " moments.");
					for (var i = 0; i < data.count; i++) {
						console.log(data.moments[i].title);
					}
				}
				
			}
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				user: App.current_user.details.user_id,
				since: App.current_user.details.last_sync
			}
		}
	}
}
