App.api = function() {
	
	var config = {
		url: "http://api.etched.io/api/",
		token: "1234567890",
		controller: "",
		action: "",
		method: "POST",
		callback: ""
	};

	return {
		curr_image: 0,

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
			if (ref.validate("new") === true) {
				console.log("Validates. " + config.url + "user  " + JSON.stringify(ref.details));
				$$.post(config.url + "user", JSON.stringify(ref.details), function(data) {
					ref.handleAdd(data);
				}, "json");
			} else {
				console.log("User doesn't validate.");
			}
		},

		updateUser: function(ref) {
			console.log("Running updateUser");
			if (ref.validate("update") === true) {
				console.log("Validates. " + config.url + "user  " + JSON.stringify(ref.details));
				$$.put(config.url + "user", JSON.stringify(ref.details), function(data) {
					ref.handleUpdateUser(data);
				}, "json");
			} else {
				console.log("User doesn't validate.");
			}
		},

		addMoment: function(ref) {
			console.log("Running addMoment");
			this.uploadImages(ref);
		},

		editMoment: function(ref) {
			//if (ref.validate() === true) {
				console.log("Validates. " + config.url + "moment  " + JSON.stringify(ref.details));
				$$.put(config.url + "moment", JSON.stringify(ref.details), function(data) {
					// ref.handleAdd(data);
					console.log("Success");
				}, "json");
			// } else {
			//	console.log("Moment doesn't validate.");
			// }
		},

        editMoment: function(ref) {
            //if (ref.validate() === true) {
            console.log("Validates. " + config.url + "moment  " + JSON.stringify(ref.details));
            $$.put(config.url + "moment", JSON.stringify(ref.details), function(data) {
                // ref.handleAdd(data);
                console.log("Success");
            }, "json");
            // } else {
            // 	console.log("Moment doesn't validate.");
            // }
        },

        handleAddImages: function(ref) {
			// Set ref back to original ref so we can validate. Bad way. FIXME.
			if (this.ref) {
				ref = this.ref;
			}
			ref.details.images = ref.details.apiimages;
			ref.details.date += " " + ref.details.time;
			if (ref.validate() === true) {
				console.log("Validates. " + config.url + "moment  " + JSON.stringify(ref.details));
				$$.post(config.url + "moment", JSON.stringify(ref.details), function(data) {
					// ref.handleAdd(data);
					console.log("Success");
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
		},

        getNotifications: function(ref) {
            console.log("Running getNotifications");

            $$.get(config.url + "notification", ref.details, function(data) {
                ref.handleGetNotifications(data);
            }, "json");

        },

        uploadImages: function(ref) {
			this.ref = ref;
			console.log("Running uploadImages");
			//Upload images.
			var _this = this;
			var _ref = ref;
			var s3;
			ref.details.apiimages = [];
			this.images_for_upload = [];
			for (var i = 0; i < Lungo.dom("#add-moment-selected-images").children().length; i++) {
				var full_path = Lungo.dom("#add-moment-selected-images").children()[i].src;
				if (full_path === "" && Lungo.dom("#add-moment-selected-images").children()[i].currentSrc !== undefined) {
					full_path = Lungo.dom("#add-moment-selected-images").children()[i].currentSrc;
				}
				this.images_for_upload.push(full_path);
			}
			var fp;
			while (this.images_for_upload.length) {
			//for (var i = 0; i < this.images_for_upload.length; i++) {
				fp = this.images_for_upload.pop();
				// var full_path = Lungo.dom("#add-moment-selected-images").children()[i].src;
				// if (full_path === "" && Lungo.dom("#add-moment-selected-images").children()[i].currentSrc !== undefined) {
				//	full_path = Lungo.dom("#add-moment-selected-images").children()[i].currentSrc;
				// }
				var filename = fp.split("/")[fp.split("/").length - 1];
				console.log("Filename: " + filename);
				console.log("Full Path: " + fp);
				var ext = filename.split(".")[filename.split(".").length - 1];
				var mime_type;
				var asset_type = "image";
				switch (ext.toLowerCase()) {
					case "mov":
					case "mp4":
					case "m4v":
						mime_type = "video/quicktime";
						asset_type = "video";
						break;
					case "jpg":
					case "jpeg":
						mime_type = "image/jpeg";
						break;
					case "png":
						mime_type = "image/png";
						break;
					case "gif":
						mime_type = "image/gif";
						break;
				}
				console.log("Mime Type: " + mime_type);
				ref.details.apiimages.push({url_hash: filename, type: asset_type});
				s3 = new App.s3upload.upload(filename, mime_type, _this);
			}
		}
	};
};
