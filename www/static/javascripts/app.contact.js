App.contacts = {
	onSuccess: function(contacts) {
		alert('Found ' + contacts.length + ' contacts.');
	},

	onError: function(contactError) {
		alert('onError!');
	},

	findContacts: function() {
		// find all contacts with 'Bob' in any name field
		var options      = new ContactFindOptions();
		options.filter   = "McHugh";
		options.multiple = true;
		var fields       = ["displayName", "name"];
		navigator.contacts.find(fields, this.onSuccess, this.onError, options);
	}
}