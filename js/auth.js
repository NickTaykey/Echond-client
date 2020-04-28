// LOGOUT
const logoutLink = document.getElementById("logout-link");
logoutLink.addEventListener("click", function(e){
    e.preventDefault();
    $.ajax({
        url: defaultUrl + "/logout",
        type: "GET",
        success: function(response){
            if(response.code===200){
                Cookies.remove("currentUser");
                currentUser = undefined;
                $("#login-form").show();
                $(".notebook, .note").remove();
                $("#resources-container").hide();
                $(logoutLink).hide();
                coreMethods.setAlert("Logout successfully completed!", "success");
            }
        }
    })
});

// LOGIN
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    const data = $(this).serialize();
    const url = defaultUrl + "/login";
    $.ajax({
        type: "POST",
        url,
        data,
        form: this,
        success: function(response){
            const { user, error } = response;
            if(!user && error){
                coreMethods.setAlert(error.message, "danger");
                $(this.form).children("#login-password").val("");
            } else {
                currentUser = user;
                const userJSON = JSON.stringify(user);
                notebooksBaseUrl = defaultUrl + `/${user._id}/notebooks`;
                Cookies.set("currentUser", userJSON);
                coreMethods.setAlert(`Welcome back ${user.username}!`, "success");
                $(this.form).children("input").val("");
                $("#registration-form, #login-form").hide();
                $(logoutLink).show();
                $("#resources-container").show();
                coreMethods.loadNotebooks();
            }
        }
    })
});

// RESGISTRATION
const registrationForm = document.getElementById("registration-form");
const registrationLink = document.getElementById("registration-link");
const loginLink = document.getElementById("login-link");
registrationLink.addEventListener("click", function(e){
    e.preventDefault();
    $(loginForm).hide();
    $(registrationForm).show();
    $(".alert-danger, .alert-success").hide();
    $(".alert-danger, .alert-success").text("");
});
loginLink.addEventListener("click", function(e){
    e.preventDefault();
    $(registrationForm).hide();
    $(loginForm).show();
});
registrationForm.addEventListener("submit", function(e){
    e.preventDefault();
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
    const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/gi;
    const email = $(this).children("#registration-email").val();
    const username = $(this).children("#regisration-username").val();
    const password = $(this).children("#registration-password").val();
    const passwordConfirm = $(this).children("#registration-password-confirm").val();
    const phoneNumber = $(this).children("#registration-phone").val();
    let errMsg = "Missing ";
    if(!username) errMsg+="username, "
    if(!email) errMsg+="E-mail, "
    if(!password) errMsg+="password, "
    if(!passwordConfirm) errMsg+="Password confirmation, "
    if(!phoneNumber) errMsg+="Phone Number, "
    if(errMsg!=="Missing "){
        errMsg = errMsg.slice(0, errMsg.length - 2);
        coreMethods.setAlert(errMsg, "danger");
    } else {
        if(password!==passwordConfirm){
            coreMethods.setAlert("Passwords not matching", "danger");
        } else if(!phoneNumberRegex.exec(phoneNumber)){
            coreMethods.setAlert("Phone number not valid", "danger");
        } else if(!emailRegex.exec(email)){
            coreMethods.setAlert("E-mail address not valid", "danger");
        } else {
            const data = $(this).serialize();
            const url = defaultUrl + "/register";
            $.ajax({
                type: "POST",
                url,
                data,
                form: this,
                success: function(response){
                    if(response.err){
                        let msg;
                        if(response.err.message) msg = response.err.message;
                        else msg = response.err;
                        coreMethods.setAlert(msg, "danger");
                        $(this.form).children("input[type=password]").val("");
                    } else {
                        currentUser = response;
                        const userJSON = JSON.stringify(response);
                        Cookies.set("currentUser", userJSON);
                        coreMethods.setAlert(`Welcome ${response.username}!`, "success");
                        $(this.form).children("input").val("");
                        $("#registration-form, #login-form").hide();
                        $(logoutLink).show();
                        $("#resources-container").show();
                    }
                }
            });
        }
    }
});

if(currentUser){
    $("#registration-form, #login-form").hide();
    $(logoutLink).show();
    $("#resources-container").show();
}
