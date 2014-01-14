var rediscovr = rediscovr || {};

rediscovr.mapping = {
	query: "",
	defaultZoom: 13,
	account: 'chrismcq.gn2ake2f',

	getBounds: function() {
		this.bounds = rediscovr.mapping.map.getBounds();		
	},

	addMap: function() {
		console.log("Requesting GPS...");
		// We might want to go with this...
		// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.01604211293868,-75.18851826180997&sensor=true
		navigator.geolocation.getCurrentPosition(
			function(position) {
				rediscovr.mapping.latitude = position.coords.latitude;
				rediscovr.mapping.longitude = position.coords.longitude;
				console.log("Requesting map from Mapbox...");
				rediscovr.mapping.map = L.mapbox.map('map', rediscovr.mapping.account, {
					tileLayer:{detectRetina:true}
				}).setView([rediscovr.mapping.latitude, rediscovr.mapping.longitude], rediscovr.mapping.defaultZoom);
				console.log("Adding marker layer to map...");
				rediscovr.mapping.map.markerLayer.on('layeradd', function(e) {
					var marker = e.layer,
					feature = marker.feature;
					marker.setIcon(L.icon(feature.properties.icon));
				});
				console.log("Performing generic search...");
				// Perform generic search.
				rediscovr.mapping.search();
				// Cancel any refresh timeout on zoomstart.
				rediscovr.mapping.map.addEventListener("zoomstart", function() {
					if (typeof rediscovr.mapping.moveTimeout == "number") {
						window.clearTimeout(rediscovr.mapping.moveTimeout);
						delete rediscovr.mapping.moveTimeout;
					}
				});
				// Refresh results on map zoom.
				rediscovr.mapping.map.addEventListener("zoomend", function() {
					rediscovr.mapping.moveTimeout = window.setTimeout(
						function() {
							rediscovr.mapping.search();
							delete rediscovr.mapping.moveTimeout;
						}, 1000
					);
				});
				// Cancel any refresh timeout on movestart.
				rediscovr.mapping.map.addEventListener("movestart", function() {
					if (typeof rediscovr.mapping.moveTimeout == "number") {
						window.clearTimeout(rediscovr.mapping.moveTimeout);
						delete rediscovr.mapping.moveTimeout;
					}
				});
				// Refresh results on map move.
				rediscovr.mapping.map.addEventListener("moveend", function() {
					rediscovr.mapping.moveTimeout = window.setTimeout(
						function() {
							rediscovr.mapping.search();
							delete rediscovr.mapping.moveTimeout;
						}, 1000
					);
				});
			}
		);
	},

	resizeResultsBox: function() {
		// Viewport height
		var vp_height = document.documentElement.clientHeight;
		// Div offset height
		var div_top = Lungo.dom("#fourSq-results").get(0).offsetTop;
		// Set height
		console.log("Setting height to " + (vp_height - div_top));
		Lungo.dom("#fourSq-results").style("height", (vp_height - div_top) + "px");
	},

	search: function() {
		// Get box boundries first.
		this.getBounds();
		// Request Data
		var thedata = {
			client_id: 'EBY3HCFFYQEUHXSZ1IGG3HIS1YULDWG1JSZAK2RFN3OOKUQJ', 
			client_secret: 'V0F0MQU43ZB1I3NVBEXNLBW5LZNJ1F4UPI3I30TPDBRT0IGV', 
			intent: 'browse', 
			v: '20130815', 
			//ll: rediscovr.mapping.latitude + ',' + rediscovr.mapping.longitude,
			//radius: '800',
			limit: 15, 
			ne: rediscovr.mapping.bounds._northEast.lat + ',' + rediscovr.mapping.bounds._northEast.lng, 
			sw: rediscovr.mapping.bounds._southWest.lat + ',' + rediscovr.mapping.bounds._southWest.lng,
		};
		if (!this.query.length) {
			// Request the category "Neighborhoods" when we have no query.
			thedata.categoryId = "4f2a25ac4b909258e854f55f";
		} else {
			thedata.query = this.query;
		}


		// Make AJAX call.
		$$.ajax({
			type: 'GET',
			url: 'https://api.foursquare.com/v2/venues/search',
			data: thedata,
			dataType: 'json', //'json', 'xml', 'html', or 'text'
			async: true,
			success: function(response) {
				if (typeof response === "undefined") {
					console.log("Response empty.");
					return false;
				}
				if (
					response.meta === undefined || 
					response.meta.code === undefined || 
					response.response === undefined || 
					response.response.venues === undefined
				) {
					console.log("Response malformed.");
					return false;
				}
				if (response.meta.code == '200' && response.response.venues.length) {

					// Size results div.
					rediscovr.mapping.resizeResultsBox();
					// Empty results div.
					Lungo.dom("#fourSq-results-list").html("");

					var geojson = [];
					console.log("Response Code: " + response.meta.code);
					for (var i = 0; i < response.response.venues.length; i++) {
						// console.log("Venue: " + response.response.venues[i].name);
						// Calculate distance if appropriate.
						// var distance = "";
						// if (response.response.venues[i].location.distance != "undefined") {
						// 	distance = response.response.venues[i].location.distance / 1609.34;
						// 	distance = distance.toFixed(2).toString() + " mi";
						// }
						var new_li = "<li id='venue-" + response.response.venues[i].id + "' class='thumb search-4sq' data-view-section='back'>";
						if (response.response.venues[i].categories.length && response.response.venues[i].categories[0].icon != "undefined") {
							new_li += "<img src='" + response.response.venues[i].categories[0].icon.prefix + 'bg_64' + response.response.venues[i].categories[0].icon.suffix + "'/>";
						}
						new_li += "<div class='venueDetails'>";
						if (response.response.venues[i].categories.length && response.response.venues[i].categories[0].shortName != "undefined") {
							new_li += "<div class='on-right text tiny'>" + response.response.venues[i].categories[0].shortName + "</div>";
						}
						// City/State
						// new_li += "<strong class='text bold'>" + response.response.venues[i].name + "</strong>" +
						// 		"<span class='text tiny'>" + response.response.venues[i].location.city + ", " + response.response.venues[i].location.state + "</span>" +
						// 	"</div>" +
						// "</li>";
						// Street/Cross-street

						// Add venue name
						new_li += "<strong class='text bold venueName'>" + response.response.venues[i].name + "</strong>";

						// Add venue location. Specifically if possible.
						if (response.response.venues[i].location.address != undefined) {
							new_li += "<span class='text tiny'>" + response.response.venues[i].location.address;
							if (response.response.venues[i].location.crossStreet != undefined) {
								new_li += " (" + response.response.venues[i].location.crossStreet + ")</span>";
							}
						} else if (response.response.venues[i].location.city != undefined) {
							new_li += "<span class='text tiny'>" + response.response.venues[i].location.city;
							if (response.response.venues[i].location.state != undefined) {
								new_li += ", " + response.response.venues[i].location.state + "</span>";
							}
						}
						new_li += "</div></li>";

						Lungo.dom("#fourSq-results-list").append(new_li);
						Lungo.dom(".search-4sq").on("tap", function() {
							console.log("Choosing " + Lungo.dom(this).children(".venueDetails").children(".venueName").text());
							rediscovr.currentmoment.moment_location = Lungo.dom(this).children(".venueDetails").children(".venueName").text();
							Lungo.dom("#moment-form-location").get(0).value = rediscovr.currentmoment.moment_location;
						});
						if (response.response.venues[i].categories.length && response.response.venues[i].categories[0].icon != "undefined") {
							geojson.push({"type": "Feature",
								"geometry": {
									"type": "Point",
									"coordinates": [response.response.venues[i].location.lng, response.response.venues[i].location.lat]
								},
								"properties": {
									"title": response.response.venues[i].name,
									"icon": {
										"iconUrl": response.response.venues[i].categories[0].icon.prefix + '32' + response.response.venues[i].categories[0].icon.suffix,
										"iconSize": [32, 32],
										"iconAnchor": [16, 16],
										"popupAnchor": [0, -16],
										"className": "dot"
									}
								}
							});
						}
					}
				}

				rediscovr.mapping.map.markerLayer.setGeoJSON(geojson);
			},
			error: function(xhr, type) {
				console.log(type);
			}
		});
	}
}
