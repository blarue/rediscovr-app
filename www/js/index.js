function ValidationSignForm()
{
	var first_name=$("#signup-first_name").val();
	if (first_name==null || first_name=="")
	{
		$("#err_msg").html("First name must be filled out");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}

	var last_name=$("#signup-last_name").val();
	if (last_name==null || last_name=="")
	{
		$("#err_msg").html("Last name must be filled out");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}
	
	var email = $("#signup-emailadd").val();
	if (email==null || email=="")
	{
		$("#err_msg").html("email address must be filled out");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}

	var validate_email= looksLikeMail(email);
	if (validate_email==false)
	{
		$("#err_msg").html("Invalidate email address.");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}

	var password=$("#signup-password").val();
	if (password==null || password=="")
	{
		$("#err_msg").html("password must be filled out");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}

	var country =$("#signup-country").val();
	if (country==null || country=="")
	{
		$("#err_msg").html("Location must be filled out");
		$("#err_msg").show(500);
		return false;
	}else{
		$("#err_msg").hide(200);
	}
    
    return true;
}

function looksLikeMail(str) {
    var lastAtPos = str.lastIndexOf('@');
    var lastDotPos = str.lastIndexOf('.');
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
}