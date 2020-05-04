const $twoFactorForm = $("#two-factor-form");

// LOGOUT
const logoutLink = document.getElementById("logout-link");
logoutLink.addEventListener("click", function(e){
    e.preventDefault();
    delete localStorage.JWTtoken;
    notebooksBaseUrl = undefined;
    notesBaseUrl = undefined;
    $("#login-form").show();
    $(".notebook, .note").remove();
    $("#resources-container").hide();
    $(logoutLink).hide();
    coreMethods.setAlert("Logout successfully completed!", "success");
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
            const { code, error } = response;
            if(error && code!==200){
                coreMethods.setAlert(error.message, "danger");
                $(this.form).children("#login-password").val("");
            } else {
                $(this.form).children("input").val("");
                $("#registration-form, #login-form").hide();
                coreMethods.setAlert();
                // show confirm token form
                $twoFactorForm.show();
                $twoFactorForm.children("input").val("");
                $twoFactorForm.children("button[type=submit]").text("Login");
            }
        }
    })
});

// TWO FACTOR LOGIN
$twoFactorForm.submit(function(e){
    e.preventDefault();
    const token = $(this).children("#token").val();
    if(token && token.length){
        const data = $(this).serialize();
        const context = $twoFactorForm.children("button[type=submit]").text();
        const path = context==="Login" ? "/loginConfirm" : "/registerConfirm";
        const url = defaultUrl + path;
        $.ajax({
            url,
            type: "POST",
            data,
            context,
            success: function(response){
                const { err, user, token } = response;
                if(err){
                    coreMethods.setAlert(err, "danger");
                } else {
                    $twoFactorForm.hide();
                    $("#resources-container, #logout-link").show();
                    localStorage.JWTtoken = token;
                    notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                    notesBaseUrl = defaultUrl + `/${token}/notes`;
                    coreMethods.setAlert(`Welcome ${context==="Login" ? "back" : "" } ${user.username}!`, "success");
                    if(context!=="Login"){
                        $("#registration-message").hide();
                    }
                    coreMethods.loadNotebooks();
                }
            }
        })
    } else {
        coreMethods.setAlert("Missing token", "danger");
    }
});


// RESGISTRATION
const registrationForm = document.getElementById("registration-form");
const registrationLink = document.getElementById("registration-link");
const loginLink = document.getElementById("login-link");
const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;

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

const registrationPhoneInput = document.getElementById("registration-phone");
const passwordInput = document.getElementById("registration-password");
const paswordConfirmInput = document.getElementById("registration-password-confirm");
const registrationFormSubmitBtn = document.querySelector("#registration-form > button[type=submit]");

registrationPhoneInput.addEventListener("input", function(e){
    e.preventDefault();
    const { value } = this;
    if(!phoneNumberRegex.exec(value) && value.length){
        coreMethods.setAlert("Phone Number not valid", "danger");
        registrationFormSubmitBtn.setAttribute("disabled", true);
    } else {
        coreMethods.setAlert();
        registrationFormSubmitBtn.removeAttribute("disabled");
    }
}); 

paswordConfirmInput.addEventListener("input", function(e){
    e.preventDefault();
    const confirmPassword = this.value;
    const password = passwordInput.value;
    if(confirmPassword.length && password.length){
        if(confirmPassword!==password){
            coreMethods.setAlert("passwords don't match", "danger");
            registrationFormSubmitBtn.setAttribute("disabled", true);
        } else {
            coreMethods.setAlert();
            registrationFormSubmitBtn.removeAttribute("disabled");
        }
    } else {
        coreMethods.setAlert();
        registrationFormSubmitBtn.removeAttribute("disabled");
    }
});

registrationForm.addEventListener("submit", function(e){
    e.preventDefault();
    const username = $(this).children("#regisration-username").val();
    const password = $(this).children("#registration-password").val();
    const passwordConfirm = $(this).children("#registration-password-confirm").val();
    const phoneNumber = $(this).children("#registration-phone").val();
    let errMsg = "Missing ";
    if(!username) errMsg+="username, "
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
                    } else if(response.code===200) {
                        coreMethods.setAlert();
                        $(registrationForm).hide();
                        $twoFactorForm.show();
                        $twoFactorForm.children("input").val("");
                        $twoFactorForm.children("button[type=submit]").text("Get Registered");
                        $("#registration-message").show();
                    }
                }
            });
        }
    }
});

// remove alert when a btn reset is clicked
$("button[type=reset]").click(function(e){
    coreMethods.setAlert();
    $(this).siblings("button[type=submit]").each(
        (i, e)=>{
            e.removeAttribute("disabled");
        }
    );
})

if(localStorage.JWTtoken){
    $("#registration-form, #login-form").hide();
    $(logoutLink).show();
    $("#resources-container").show();
}