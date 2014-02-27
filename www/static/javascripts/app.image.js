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
			this.cb = cb;
            cb();
			// Get FS.
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.onFileSystemSuccess, this.onFileSystemFail);
		},

		onFileSystemSuccess: function(fs) {
			console.log("FS Success");
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
		}
	};
};
