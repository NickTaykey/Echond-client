const twoFactorForm = document.getElementById("two-factor-form");
const loginFormTitle = document.getElementById("login-form-title");
const registrationFormTitle = document.getElementById("registration-form-title");
const twoFactorFormTitle = document.getElementById("two-factor-form-title");
const twoFactorPwdResetStatus = document.getElementById("password-reset-status");
const forgotPwdFormTitle = document.getElementById("forgot-pwd-form-title");
// LOGOUT
const logoutLink = document.getElementById("logout-link");
const logoutItem = document.getElementById("logout-item");
logoutLink.addEventListener("click", function(e){
    e.preventDefault();
    delete localStorage.JWTtoken;
    delete localStorage.currentUser;
    notebooksBaseUrl = undefined;
    notesBaseUrl = undefined;
    previouslyLoggedIn = false;
    $("#login-item").addClass("active");
    $(loginFormTitle).show();
    $("#login-form").show();
    $(".notebook, .note").remove();
    $("#resources-container").hide();
    $(logoutItem).hide();
    $(profileLink).hide();
    $(profile).hide();
    $("#welcome-item, #profile-item, #sf-item").hide();
    $("#registration-item, #login-item").show();
    $("#welcome-msg").text("");
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
                coreMethods.setFormErrLabel(this.form, error.message);
                $("#login-password").val("");
            } else {
                $(this.form)
                    .children(".form-group")
                    .children("input")
                    .val("");
                $("#registration-form, #login-form").hide();
                coreMethods.setAlert();
                $(loginFormTitle).hide();
                // show confirm token form
                $(twoFactorForm).show();
                $(twoFactorPwdResetStatus).hide();
                $(twoFactorFormTitle).show();
                $(twoFactorForm).children("input").val("");
                $(twoFactorForm).children("button[type=submit]").text("Login");
            }
        }
    })
});

const resetPwdForm = document.getElementById("reset-pwd-form");
let userConfirmToken;

// TWO FACTOR form involving features
twoFactorForm.addEventListener("submit", function(e){
    e.preventDefault();
    const token = $("#token").val();
    const formGroup = $(this).children(".form-group")[0];
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
            form: formGroup,
            token,
            success: function(response){
                const { err, user, token, code } = response;
                if(err){
                    coreMethods.setFormErrLabel(this.form, err);
                } else {
                    $(twoFactorForm).hide();
                    $(twoFactorFormTitle).hide();
                    $(twoFactorForm).children("input[type=text]").val("");
                    if(this.feature!=="Reset password"){
                        const content = `Welcome ${feature!=="Get Registered" ? "back" : ""} ${user.username}!`;
                        $("#welcome-item").show();
                        $("#welcome-msg").text(content);
                        $("#profile-item, #sf-item").show();
                        $("#login-item, #registration-item").hide();
                    }
                    if(this.feature==="Reset password" && code===200){
                        $(twoFactorPwdResetStatus).hide();
                        $(resetPwdForm).show();
                        $(forgotPwdFormTitle).hide();
                        userConfirmToken = this.token;
                        coreMethods.setAlert();
                    } else {
                        $("#resources-container, #logout-item, #profile-item").show();
                        debugger;
                        localStorage.JWTtoken = token;
                        localStorage.currentUser = JSON.stringify(user);
                        notebooksBaseUrl = defaultUrl + `/${token}/notebooks`;
                        notesBaseUrl = defaultUrl + `/${token}/notes`;
                        coreMethods.setAlert();
                        if(this.feature!=="Login"){
                            $("#registration-message").hide();
                        }
                        if(this.feature==="Get Registered"){
                            $.ajax({
                                type: "POST",
                                url: notebooksBaseUrl,
                                data: "title=My Notebook",
                                success(response){
                                    coreMethods.loadNotebooks();
                                }
                            })
                        }
                        previouslyLoggedIn = true;
                        coreMethods.loadNotebooks();
                    }
                }
            } 
        });
    } else {
        coreMethods.setFormErrLabel(formGroup, "Missing token");
    }
});

