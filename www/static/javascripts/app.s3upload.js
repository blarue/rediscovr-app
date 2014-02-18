App.s3upload = (function () {

	var signingURI = "http://api.etched.io/api/fileupload";

	function upload(fileName, mimeType, ref) {
		console.log("Running App.s3upload.upload");
		var deferred = $.Deferred(),
			ft = new FileTransfer(),
			options = new FileUploadOptions(),
			imageURI;
		ft.onprogress = function(p) {
			if (p.lengthComputable) {
				console.log("Percent loaded: " + Number((p.loaded / p.total) * 100).toFixed(2) + "%");
			}
		};
		options.fileKey = "file";
		options.fileName = fileName;
		options.mimeType = mimeType;
		options.chunkedMode = true;

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function(fs) {
				fs.root.getDirectory("momentimg", {create:true}, 
					function(d) {
						d.getFile(fileName, {create: false, exclusive: false}, 
							function(fileEntry) {
								imageURI = fileEntry.toURL();

								$.ajax({url: signingURI, data: {"s3_object_name": fileName, "s3_object_type": mimeType}, dataType: "json", type: "GET"})
									.done(function (data) {
										console.log(data);
										options.params = {
											"key": fileName,
											"AWSAccessKeyId": data.awskey,
											"acl": "public-read",
											"policy" : data.policy,
											"signature": data.signature,
											"Content-Type": mimeType
										};
										//console.log(data.signed_request);
										//var signed_request = decodeURIComponent(data.signed_request);
										//console.log(signed_request);
										ft.upload(imageURI, "https://" + data.bucket + ".s3.amazonaws.com/",
											function (e) {
												console.log("Upload succeeded.");
												console.log(ref);
												if (!ref.images_for_upload.length) {
													console.log("Last Image. Save moment to API.");
													ref.handleAddImages();
												} else {
													console.log("There are " + ref.images_for_upload.length + " images left.");
												}
												var DB = new App.database();
												DB.flagImageSaved();
												deferred.resolve(e);
											},
											function (e) {
												console.log("Upload failed");
												console.log(e.body);
												deferred.reject(e);
											}, options);

									})
									.fail(function (error) {
										console.log(JSON.stringify(error));
									});
								return deferred.promise();

							}, 
							function(e) {
								console.log("File Error");
								console.log(e);
							}
						);
					}, 
					function(e) {
						console.log("Directory Error");
						console.log(e);
					}
				);
			},
			function(e) {
				console.log("Filesystem Error");
				console.log(e);
			}
		);
	}

	return {
		upload: upload
	};

}());