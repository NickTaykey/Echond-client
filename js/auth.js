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
                $("#two-factor-form").show();
            }
        }
    })
});

// TWO FACTOR LOGIN
const twoFactorForm = document.getElementById("two-factor-form");
twoFactorForm.addEventListener("submit", function(e){
    e.preventDefault();
    const token = $(this).children("#token").val();
    if(token && token.length){
        const data = $(this).serialize();
        const url = defaultUrl + "/loginConfirm";
        $.ajax({
            url,
            type: "POST",
            data,
            success: function(response){
                const { err, user, token } = response;
                if(err){
                    coreMethods.setAlert(err, "danger");
                } else {
                    $("#two-factor-form").hide();
                    $("#resources-container, #logout-link").show();
                    localStorage.JWTtoken = token;
                    notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                    notesBaseUrl = defaultUrl + `/${token}/notes`;
                    coreMethods.setAlert(`Welcome back ${user.username}!`, "success");
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
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/gi;

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

const registrationEmailInput = document.getElementById("registration-email");
const registrationPhoneInput = document.getElementById("registration-phone");
const passwordInput = document.getElementById("registration-password");
const paswordConfirmInput = document.getElementById("registration-password-confirm");
const registrationFormSubmitBtn = document.querySelector("#registration-form > button[type=submit]");

registrationEmailInput.addEventListener("input", function(e){
    e.preventDefault();
    const { value } = this;
    if(!emailRegex.exec(value) && value.length){
        coreMethods.setAlert("E-mail not valid", "danger");
        registrationFormSubmitBtn.setAttribute("disabled", true);
    } else {
        coreMethods.setAlert();
        registrationFormSubmitBtn.removeAttribute("disabled");
    }
});

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
                        const { token, user } = response;
                        notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                        notesBaseUrl = defaultUrl + `/${token}/notes`;
                        localStorage.JWTtoken = token;
                        coreMethods.setAlert(`Welcome ${user.username}!`, "success");
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

if(localStorage.JWTtoken){
    $("#registration-form, #login-form").hide();
    $(logoutLink).show();
    $("#resources-container").show();
}
