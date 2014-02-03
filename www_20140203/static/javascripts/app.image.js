App.image = function() {
	return {
		orig: null,
		data64: "",
		max_w: 640,
		steps: 3,
		orientation: "portrait",

		generateImageBlob: function(image, steps, cb) {
			if (steps == null) {
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
			if (steps == null) {
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
	}
}
