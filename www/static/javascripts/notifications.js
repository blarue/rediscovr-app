App.notificaitonLastSyncTime = 1300000000;

App.notification = function() {
	return {
		details: {
			user_id: null,
			since: null,
		},

		errors: [],
		
		getNotifications: function() {
			this.details = {
				user: App.current_user.details.user_id,
				since: App.notificaitonLastSyncTime
			};

			var api = new App.api();
			api.getNotifications(this);
		},
		
		handleGetNotifications:function(results){
			//console.log(results.notifications);
			//console.log(results.server_time);
			var notificationArray = results.notifications;
			Lungo.dom("#notifications-article #notifications_list").empty();
			$.each(notificationArray, function(i, notificaiton){
				  var row = notificationArray[i];
                   console.log(row);
					if(row.id != undefined && row.id != null)  
		  			Lungo.dom("#notifications-article #notifications_list").append('<li class=\"arrow\" id=\"m_'+row.id+'\" onclick=\"gotoPersonDetail(\''+row.id+'\');\"><div class=\"user-avatar avatar-medium avatar-shadow\"><img src=\"'+row.user_image+'\"/></div><div><span class=\"text\">'+row.first_name+' '+ row.last_name+' has added <span class=\"hilite\">'+row.images+' photos</span> from today</span></div><div style=\"clear:both;\"></div></li>');
				});
		//	App.notificaitonLastSyncTime = results.server_time;
		},
	}
}

function gotoPersonDetail(id)
{
    Lungo.dom("#notifications-article #notifications_list #m_"+id).remove();
    Lungo.dom("#notifications-article #notifications_list").listview('refresh');
}