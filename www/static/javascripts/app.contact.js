App.contact = {
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
		try {
			navigator.contacts.find(fields, App.contacts.onSuccess, App.contacts.onError, options);
		} catch (e) {
			alert(JSON.stringify(e));
		}
	}
}