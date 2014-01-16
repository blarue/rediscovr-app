App.photo = {
// navigator.camera.getPicture(this.onCaptureSuccess, this.onCaptureFail, {
//     allowEdit: true,
//     correctOrientation: true,
//     destinationType: Camera.DestinationType.FILE_URI,
//     soureType: Camera.PictureSourceType.PHOTOLIBRARY,
//     targetHeight: 315,
//     targetWidth: 320
// });

	capturePhoto: function() {
		// Take picture using device camera and retrieve image as base64-encoded string
		navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
			quality: 50, 
			destinationType: destinationType.DATA_URL,
			targetWidth: 320,
			targetHeight: 320
		});
	},

	capturePhotoEdit: function() {
		// Take picture using device camera, allow edit, and retrieve image as base64-encoded string
		navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, {
			quality: 20, 
			allowEdit: true, 
			destinationType: destinationType.DATA_URL,
			targetWidth: 320,
			targetHeight: 320
		});
	},

	getPhoto: function(source) {
		// Retrieve image file location from specified source
		navigator.camera.getPicture(this.onPhotoURISuccess, this.onFail, {
			quality: 50, 
			destinationType: destinationType.FILE_URI, 
			sourceType: source,
			targetWidth: 320,
			targetHeight: 320
		});
	},

	onPhotoDataSuccess: function(imageData) {
		// Uncomment to view the base64-encoded image data
		console.log(imageData);

		// Get image handle
		var smallImage = Lungo.dom("#smallImage");

		// Unhide image elements
		smallImage.show();

		// Show the captured photo
		// The in-line CSS rules are used to resize the image
		smallImage.attr("src", "data:image/jpeg;base64," + imageData);
	},
	
	// Called if something bad happens.
	//
	onFail: function(message) {
		alert('Failed because: ' + message);
	}
}