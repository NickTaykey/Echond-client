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
                Cookies.set("currentUser", userJSON);
                coreMethods.setAlert(`Welcome back ${user.username}!`, "success");
                $(this.form).children("input").val("");
                $("#registration-form, #login-form").hide();
                $(logoutLink).show();
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
});
loginLink.addEventListener("click", function(e){
    e.preventDefault();
    $(registrationForm).hide();
    $(loginForm).show();
});
registrationForm.addEventListener("submit", function(e){
    e.preventDefault();
    const data = $(this).serialize();
    const url = defaultUrl + "/register";
    $.ajax({
        type: "POST",
        url,
        data,
        form: this,
        success: function(response){
            if(response.err){
                coreMethods.setAlert(response.err.message, "danger");
                $(this.form).children("input[type=password]").val("");
            } else {
                currentUser = response;
                const userJSON = JSON.stringify(response);
                Cookies.set("currentUser", userJSON);
                coreMethods.setAlert(`Welcome ${response.username}!`, "success");
                $(this.form).children("input").val("");
                $("#registration-form, #login-form").hide();
                $(logoutLink).show();
            }
        }
    })
});

if(currentUser){
    $("#registration-form, #login-form").hide();
    $(logoutLink).show();
}