resetPwdForm.addEventListener("submit", function(e){
    e.preventDefault();
    const password = $("#reset-password").val();
    const passwordConfirm = $("#reset-password-confirm").val();
    if(!password.length) return coreMethods.setFormErrLabel(this, "Missing password");
    else if(!passwordConfirm.length) return coreMethods.setFormErrLabel(this, "Missing password confirmation");
    else if(password!==passwordConfirm) return coreMethods.setFormErrLabel(this, "Passwords not matching");
    else {
        const url = defaultUrl + "/reset";
        $.ajax({
            type: "PUT",
            url,
            data: {
                password, 
                passwordConfirm, 
                userToken: userConfirmToken
            },
            resetPwdForm,
            success: function(response){
                const { err, token, user } = response;
                if(err){
                    return coreMethods.setFormErrLabel(this.resetPwdForm, err);
                }
                $(this.resetPwdForm).hide();
                $("#registration-item, #login-item").hide();
                $(this.resetPwdForm).children("input[type=password]").val("");
                $(
                    "#resources-container, #logout-item, #welcome-item, #profile-item, #sf-item"
                ).show();
                $("#welcome-msg").text(`Welcome back ${user.username}!`);
                localStorage.JWTtoken = token;
                localStorage.currentUser = JSON.stringify(user);
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
    coreMethods.setAlert();
    $("#login-item").removeClass("active");
    $("#registration-item").addClass("active");
    $(loginForm).hide();
    $(loginFormTitle).hide();
    $(twoFactorFormTitle).hide();
    $(twoFactorForm).hide();
    $(registrationFormTitle).show();
    $(forgotPwdForm).hide();
    $(resetPwdForm).hide();    
    $(registrationForm).show();
    $(twoFactorPwdResetStatus).hide();
    $(forgotPwdFormTitle).hide();
});

loginLink.addEventListener("click", function(e){
    e.preventDefault();
    coreMethods.setAlert();
    $("#login-item").addClass("active");
    $("#registration-item").removeClass("active");
    $(registrationForm).hide();
    $(loginFormTitle).show();
    $(twoFactorFormTitle).hide();
    $(registrationFormTitle).hide();
    $(twoFactorForm).hide();
    $(forgotPwdForm).hide();
    $(resetPwdForm).hide();    
    $(loginForm).show();
    $(twoFactorPwdResetStatus).hide();
    $(forgotPwdFormTitle).hide();
});

const registrationPhoneInput = document.getElementById("registration-phone");
const passwordInput = document.getElementById("registration-password");
const paswordConfirmInput = document.getElementById("registration-password-confirm");
const registrationFormSubmitBtn = document.querySelector("#registration-form > button[type=submit]");

registrationPhoneInput.addEventListener("input", function(e){
    e.preventDefault();
    const { value } = this;
    if(!phoneNumberRegex.exec(value) && value.length){
        const form = $(this).parents("form");
        coreMethods.setFormErrLabel(form, "Phone Number not valid");
        registrationFormSubmitBtn.setAttribute("disabled", true);
    } else {
        coreMethods.setFormErrLabel();
        registrationFormSubmitBtn.removeAttribute("disabled");
    }
}); 

paswordConfirmInput.addEventListener("input", function(e){
    e.preventDefault();
    const confirmPassword = this.value;
    const password = passwordInput.value;
    if(confirmPassword.length && password.length){
        if(confirmPassword!==password){
            const form = $(this).parents("form");
            coreMethods.setFormErrLabel(form, "passwords not matching");
            registrationFormSubmitBtn.setAttribute("disabled", true);
        } else {
            coreMethods.setFormErrLabel();
            registrationFormSubmitBtn.removeAttribute("disabled");
        }
    } else {
        coreMethods.setFormErrLabel();
        registrationFormSubmitBtn.removeAttribute("disabled");
    }
});

registrationForm.addEventListener("submit", function(e){
    e.preventDefault();
    const username = $("#regisration-username").val();
    const password = $("#registration-password").val();
    const passwordConfirm = $("#registration-password-confirm").val();
    const phoneNumber = $("#registration-phone").val();
    let errMsg;
    if(!passwordConfirm) errMsg="Missing Password confirmation"
    if(!password) errMsg="Missing password"
    if(!phoneNumber) errMsg="Missing Phone Number"
    if(!username) errMsg="Missing username"
    if(errMsg){
        coreMethods.setFormErrLabel(this, errMsg);
    } else {
        if(password!==passwordConfirm){
            coreMethods.setFormErrLabel(this, "Passwords not matching");
        } else if(!phoneNumberRegex.exec(phoneNumber)){
            coreMethods.setFormErrLabel(this, "Phone number not valid");
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
                        coreMethods.setFormErrLabel(this.form, msg);
                        $(this.form).children("input[type=password]").val("");
                    } else if(response.code===200) {
                        coreMethods.setAlert();
                        $(registrationForm).hide();
                        $(registrationFormTitle).hide();
                        $(twoFactorFormTitle).show();
                        $(twoFactorForm).show();
                        $(twoFactorPwdResetStatus).hide();
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
        (i, e)=>e.removeAttribute("disabled")
    );
});

const profileLink = document.getElementById("profile-link");
const profile = document.getElementById("user-profile");

if(localStorage.JWTtoken){
    $("#registration-form, #login-form").hide();
    $(logoutItem).show();
    $(profileLink).show();
    const { username } = JSON.parse(localStorage.currentUser);
    $("#welcome-item, #profile-item, #sf-item").show();
    $("#login-item, #registration-item").hide();
    $("#welcome-msg").text(`Welcome back ${username}!`);
    $("#resources-container").show();
} else {
    $(loginFormTitle).show();
    $("#login-item, #registration-item").show();
    $("#login-item").addClass("active");
}

// forgot pwd feature
const forgotPwdLink = document.getElementById("forgot-pwd-link");
const forgotPwdForm = document.getElementById("forgot-pwd-form");

forgotPwdLink.addEventListener("click", function(e){
    e.preventDefault();
    $(forgotPwdForm).show();
    $(loginForm).hide();
    $(loginFormTitle).hide();
    $(forgotPwdFormTitle).show();
});

forgotPwdForm.addEventListener("submit", function(e){
    e.preventDefault();
    const number = $("#forgot-phone-number").val();
    const formGroup = $(this).children(".form-group");
    if(number && number.length){
        if(phoneNumberRegex.exec(number)){
            const url = defaultUrl + "/forgot";
            const data = $(this).serialize();
            $.ajax({
                type: "POST",
                url,
                data,
                form: this,
                formGroup,
                success: function(response){
                    const { err, code } = response;
                    if(err){
                        coreMethods.setFormErrLabel(this.formGroup, err.message);
                    } else if(code===200){
                        coreMethods.setAlert();
                        $(twoFactorForm).show();
                        $(twoFactorPwdResetStatus).show();
                        $("#password-reset-status").show();
                        $(twoFactorForm).children("button[type=submit]").text("Reset password");
                        $(this.form).hide();
                    }
                }
            });
        } else {
            coreMethods.setFormErrLabel(formGroup, "Invalid phone number");
        }
    } else {
        coreMethods.setFormErrLabel(formGroup, "Missing phone number");
    }
});

profileLink.addEventListener("click", function(e){
    e.preventDefault();
    const display = profile.style.display;
    if(display==="block"){
        $(profile).hide();
        $(this).text("Show Profile");
    } else {
        $(this).text("Hide Profile");
        $(profile).show();
        $(profile).html("");
        const currentUser = JSON.parse(localStorage.currentUser);
        $(profile).append(`
        <h3 class="text-center my-4" id="update-profile-title">${ currentUser.username }'s Profile</h3>
        <form id="user-udpate-form" class="w-75 mx-auto mb-4">
            <div class="alert alert-success my-3" role="alert" id="success-profile-update-label">Profile successfully Updated!</div>
            <div class="alert alert-danger err-label my-3" role="alert"></div>
            <div class="form-group">
                <label for="update-username">Username: </label>
                <input type="text" class="form-control" id="update-username" name="username" placeholder="username" value="${ currentUser.username }">
            </div>
            <div class="form-group">
                <label for="current-password-update">Current password: </label>
                <input type="password" class="form-control" name="currentPassword" id="current-password-update" placeholder="current password">
            </div>
            <div class="form-group">
                <label for="update-password">New password: </label>
                <input type="password" class="form-control" name="password" id="update-password" placeholder="new password">
            </div>
            <div class="form-group">
                <label for="update-password-confirm">Confirm password: </label>
                <input type="password" class="form-control" name="passwordConfirm" id="update-password-confirm" placeholder="confirm new password">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update profile</button>
        </form>
        `);
    }
});

$(profile).on("submit", "#user-udpate-form", function(e){
    e.preventDefault();
    const data = $(this).serialize();
    const url = defaultUrl + "/" + localStorage.JWTtoken;
    $.ajax({
        url,
        type: "PUT",
        data,
        form: this,
        success: function(response){
            const { err, token, user } = response;
            if(err){
                $("#success-profile-update-label").hide();
                return coreMethods.setFormErrLabel(this.form, err);
            } 
            localStorage.JWTtoken = token;
            localStorage.currentUser = JSON.stringify(user);
            coreMethods.setFormErrLabel();
            $(this.form).find("input").val("")
            $("#update-username").val(user.username);
            $("#welcome-msg").text(`Welcome back ${user.username}!`);
            $("#success-profile-update-label").show();
            $("#update-profile-title").text(`${user.username}'s Profile`);
        }
    });
});