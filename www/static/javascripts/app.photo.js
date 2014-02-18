App.photo = {

	video_types: ["mov", "mp4", "m4v"],
	
	image_types: ["jpg", "jpeg", "png"],

	getPics: function(event) {
        if (event.target.files.length) {
			var chosen_image;
			var myurl;
			var url_tool = window.webkitURL;

			// Empty any existing thumbs. Or not!!
			//Lungo.dom("#add-moment-selected-images").html("");
			for (var i = 0; i < event.target.files.length; i++) {
				myurl = url_tool.createObjectURL(event.target.files[i]);
				console.log(event.target.files[i].name);
				var n = event.target.files[i].name.split(".");
				var ext = n[n.length - 1];
				var new_name = App.generateUid('moment') + "." + ext;
				var types = {
					video: ["mov", "mp4", "m4v"],
					image: ["jpg", "jpeg", "png"]
				};
console.log("myurl: " + myurl);
				// Handle video thumbnail.
				var is_vid = (types.video.indexOf(ext.toLowerCase()) != -1) ? true : false;
				if (is_vid) {
					var tmpvid = document.createElement("video");
					tmpvid.addEventListener("load", function(event) {
						console.log("Loaded.");
						console.log(Lungo.dom(tmpsrc).width);
						console.log(Lungo.dom(tmpsrc).height);
					});
					//Lungo.dom(tmpvid).
					var tmpsrc = document.createElement("source");
					Lungo.dom(tmpsrc).attr("src", "myurl");
					Lungo.dom(tmpvid).append(tmpsrc);
					var video = Lungo.dom(tmpvid).get(0);
					var w = video.videoWidth;
					var h = video.videoHeight;
					console.log("w: " + w + ", h: " + h);
					var canvas = document.createElement('canvas');
					canvas.width = w;
					canvas.height = h;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(video, 0, 0, w, h);
					myurl = canvas.toDataURL("image/jpeg", 0.9);
				}

				chosen_image = document.createElement("img");
				Lungo.dom(chosen_image).attr("style", "display:inline-block;width:70px;height:70px;border:1px solid #FFFFFF;");
				Lungo.dom(chosen_image).attr("src", myurl);
				Lungo.dom(chosen_image).tap(function(e) {
					var _this = this;
					Lungo.Notification.confirm({
						icon: null,
						title: 'Are you sure you want to remove this photo?',
						description: '',
						accept: {
							icon: 'checkmark',
							label: 'Accept',
							callback: function(){ Lungo.dom(_this).hide(); }
						},
						cancel: {
							icon: 'close',
							label: 'Cancel',
							callback: function(){ alert("No!"); }
						}
					});
				});
				Lungo.dom("#add-moment-selected-images").append(chosen_image);
			}
			Lungo.dom(".selectedphotos").show();
			Lungo.dom("#moment-photos-done-button-count").text(Lungo.dom("#add-moment-selected-images").children().length);
			if (Lungo.Router.history() !== "add-moment-photos") {
				Lungo.Router.section("add-moment-photos");
			}
			// Clone the first child node from the selected images and make that the collection image.
			var collection_image = Lungo.dom("#add-moment-selected-images").children().first().get(0).cloneNode();
			Lungo.dom(collection_image).tap(function() {
				Lungo.Router.section("add-moment-photos");
			});
			Lungo.dom("#add-moment-image-collection").html(collection_image);
			Lungo.dom("#add-moment-image-collection").append("<span class=\"tag count\">" + Lungo.dom("#add-moment-selected-images").children().length + "</span>");
			Lungo.dom("#add-moment-file-upload").hide();
        	delete myurl, url_tool, chosen_image;
        }
	},

	getPhoto: function(source) {
		// Retrieve image file location from specified source
		navigator.camera.getPicture(this.onPhotoURISuccess, this.onFail, {
			quality: 75, 
			destinationType: destinationType.FILE_URI, 
			sourceType: source,
			mediaType: Camera.MediaType.ALLMEDIA,
			targetWidth: 320,
			targetHeight: 320
		});
	},

	onPhotoURISuccess: function (imageURI) {
		// Uncomment to view the image file URI
		console.log(imageURI);

		var n = imageURI.split(".");
		var ext = n[n.length - 1];
		console.log("Ext: " + ext);
		var new_name = App.generateUid('moment') + "." + ext;
		console.log(new_name);
		console.log(App.photo.video_types);
		console.log(this);
		console.log("is_vid: " + App.photo.video_types.indexOf(ext.toLowerCase()));
		var is_vid = (App.photo.video_types.indexOf(ext.toLowerCase()) != -1) ? true : false;
		var DATADIR, READER, WRITER;
		// Cache the image in out persistent filesystem.
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fs) {
				fs.root.getDirectory("momentimg", {create:true}, 
					function(d) {
						console.log("gotDir Success");
						DATADIR = d;
						var reader = DATADIR.createReader();
						reader.readEntries(function(d) {
							var file = imageURI;
							var ft = new FileTransfer();
							var save_path = DATADIR.fullPath + "/" + new_name;

							ft.download(imageURI, save_path, 
								function(file_dl) {
									console.log("Success: " + file_dl.toURL());					
									if (is_vid) {
										console.log("Image Type: Video");
										var chosen_video = document.createElement("video");
										Lungo.dom(chosen_video).attr("width", 70);
										Lungo.dom(chosen_video).attr("height", 70);
										var video_source = document.createElement("source");
										Lungo.dom(video_source).attr("src", file_dl.toURL());
										Lungo.dom(chosen_video).append(video_source);
										Lungo.dom(chosen_video).tap(function(e) {
											var _this = this;
											navigator.notification.confirm(
												'',
												function(buttonIndex) {
													console.log(buttonIndex);
													switch (buttonIndex) {
														case 1:
															Lungo.dom(_this).hide();
															break;
														case 2:
															return false;
															break;
													}
												},
												'Are you sure you want to remove this video?',
												['Yes', 'No']
											);
										});
										Lungo.dom("#add-moment-selected-images").append(chosen_video);
									} else {
										console.log("Image Type: Image");
										var chosen_image = document.createElement("img");
										Lungo.dom(chosen_image).attr("style", "display:inline-block;width:70px;height:70px;border:1px solid #FFFFFF;");
										Lungo.dom(chosen_image).attr("src", file_dl.toURL());
										Lungo.dom(chosen_image).tap(function(e) {
											var _this = this;
											navigator.notification.confirm(
												'',
												function(buttonIndex) {
													console.log(buttonIndex);
													switch (buttonIndex) {
														case 1:
															Lungo.dom(_this).hide();
															break;
														case 2:
															return false;
													}
												},
												'Are you sure you want to remove this photo?',
												['Yes', 'No']
											);
										});
										Lungo.dom("#add-moment-selected-images").append(chosen_image);
									}
									Lungo.dom(".selectedphotos").show();
									Lungo.dom("#moment-photos-done-button-count").text(Lungo.dom("#add-moment-selected-images").children().length);
									if (Lungo.Router.history() !== "add-moment-photos") {
										Lungo.Router.section("add-moment-photos");
									}
									// Clone the first child node from the selected images and make that the collection image.
									var collection_image = Lungo.dom("#add-moment-selected-images").children().first().get(0).cloneNode();
									Lungo.dom(collection_image).tap(function() {
										Lungo.Router.section("add-moment-photos");
									});
									Lungo.dom("#add-moment-image-collection").html(collection_image);
									Lungo.dom("#add-moment-image-collection").append("<span class=\"tag count\">" + Lungo.dom("#add-moment-selected-images").children().length + "</span>");
									Lungo.dom("#add-moment-file-upload").hide();
									delete myurl, url_tool, chosen_image;
								}, 
								function(e) {
									console.log("ERROR");
									console.log(JSON.stringify(e));
								}
							);
							// this.DATADIR.getFile(this.newName, {create: true, exclusive: false}, 
							//	function(fileEntry) {
							//		console.log("getFile success");
							//		fileEntry.createWriter(
							//			function(writer) {
							//				console.log("createWriter success");
							//				WRITER = writer;
							//				READER = new FileReader();
							//				READER.onloadend = function (evt) {
							//					console.log("read success");
							//					WRITER.onwriteend = function(evt) {
							//						console.log("write success");
							//					};
							//					WRITER.write(evt.target.result);
							//				};
							//				READER.readAsArrayBuffer(_this.image);
							//			}, 
							//			function() {
							//				console.log("createWriter fail");
							//			}
							//		);
							//	}, 
							//	function() {
							//		console.log("getFile fail");
							//	}
							// );
						}, this.onGetDirError);
					},
					function(r) {}
				);
			}, 
			function(r) {}
		);

		// if (is_vid) {
		//	console.log("Image Type: Video");
		//	var chosen_video = document.createElement("video");
		//	Lungo.dom(chosen_video).attr("width", 70);
		//	Lungo.dom(chosen_video).attr("height", 70);
		//	var video_source = document.createElement("source");
		//	Lungo.dom(video_source).attr("src", imageURI);
		//	Lungo.dom(chosen_video).append(video_source);
		//	Lungo.dom(chosen_video).tap(function(e) {
		//		var _this = this;
		//		navigator.notification.confirm(
		//			'',
		//			function(buttonIndex) {
		//				console.log(buttonIndex);
		//				switch (buttonIndex) {
		//					case 1:
		//						Lungo.dom(_this).hide();
		//						break;
		//					case 2:
		//						return false;
		//						break;
		//				}
		//			},
		//			'Are you sure you want to remove this video?',
		//			['Yes', 'No']
		//		);
		//	});
		//	Lungo.dom("#add-moment-selected-images").append(chosen_video);
		// } else {
		//	console.log("Image Type: Image");
		//	var chosen_image = document.createElement("img");
		//	Lungo.dom(chosen_image).attr("style", "display:inline-block;width:70px;height:70px;border:1px solid #FFFFFF;");
		//	Lungo.dom(chosen_image).attr("src", imageURI);
		//	Lungo.dom(chosen_image).tap(function(e) {
		//		var _this = this;
		//		navigator.notification.confirm(
		//			'',
		//			function(buttonIndex) {
		//				console.log(buttonIndex);
		//				switch (buttonIndex) {
		//					case 1:
		//						Lungo.dom(_this).hide();
		//						break;
		//					case 2:
		//						return false;
		//						break;
		//				}
		//			},
		//			'Are you sure you want to remove this photo?',
		//			['Yes', 'No']
		//		);
		//	});
		//	Lungo.dom("#add-moment-selected-images").append(chosen_image);
		// }
		// Lungo.dom(".selectedphotos").show();
		// Lungo.dom("#moment-photos-done-button-count").text(Lungo.dom("#add-moment-selected-images").children().length);
		// if (Lungo.Router.history() !== "add-moment-photos") {
		//	Lungo.Router.section("add-moment-photos");
		// }
		// // Clone the first child node from the selected images and make that the collection image.
		// var collection_image = Lungo.dom("#add-moment-selected-images").children().first().get(0).cloneNode();
		// Lungo.dom(collection_image).tap(function() {
		//	Lungo.Router.section("add-moment-photos");
		// });
		// Lungo.dom("#add-moment-image-collection").html(collection_image);
		// Lungo.dom("#add-moment-image-collection").append("<span class=\"tag count\">" + Lungo.dom("#add-moment-selected-images").children().length + "</span>");
		// Lungo.dom("#add-moment-file-upload").hide();
		// delete myurl, url_tool, chosen_image;


		// Get image handle
		//var largeImage = document.getElementById('largeImage');

		// Unhide image elements
		//largeImage.style.display = 'block';

		// Show the captured photo
		// The in-line CSS rules are used to resize the image
		//largeImage.src = imageURI;
	},

    getProfilePics: function(event) {
        if (event.target.files.length) {
            var chosen_image;
            var myurl;
            var url_tool = window.webkitURL;
            var orig;
            // Empty any existing thumbs.
            //Lungo.dom("#add-moment-selected-images").html("");
            for (var i = 0; i < 1; i++) {
                $("#profile-selected-images").empty();
                myurl = url_tool.createObjectURL(event.target.files[i]);
                chosen_image = " <img id='source' style='display:none;' src=\"" + myurl + "\"/>";
                Lungo.dom("#profile-selected-images").append(chosen_image);

                orig = new Image();
                orig.addEventListener("load", function(event){
                    //   console.log("Original Width: " + orig.width);
                    //   console.log("Original Height: " + orig.height);

                    try{
                        var canvas=document.getElementById("canvas");
                        ctx=canvas.getContext("2d");
                        var img=new Image();
                        var s_height = orig.height;
                        var s_width = orig.width;
                        if(s_height > s_width)
                        {
                            target_flag = true;
                            t_width = s_width;
                            delta = s_height - s_width;
                            pos_y = parseInt(delta/2);
                            document.getElementById("canvas").height = t_width;
                            document.getElementById("canvas").width = t_width;
                        }else{
                            target_flag = false;
                            t_height = s_height;
                            delta = s_width - s_height;
                            pos_x = parseInt(delta/2);
                            document.getElementById("canvas").height = t_height;
                            document.getElementById("canvas").width = t_height;
                        }

                        var img=new Image();
                        img.onload=function(){
                            if(target_flag == true)
                                ctx.drawImage(img,0,pos_y,t_width,t_width,0,0,t_width,t_width);
                            else
                                ctx.drawImage(img,pos_x,0,t_height,t_height,0,0,t_height,t_height);

                            document.getElementById("cropped").src=canvas.toDataURL();
                        }
                        img.src=document.getElementById("source").src;

                    }catch(e){console.log(e);}

                }, false);
                if (myurl.substr(0, 1) == "/") {
                    orig.src = myurl;
                } else if (myurl.substr(0, 4) == "blob") {
                    orig.src = myurl;
                } else {
                    orig.src = App.config.image_prefix + myurl;
                }
            }
            delete myurl, url_tool, chosen_image, orig;
        }
    },

	// Called if something bad happens.
	//
	onFail: function(message) {
		alert('Failed because: ' + message);
	}

}