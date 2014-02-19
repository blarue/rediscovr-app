App.moments = function() {

	return {
		details: {
			user: null,
			since: null
		},
		domnode: "#moments-article",
		months_domnode: "#moments-months-article",
		years_domnode: "#moments-years-article",
		errors: [],

		getMoments: function(domnode) {
			if (domnode != null) {
				this.domnode = domnode;
			}

			// Find locally cached moments.
			App.database.getMoments(null, 'date DESC', 20, this);

			this.gatherDetails();
			if (!this.details.since) {
				if (App.current_user.details.last_sync) {
					this.details.since = 1300000000;//App.current_user.details.last_sync;
				} else {
					this.details.since = null;
				}
			}
			console.log("last_sync: " + App.current_user.details.last_sync);
			var api = new App.api();
			api.getMoments(this);
		},

		getMomentsMonths: function(domnode) {
			if (domnode != null) {
				this.domnode = domnode;
			} else {
				this.domnode = this.months_domnode;
			}
			Lungo.dom(this.domnode).html("");
			// Find locally cached moments.
			App.database.getMoments(null, 'date DESC', null, this);
		},

		getMomentsYears: function(domnode) {
			if (domnode != null) {
				this.domnode = domnode;
			} else {
				this.domnode = this.years_domnode;
			}
			Lungo.dom(this.domnode).html("");
			// Find locally cached moments.
			App.database.getMoments(null, 'date DESC', 3, this);
		},
        
		handleGet: function(data) {
			if (data.server_time != undefined) {
				App.current_user.details.last_sync = data.server_time;
				var DB = new App.db();
				DB.open();
				var p = [App.current_user.details.last_sync];
				var q = "INSERT INTO `moment_sync` (`servertime`) VALUES (?)";
				DB.executeQuery(q, p);
			}
			if (data.count != undefined && (data.count + 0) > 0) {
				if (data.moments != undefined && data.moments.length == (data.count + 0)) {
					console.log("API: Returned " + data.count + " moments.");
					for (var i = 0; i < data.count; i++) {
						var moment = new App.moment();
						moment.details = data.moments[i];
						moment.cacheMoment();
						moment.showMoment("append");
					}
					Lungo.Router.section("moments");

					// Add Tap on header for moment view.
					Lungo.dom(".moment-item-header").each(function() { 
						Lungo.dom(this).tap(function() { 
							console.log("momentid : " + Lungo.dom(this).data("momentid"));
						});
					});
				}
			} else {
				//Lungo.Router.section("home");
			}
		},

		refreshMoments: function(ref) {
			this.gatherDetails();
			this.details.since = null;
			var api = new App.api();
			api.getMoments(this);			
		},

		gatherDetails: function() {
			// Pull values from form to details object.
			this.details = {
				user: App.current_user.details.user_id,
				since: 0
			}
		}
	}
}
