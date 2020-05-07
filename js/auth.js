const twoFactorForm = document.getElementById("two-factor-form");

// LOGOUT
const logoutLink = document.getElementById("logout-link");
logoutLink.addEventListener("click", function(e){
    e.preventDefault();
    delete localStorage.JWTtoken;
    notebooksBaseUrl = undefined;
    notesBaseUrl = undefined;
    previouslyLoggedIn = false;
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
                $(twoFactorForm).show();
                $(twoFactorForm).children("input").val("");
                $(twoFactorForm).children("button[type=submit]").text("Login");
                previouslyLoggedIn = true;
            }
        }
    })
});

const resetPwdForm = document.getElementById("reset-pwd-form");
let userConfirmToken;

// TWO FACTOR form involving features
twoFactorForm.addEventListener("submit", function(e){
    e.preventDefault();
    const token = $(this).children("#token").val();
    if(token && token.length){
        const data = $(this).serialize();
        const feature = $(twoFactorForm).children("button[type=submit]").text();
        const path = feature==="Login" ? "/loginConfirm" : feature==="Reset password" ? "/forgotConfirm" :  "/registerConfirm";
        const url = defaultUrl + path;
        $.ajax({
            url,
            type: "POST",
            data,
            feature,
            token,
            success: function(response){
                const { err, user, token, code } = response;
                if(err){
                    coreMethods.setAlert(err, "danger");
                } else if(this.feature==="Reset password" && code===200){
                    $(resetPwdForm).show();
                    $(twoFactorForm).hide();
                    $(twoFactorForm).children("input[type=text]").val("");
                    userConfirmToken = this.token;
                    coreMethods.setAlert();
                } else {
                    $(twoFactorForm).hide();
                    $("#resources-container, #logout-link").show();
                    localStorage.JWTtoken = token;
                    notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                    notesBaseUrl = defaultUrl + `/${token}/notes`;
                    coreMethods.setAlert(`Welcome ${this.feature==="Login" ? "back" : "" } ${user.username}!`, "success");
                    if(this.feature!=="Login"){
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

resetPwdForm.addEventListener("submit", function(e){
    e.preventDefault();
    const password = $(this).children("#reset-password").val();
    const passwordConfirm = $(this).children("#reset-password-confirm").val();
    if(!password.length) return coreMethods.setAlert("Missing password", "danger");
    else if(!passwordConfirm.length) return coreMethods.setAlert("Missing password confirmation", "danger");
    else if(password!==passwordConfirm) return coreMethods.setAlert("Passwords not matching", "danger");
    else {
        const data = $(this).serialize() + "&userToken=" + userConfirmToken;
        const url = defaultUrl + "/reset";
        $.ajax({
            type: "PUT",
            url,
            data,
            resetPwdForm,
            success: function(response){
                const { err, token } = response;
                if(err){
                    return coreMethods.setAlert(err, "danger");
                }
                $(this.resetPwdForm).hide();
                $(this.resetPwdForm).children("input[type=password]").val("");
                $("#resources-container, #logout-link").show();
                localStorage.JWTtoken = token;
                notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                notesBaseUrl = defaultUrl + `/${token}/notes`;
                coreMethods.loadNotebooks();
                coreMethods.setAlert("Password successfully reseted", "success");
            }
        });
    }
})

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
                        $(twoFactorForm).show();
                        $(twoFactorForm).children("input").val("");
                        $(twoFactorForm).children("button[type=submit]").text("Get Registered");
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

// forgot pwd feature
const forgotPwdLink = document.getElementById("forgot-pwd-link");
const forgotPwdForm = document.getElementById("forgot-pwd-form");

forgotPwdLink.addEventListener("click", function(e){
    e.preventDefault();
    $(forgotPwdForm).show();
    $(loginForm).hide();
});

forgotPwdForm.addEventListener("submit", function(e){
    e.preventDefault();
    const number = $(this).children("input").val();
    if(number && number.length){
        if(phoneNumberRegex.exec(number)){
            const url = defaultUrl + "/forgot";
            const data = $(this).serialize();
            $.ajax({
                type: "POST",
                url,
                data,
                form: this,
                success: function(response){
                    const { err, code } = response;
                    if(err){
                        coreMethods.setAlert(err.message, "danger");
                    } else if(code===200){
                        coreMethods.setAlert();
                        $(twoFactorForm).show();
                        $("#password-reset-status").show();
                        $(twoFactorForm).children("button[type=submit]").text("Reset password");
                        $(this.form).hide();
                    }
                }
            });
        } else {
            coreMethods.setAlert("Invalid phone number", "danger");
        }
    } else {
        coreMethods.setAlert("Missing phone number", "danger");
    }
});