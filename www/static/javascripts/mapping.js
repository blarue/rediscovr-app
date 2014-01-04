var rediscovr = rediscovr || {};

rediscovr.mapping = {
	query: "",

	getBounds: function() {
		this.bounds = rediscovr.mapping.map.getBounds();		
	},

	search: function() {
		// Get box boundries first.
		this.getBounds();
		// Make AJAX call.
		$$.ajax({
			type: 'GET',
			url: 'https://api.foursquare.com/v2/venues/search',
			data: {
				client_id: 'EBY3HCFFYQEUHXSZ1IGG3HIS1YULDWG1JSZAK2RFN3OOKUQJ', 
				client_secret: 'V0F0MQU43ZB1I3NVBEXNLBW5LZNJ1F4UPI3I30TPDBRT0IGV', 
				intent: 'browse', 
				v: '20130815', 
				ne: rediscovr.mapping.bounds._northEast.lat + ',' + rediscovr.mapping.bounds._northEast.lng, 
				sw: rediscovr.mapping.bounds._southWest.lat + ',' + rediscovr.mapping.bounds._southWest.lng,
				query: this.query,
			},
			dataType: 'json', //'json', 'xml', 'html', or 'text'
			async: true,
			success: function(response) { 
				// if (!response.length) return false;
				// if (response.meta == undefined || response.meta.code == undefined) return false;
				// if (response.response == undefined || response.response.venues == undefined) return false;
				// if (response.meta.code == '200' && response.response.venues.length) {
					// Empty results div.
					Lungo.dom("#fourSq-results-list").html("");

					var geojson = [];
					console.log("Response Code: " + response.meta.code);
					for (var i = 0; i < response.response.venues.length; i++) {
						//console.log("Venue: " + response.response.venues[i].name);
						var new_li = "<li class='thumb search-4sq'>";
						if (response.response.venues[i].categories.length && response.response.venues[i].categories[0].icon != "undefined") {
							new_li += "<img src='" + response.response.venues[i].categories[0].icon.prefix + 'bg_64' + response.response.venues[i].categories[0].icon.suffix + "'/>";
						}
						new_li += "<div>";
						if (response.response.venues[i].categories.length && response.response.venues[i].categories[0].shortName != "undefined") {
							new_li += "<div class='on-right text tiny'>" + response.response.venues[i].categories[0].shortName + "</div>";
						}
						new_li += "<strong class='text bold'>" + response.response.venues[i].name + "</strong>" +
								"<span class='text tiny'>" + response.response.venues[i].location.city + ", " + response.response.venues[i].location.state + "</span>" +
							"</div>" +
						"</li>";
						Lungo.dom("#fourSq-results-list").append(new_li);
						Lungo.dom(".search-4sq").on("tap", function() {
							//alert("tap");
							//console.log(this.children.("div").children.("div").text());
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
				//}

				rediscovr.mapping.map.markerLayer.setGeoJSON(geojson);

				//rediscovr.mapping.markerLayer = L.mapbox.markerLayer(geojson).addTo(rediscovr.mapping.map);
			},
			error: function(xhr, type) {
				console.log(type);
			}
		});
	}
}
