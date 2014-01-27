App.db = function() {
	return {
		// DB Stuff
		shortname: 'moments', 
		version: '1.1', 
		displayname: 'moments', 
		maxsize: 100*1024*1024,
		db: {},

		open: function() {
			this.db = openDatabase(this.shortname, "", this.displayname, this.maxsize);
		},

		executeQuery: function(q, p) {
			this.db.transaction(
				function(transaction) {
					transaction.executeSql(q, p, 
						function(transaction, results) {
							//console.log(results);
						}, 
						function(transaction, results) {
							//console.log(results);
						}
					);
				}
			);
		}
	}
}
