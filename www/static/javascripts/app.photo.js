var ctx;
var t_width, t_height;
var pos_y, pos_x;
var target_flag = false;

App.photo = {
// navigator.camera.getPicture(this.onCaptureSuccess, this.onCaptureFail, {
//     allowEdit: true,
//     correctOrientation: true,
//     destinationType: Camera.DestinationType.FILE_URI,
//     soureType: Camera.PictureSourceType.PHOTOLIBRARY,
//     targetHeight: 315,
//     targetWidth: 320
// });

    getPics: function(event) {
        if (event.target.files.length) {
<<<<<<< HEAD
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
=======
        	var chosen_image;
        	var myurl;
        	var url_tool = window.webkitURL;
			// Empty any existing thumbs.
			Lungo.dom("#add-moment-selected-images").html("");
        	for (var i = 0; i < event.target.files.length; i++) {
        		myurl = url_tool.createObjectURL(event.target.files[i]);
				chosen_image = "<img style=\"display:inline-block;width:40px;height:40px;border:1px solid #FFFFFF;\" src=\"" + myurl + "\" />";
				Lungo.dom("#add-moment-selected-images").append(chosen_image);	
        	}
        	delete myurl, url_tool, chosen_image;
>>>>>>> Select Reminder Page fix
        }
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
    }

//	capturePhoto: function() {
//		// Take picture using device camera and retrieve image as base64-encoded string
//		navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
//			quality: 50,
//			destinationType: destinationType.DATA_URL,
//			targetWidth: 320,
//			targetHeight: 320
//		});
//	},
//
//	capturePhotoEdit: function() {
//		// Take picture using device camera, allow edit, and retrieve image as base64-encoded string
//		navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
//			quality: 20,
//			allowEdit: true,
//			destinationType: destinationType.DATA_URL,
//			targetWidth: 320,
//			targetHeight: 320
//		});
//	},
//
//	getPhoto: function(source) {
//		// Retrieve image file location from specified source
//		navigator.camera.getPicture(this.onPhotoURISuccess, this.onFail, {
//			quality: 75,
//			destinationType: destinationType.FILE_URI,
//			sourceType: source,
//			mediaType: Camera.MediaType.ALLMEDIA,
//			targetWidth: 320,
//			targetHeight: 320
//		});
//	},
//
//	onPhotoDataSuccess: function(imageData) {
//		// Uncomment to view the base64-encoded image data
//		console.log(imageData);
//
//		// Get image handle
//		var smallImage = Lungo.dom("#smallImage");
//
//		// Unhide image elements
//		smallImage.show();
//
//		// Show the captured photo
//		// The in-line CSS rules are used to resize the image
//		smallImage.attr("src", "data:image/jpeg;base64," + imageData);
//	},
//
//	onPhotoURISuccess: function (imageURI) {
//		// Uncomment to view the image file URI
//		// console.log(imageURI);
//
//		// Get image handle
//		var largeImage = document.getElementById('largeImage');
//
//		// Unhide image elements
//		largeImage.style.display = 'block';
//
//		// Show the captured photo
//		// The in-line CSS rules are used to resize the image
//		largeImage.src = imageURI;
//	},
//
//	// Called if something bad happens.
//	//
//	onFail: function(message) {
//		alert('Failed because: ' + message);
//	}
}