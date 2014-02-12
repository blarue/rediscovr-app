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

	// capturePhoto: function() {
	// 	// Take picture using device camera and retrieve image as base64-encoded string
	// 	navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
	// 		quality: 50, 
	// 		destinationType: destinationType.DATA_URL,
	// 		targetWidth: 320,
	// 		targetHeight: 320
	// 	});
	// },

	// capturePhotoEdit: function() {
	// 	// Take picture using device camera, allow edit, and retrieve image as base64-encoded string
	// 	navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
	// 		quality: 20, 
	// 		allowEdit: true, 
	// 		destinationType: destinationType.DATA_URL,
	// 		targetWidth: 320,
	// 		targetHeight: 320
	// 	});
	// },

	// getPhoto: function(source) {
	// 	// Retrieve image file location from specified source
	// 	navigator.camera.getPicture(this.onPhotoURISuccess, this.onFail, {
	// 		quality: 50, 
	// 		destinationType: destinationType.FILE_URI, 
	// 		sourceType: source,
	// 		targetWidth: 320,
	// 		targetHeight: 320
	// 	});
	// },

	// onPhotoDataSuccess: function(imageData) {
	// 	// Uncomment to view the base64-encoded image data
	// 	console.log(imageData);

	// 	// Get image handle
	// 	var smallImage = Lungo.dom("#smallImage");

	// 	// Unhide image elements
	// 	smallImage.show();

	// 	// Show the captured photo
	// 	// The in-line CSS rules are used to resize the image
	// 	smallImage.attr("src", "data:image/jpeg;base64," + imageData);
	// },
	
	// // Called if something bad happens.
	// //
	// onFail: function(message) {
	// 	alert('Failed because: ' + message);
	// }
}