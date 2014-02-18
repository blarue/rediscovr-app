/**
 * Created by benlarue on 2/18/14.
 */
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

                if(row.id != undefined && row.id != null)
                    Lungo.dom("#notifications-article #notifications_list").append('<li class=\"arrow\" onclick=\"gotoPersonDetail(\''+row.first_name+'\'\,\''+row.last_name+'\'\,\''+row.city+'\'\,\''+row.state+'\'\,\''+row.images+'\');\"><div class=\"user-avatar avatar-medium avatar-shadow\"><img src=\"'+row.user_image+'\"/></div><div><span class=\"text\">'+row.first_name+' '+ row.last_name+' has added <span class=\"hilite\">'+row.images+' photos</span> from today</span></div><div style=\"clear:both;\"></div></li>');
            });
            //	App.notificaitonLastSyncTime = results.server_time;
        },
    }
}

function gotoPersonDetail(first_name, last_name, city, state, images)
{
    Lungo.dom(".profile-detail .username").html(first_name +" " +last_name);
    Lungo.dom(".profile-detail .userloc").html(city +", " +state);
    Lungo.dom(".profile-detail .num-collaborations-num").html(images + " collaborations");
    Lungo.dom("#person_detail_title").html(first_name +" " +last_name);
    Lungo.Router.section("person");
}