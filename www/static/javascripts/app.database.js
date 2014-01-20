App.database = {
	// DB Stuff
	shortname: 'moments', 
	version: '1.0', 
	displayname: 'moments', 
	maxsize: 65536,
	db: {},

	open: function() {
		this.db = openDatabase(this.shortname, this.version, this.displayname, this.maxsize);
		this.createTables();
	},

	createTables: function() {
		console.log("Trying to create table.");
		console.log(typeof this.db);
		// User table
		var user_definition = "\
			CREATE TABLE IF NOT EXISTS `user`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`email` TEXT NOT NULL, \
				`firstName` TEXT NULL, \
				`lastName` TEXT NULL, \
				`city` TEXT NULL, \
				`state` TEXT NULL, \
				`country` TEXT NULL, \
				`user_image` TEXT NULL, \
				`current_user` INTEGER NOT NULL DEFAULT 0 \
			);";

		// Moment table
		var moment_definition = "\
			CREATE TABLE IF NOT EXISTS `moment`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`title` TEXT NOT NULL, \
				`desc` TEXT NULL, \
				`date_happened` DATE, \
				`time_happened` TIME, \
				`location` TEXT NOT NULL, \
				`reminder` TEXT NOT NULL DEFAULT 'Never', \
				`reminder_end` TEXT NOT NULL DEFAULT 'Never', \
				`owner` TEXT NOT NULL DEFAULT 'self' \
			);";
		// Image table
		var image_definition = "\
			CREATE TABLE IF NOT EXISTS `image`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`name` TEXT NOT NULL, \
				`type` TEXT NOT NULL DEFAULT 'Moment', \
				`owner` TEXT NOT NULL DEFAULT 'self' \
			);";
		// Moment/Image map table.
		var moment_image_definition = "\
			CREATE TABLE IF NOT EXISTS `moment_image`(\
				`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
				`moment_id` INTEGER NOT NULL, \
				`image_id` INTEGER NOT NULL, \
				`primary` INTEGER NOT NULL DEFAULT 1 \
			);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(user_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
				transaction.executeSql(moment_image_definition, [], App.database.nullDataHandler, App.database.errorHandler);
			}
		);
	},

	addUser: function(d) {
		console.log("Adding logged in user to local DB.");
		console.log(d);
		d.current_user = (d.current_user != undefined && d.current_user) ? 1 : 0;

		if (d.user_id != undefined) {
			var data_array = [d.user_id, d.email, d.firstName, d.lastName, d.city, d.state, d.country, d.user_image, d.current_user];
			var query = "INSERT INTO `user` (`id`, `email`, `firstName`, `lastName`, `city`, `state`, `country`, `user_image`, `current_user`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
		} else {
			var data_array = [d.email, d.firstName, d.lastName, d.city, d.state, d.country, d.image, d.current_user];
			var query = "INSERT INTO `user` (`email`, `firstName`, `lastName`, `city`, `state`, `country`, `user_image`, `current_user`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
		}		
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleInsertedUser, App.database.errorHandler);
			}
		);
	},

	addMoment: function(d) {
		var data_array = [d.title, d.description, d.date, d.time, d.location, d.reminder_frequency, d.reminder_end, d.owner];
		var query = "INSERT INTO `moment` (`title`, `desc`, `date_happened`, `time_happened`, `location`, `reminder`, `reminder_end`, `owner`) \
					VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleInsertedMoment, App.database.errorHandler);
			}
		);
	},
	
	addImage: function(d) {
		console.log("Attempting to add image.");
		var data_array = [d.name, d.type, d.owner];
		var query = "INSERT INTO `image` (`name`, `type`, `owner`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleInsertedImage, App.database.errorHandler);
			}
		);
	},

	associateImage: function(d) {
		var data_array = [d.moment_id, d.image_id, d.primary];
		var query = "INSERT INTO `moment_image` (`moment_id`, `image_id`, `primary`) \
					VALUES (?, ?, ?);";
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, data_array, App.database.handleAssociatedImage, App.database.errorHandler);
			}
		);
	},

	getCurrentUser: function(ref) {
		//Query DB for logged in user.
		var query = "SELECT * FROM `user` WHERE `current_user` = 1";
		console.log(query);
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(query, [], ref.handleGetUserDB, App.database.errorHandler);
			}
		);
	},

	getMoments: function(owner, order, limit) {
		var wheres = [{sql: "`title` IS NOT NULL", param: null}];
		var _limit = '';
		var _order = '';
		var _data = [];
		if (owner != undefined) {
			wheres.push({sql: "`owner` = ?", param: owner});
		}
		if (limit != undefined) {
			_limit = " LIMIT " + limit;
		}
		if (order != undefined) {
			_order = " ORDER BY " + order;
		}
		if (wheres.length) {
			for (var i = 0; i < wheres.length; i++) {
				if (i == 0) {
					var _where = " WHERE ";
				} else {
					_where += " AND ";
				}
				_where += wheres[i].sql;
				if (wheres[i].param != null) {
					_data.push(wheres[i].param);
				}
			}
		}
		var _query = "SELECT * FROM `moment` " + _where + _order + _limit;
		console.log(_query);
		this.db.transaction(
			function(transaction) {
				transaction.executeSql(_query, _data, App.database.logMoment, App.database.errorHandler);
			}
		);
	},

	logMoment: function(transaction, results) {
		for (var i=0; i < results.rows.length; i++) {
			var string = '';
			var row = results.rows.item(i);
			string += row.title + ', ';
			string += row.desc + ', ';
			string += row.date_happened + ', ';
			string += row.location + ', ';
			string += row.reminder + ', ';
			string += row.reminder_end + ', ';
			console.log(string);
		}
	},

	errorHandler: function(transaction, error) {
		// error.message is a human-readable string.
		// error.code is a numeric error code
		console.log('Oops.  Error was '+error.message+' (Code '+error.code+')');

		// Handle errors here
		var we_think_this_error_is_fatal = true;
		if (we_think_this_error_is_fatal) return true;
		return false;
	},

	nullDataHandler: function(transaction, results) {
		// Do nothing.
		console.log(results);
		Lungo.Notification.hide();
	},

	handleInsertedMoment: function(transaction, results) {
		console.log("MomentID: " + results.insertId);
		rediscovr.currentmoment.moment_id = results.insertId;
		
		if (rediscovr.currentmoment.images.length) {
			for (var i = 0; i < rediscovr.currentmoment.images.length; i++) {
				var data_array = {
					name: rediscovr.currentmoment.images[i],
					type: 'moment',
					owner: 'self'
				}
				App.database.addImage(data_array);
			}
		}
		Lungo.Notification.show(
			"check",                //Icon
			"Success",              //Title
			3,                      //Seconds
			function() {
				m = new App.moments();
				m.refreshMoments();       //Callback function
			}
		);
	},

	handleInsertedImage: function(transaction, results) {
		console.log("ImageID: " + results.insertId);
		var image_id = results.insertId;
		console.log(rediscovr.currentmoment.moment_id + ', ' + image_id);
		
		var data_array = {
			moment_id: rediscovr.currentmoment.moment_id,
			image_id: image_id,
			primary: 1
		};
		App.database.associateImage(data_array);
	},

	handleAssociatedImage: function(transaction, results) {
		console.log("MomentImageID: " + results.insertId);
	},

	// When passed as the error handler, this silently causes a transaction to fail.
	killTransaction: function(transaction, error) {
		return true;
	}
}
