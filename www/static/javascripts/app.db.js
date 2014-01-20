App.db = function() {
	return {
		// DB Stuff
		shortname: 'moments', 
		version: '1.0', 
		displayname: 'moments', 
		maxsize: 65536,
		db: {},

		open: function() {
			this.db = openDatabase(this.shortname, this.version, this.displayname, this.maxsize);
		}
	}
}
