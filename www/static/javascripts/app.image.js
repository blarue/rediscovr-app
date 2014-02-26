App.image = function() {
	return {
		orig: null,
		data64: "",
		max_w: 640,
		steps: 3,
		orientation: "portrait",
		DATADIR: null,
		file_msg: "",
		root: "http://etch-images.s3.amazonaws.com/",
		mode: "cache-from-s3",
		image: "",
		newName: "",
		reader: null,
		writer: null,

		cacheNewImage: function(localurl, new_name, cb) {
			var _this = this;
			this.newName = new_name;
			//this.image = (localurl.indexOf("blob:") != -1) ? localurl.substr(5) : localurl;
			this.image = localurl;
			console.log(this.image);
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {_this.onFileSystemSuccess(fs);}, this.onFileSystemFail);
		},

		cacheLocally: function(image, cb) {
			var _this = this;
			this.image = image;
            //this.cb = cb;
            cb();
			// Get FS.
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.onFileSystemSuccess, this.onFileSystemFail);
		},

		onFileSystemSuccess: function(fs) {
//			console.log("FS Success");
			var _this = this;
			fs.root.getDirectory("momentimg", {create:true}, function(d) {_this.gotDir(d);}, this.onGetDirError);
		},

		onFileSystemFail: function(e) {
			console.log(e.target.error.code);
		},

		gotDir: function(d) {
			console.log("gotDir Success");
			var _this = this;
			this.DATADIR = d;
			var reader = this.DATADIR.createReader();
			reader.readEntries(function(d) {
				//_this.gotFiles(d);
				_this.dataDirectoryReady();
			}, this.onGetDirError);
		},

		gotFiles: function(entries) {
			console.log("The dir has " + entries.length + " entries.");
			for (var i = 0; i < entries.length; i++) {
				console.log(entries[i].name);
			}
		},

		onGetDirError: function(e) {
			console.log("ERROR");
			console.log(JSON.stringify(e));
		},

		imageError: function(e) {
			console.log("ERROR");
			console.log(JSON.stringify(e));
		},

		dataDirectoryReady: function() {
			var _this = this;
			switch (this.mode) {
				case "cache-from-s3":
					var file = this.image;
					var ft = new FileTransfer();
					var save_path = this.DATADIR.fullPath + "/" + this.image;

					ft.download(App.config.image_prefix + "preview-full/" + escape(this.image), save_path, function(file_dl) {
						_this.file_msg += "Success: " + file_dl.toURL() + "\n";
						console.log("Success: " + file_dl.toURL());
						_this.cb("Success");
					}, this.imageError);
					break;
				case "cache-new":
					console.log(_this.image.name);
					this.DATADIR.getFile(this.newName, {create: true, exclusive: false},
						function(fileEntry) {
							console.log("getFile success");
							fileEntry.createWriter(
								function(writer) {
									console.log("createWriter success");
									_this.writer = writer;
									_this.reader = new FileReader();
									_this.reader.onloadend = function (evt) {
										console.log("read success");
										_this.writer.onwriteend = function(evt) {
											console.log("write success");
										};
										_this.writer.write(evt.target.result);
									};
									_this.reader.readAsArrayBuffer(_this.image);
								},
								function() {
									console.log("createWriter fail");
								}
							);
						},
						function() {
							console.log("getFile fail");
						}
					);
					break;
			}
		},
        setImageBlob: function(image, steps, cb) {
            if (steps == null) {
                steps = 4;
            }
            console.log("Running generate blob.");
            this.orig = new Image();
            var _this = this;
            this.orig.addEventListener("load", function(event) {
                //console.log("Original Width: " + _this.orig.width);
                //console.log("Original Height: " + _this.orig.height);
            }, false);
            if (image.substr(0, 1) == "/") {
                this.orig.src = image;
            } else if (image.substr(0, 4) == "blob") {
                this.orig.src = image;
            } else {
                this.orig.src = App.config.image_prefix + image;
            }
        },
		generateImageBlob: function(image, steps, cb) {
			if (steps === null) {
				steps = 4;
			}
			console.log("Running generate blob.");
			this.orig = new Image();
			var _this = this;
			this.orig.addEventListener("load", function(event) {
				// console.log("Original Width: " + _this.orig.width);
				// console.log("Original Height: " + _this.orig.height);
				_this.orientation = (_this.orig.width >= _this.orig.height) ? "landscape" : "portrait";

				if (_this.orig.width > _this.max_w) {
					_this.resizeImage(steps, cb);
				} else {
					_this.getData64(cb);
				}
			}, false);
			if (image.substr(0, 1) == "/") {
				this.orig.src = image;
			} else if (image.substr(0, 4) == "blob") {
				this.orig.src = image;
			} else {
				this.orig.src = App.config.image_prefix + image;
			}
		},

		resizeImage: function(steps, cb) {
			if (steps === null) {
				steps = 4;
			}
			console.log("Running resize image.");
			var curr_w = this.orig.width;
			var curr_h = this.orig.height;
			var ratio = curr_h / curr_w;
			// console.log("ratio: " + ratio);
			var final_h = Math.floor(this.max_w * ratio);
			// console.log("final_h: " + final_h);
			var diff = curr_w - this.max_w;
			var step_size = Math.ceil(diff / steps);
			var factor, step_diff, step_w, step_h;
			var tmp = [];
			var tmpctx = [];
			// Perform 4 step resizing.
			for (var i = 0; i < (steps - 1); i++) {
				step_diff = curr_w - step_size;
				factor = (step_diff / curr_w);
				step_w = Math.ceil(curr_w * factor);
				step_h = Math.ceil(curr_h * factor);

				// Temp image canvas.
				tmp[i] = document.createElement('canvas');
				tmpctx[i] = tmp[i].getContext("2d");
				tmp[i].width = step_w;
				tmp[i].height = step_h;
				// console.log("tmp[" + i + "].width: " + tmp[i].width);
				// console.log("tmp[" + i + "].height: " + tmp[i].height);
				if (i === 0) {
					tmpctx[i].drawImage(this.orig, 0, 0, curr_w, curr_h, 0, 0, tmp[i].width, tmp[i].height);
				} else {
					tmpctx[i].drawImage(tmp[i - 1], 0, 0, curr_w, curr_h, 0, 0, tmp[i].width, tmp[i].height);
				}
				curr_w = tmp[i].width;
				curr_h = tmp[i].height;
			}

			// Final image canvas.
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");
			canvas.width = this.max_w;
			canvas.height = final_h;
			var last = tmp.length - 1;
			// console.log("this.max_w: " + this.max_w);
			// console.log("final_h: " + final_h);
			ctx.drawImage(tmp[last], 0, 0, tmp[last].width, tmp[last].height, 0, 0, this.max_w, final_h);
			this.data64 = canvas.toDataURL("image/jpeg", 0.9);
			cb(this.data64);
		},

		getData64: function(cb) {
			var c = document.createElement('canvas');
			var ctx = c.getContext("2d");
			ctx.drawImage(this.orig, 10, 10);
			this.data64 = c.toDataURL("image/jpeg", 0.9);
			cb(this.data64);
		}
	};
};
