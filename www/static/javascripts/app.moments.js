App.moments = function() {

	return {
		details: {
			user: null,
			since: null
		},

		errors: [],

		getMoments: function(ref) {
			this.gatherDetails();
			if (!this.details.since) {
				this.details.since = null;
			}
			var api = new App.api();
			api.getMoments(this);
		},

		refreshMoments: function(ref) {
			this.gatherDetails();
			this.details.since = null;
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
						var imgdiv_class = "";
						switch (data.moments[i].images.length) {
							case 1:
								imgdiv_class = "one-image";
								break;
							case 2:
								imgdiv_class = "one-half";
								break;
							case 3:
								imgdiv_class = "one-third";
								break;
							case 4:
							default:
								imgdiv_class = "one-fourth";
								break;
						}
						var moment_item = "";

						moment_item += "<div class=\"moment-item\">\
											<div class=\"moment-item-header\">\
												<div class=\"user-avatar avatar-small\">\
													<img src=\""+ App.config.image_prefix + data.moments[i].creator.user_image + "\"/>\
												</div>\
												<div class=\"moment-header\">\
													<span class=\"moment-title\">" + data.moments[i].title + "</span>\
													<span class=\"moment-location\">" + data.moments[i].location + "</span>\
												</div>\
												<div class=\"clearfix\">&nbsp;</div>\
											</div>";
						for (var img = 0; img < data.moments[i].images.length; img++) {
							moment_item += "<div class=\"moment-image " + imgdiv_class + "\">\
									<img src=\"" + App.config.image_prefix + data.moments[i].images[img] + "\"/>\
								</div>";
						}
						moment_item += "<div class=\"moment-description\">\
								<span>" + data.moments[i].text + "</span>\
							</div>";
						// Process date format. Should be done centrally.
						var t = data.moments[i].date.split(/[- :]/);
						var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
						var o = {
							weekday: "long", 
							year: "numeric", 
							month: "short",
							day: "numeric", 
							hour: "2-digit", 
							minute: "2-digit"
						};
						var ds = d.toLocaleDateString("en-us", o) + " " + d.toLocaleTimeString("en-us", o);
						ds = ds.substr(0, ds.length - 4);
						ds = ds.substr(0, ds.length - 6) + ds.substr(ds.length - 3, ds.length);
						// End process date format.
						moment_item += "<div class=\"moment-datetime\">\
								<span>" + ds + "</span>\
							</div>";
						moment_item += "</div>";
						Lungo.dom("#moments-article").append(moment_item);
						delete moment_item;
						//console.log(data.moments[i].title);
					}
					Lungo.Router.section("moments");
				}
			} else {
				Lungo.Router.section("home");
			}
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
