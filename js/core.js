const coreMethods = {
    // toggle from display none to block or viceversa
    toggleVisibility(element){
        const display = element.style.display;
        element.style.display = display==="block" ? "none" : "block";
    },
    configureTextEditor(selector){
        tinymce.init({
            selector,
            height: 300,
            menubar: false, 
            content_style: "*{ font-family: 'Roboto'; }",
            plugins: [
                'lists table link hr',
            ],
            toolbar: 'undo redo | formatselect | ' +
            'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | ' + 'table tabledelete' + ' | link hr',
        });
    },
    generateNotebookMarkup(notebook){
        const markup = `
        <div class="notebook" id=${notebook._id}>
            <h4 class="title">${ notebook.title }</h4>
            <section class="edit-notebook-form">
                <div class="alert alert-danger alert-dismissible fade show err-label" role="alert">
                    <strong></strong>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>    
                <input type="text" placeholder="Your notebook's title" name="title" value="${notebook.title}">
                <button type="button" class="update-btn">Update</button>
            </section>
            <button type="button" class="show-notes-btn">Show Notes</button>
            <button type="button" class="edit-notebook-btn">Edit</button>
            <button type="button" class="delete-notebook-btn">Delete</button>
        </div>
        `;
        return markup; 
    },
    clientSideNoteErrorHandler(response){
        if(response.code===404 && response.resource==="Note"){
            coreMethods.setAlert("404 note not found!", "danger");
            return false;
        } else if(response.code===403 && response.resource==="Note"){
            coreMethods.setAlert("403 action not allowed!", "danger");
            return false;
        } else if(response.err){
            coreMethods.setAlert("You have to be logged in to do that", "danger");
            return false;
        }
        return true;
    },
    clientSideNotebookErrorHandler(response){
        if(response.code===404 && response.resource==="Notebook"){ 
            coreMethods.setAlert("404 notebook not found!", "danger");
            return false;
        } else if(response.code===403 && response.resource==="Notebook"){
            coreMethods.setAlert("403 action not allowed!", "danger");
            return false;
        } else if(response.err){
            coreMethods.setAlert("You have to be logged in to do that", "danger");
            return false;
        }
        return true;
    },
    generateNoteMarkup(note){
        let updateNotebookFieldSet = `<h3>Notebook</h3>`;
        const selectedNotebookId = $(".selected-notebook").attr("id");
        usersNotebooks.forEach(n=>{
            updateNotebookFieldSet+=
            `
            <input type="radio" name="notebook" class="notebook-radio" value="${ n._id }" id="${ note._id }-update-${ n._id }" ${ selectedNotebookId===n._id ? "checked" : "" }>
            <label for="${ note._id }-update-${ n._id }">${ n.title }</label>
            `;
        });
        const markup = `
        <div class="note" id=${note._id}>
            <section class="note-body-show">${ note.body }</section>
            <strong>Pointed: ${ note.pointed }</strong>
            <button type="button" class="edit-note-btn">Edit</button>
            <button type="button" class="delete-note-btn">Delete Note</button>
            <form action="${ notesBaseUrl }/${ note._id }" class="edit-note-form">
                <div class="alert alert-danger alert-dismissible fade show err-label" role="alert">
                    <strong></strong>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <br>
                <section class="notebooks-list-update">${ updateNotebookFieldSet }</section>
                <br>
                <label for="note-${ note._id }-body">Your Note</label>
                <textarea class="note-body" name="body" id="note-${ note._id }-body" cols="30" rows="10">${ note.body }</textarea>
                </br>
                <label for="note-${ note._id }-pointed">Pointed</label>
                <input type="checkbox" name="pointed" id="note-${ note._id }-pointed" ${ note.pointed ? "checked" : "" }>
                </br>
                <button type="submit">Update</button>
            </form>
        </div>
        `;
        return markup; 
    },
    loginErrorHandler(){
        $("#resources-container, #logout-link, #profile-link").hide();
        $("#login-form").show();
        delete localStorage.JWTtoken;
        if(previouslyLoggedIn){
            coreMethods.setAlert("You have to be logged in to do that, session expired", "danger");
        }
        previouslyLoggedIn = false;
    },
    loadNotebooks(){
        if(localStorage.JWTtoken){
            // get all the notebooks
            $.get(
                notebooksBaseUrl, 
                function(response){
                    // add notebooks to the filter-bar
                    const { err, notebooks } = response;
                    if(err){
                        coreMethods.loginErrorHandler();
                    } else {
                        const notebooksFilterBar = document.getElementById("notebooks-fiter-bar");
                        notebooksFilterBar.innerHTML = "";
                        notebooksFilterBar.innerHTML = "";
                        for(let n of notebooks){
                            notebooksFilterBar.innerHTML += 
                            `<li>
                                <label for="filter-${n._id}">${n.title}</label>
                                <input type="checkbox" id="filter-${n._id}" class="notebook-filter-item">
                            </li>`;
                        }
                        // add notebooks item to the container
                        notebooksContainer.innerHTML = "";
                        notesContainer.innerHTML = "";
                        const $notebooksList = $("#notebooks-list");
                        $notebooksList.html("<h3>Choose a Notebook</h3>");
                        for(let i = 0; i<notebooks.length; i++){
                            const notebook = notebooks[i];
                            const oldContent = notebooksContainer.innerHTML;
                            const newContent = coreMethods.generateNotebookMarkup(notebook);
                            notebooksContainer.innerHTML = oldContent + newContent;
                            usersNotebooks = notebooks;
                            $notebooksList.append(`
                            <input type="radio" name="notebook" class="notebook-radio" value="${ notebook._id }" id="create-${ notebook._id }">
                            <label for="create-${ notebook._id }">${ notebook.title }</label>
                            `);
                            $(`#${notebooks[0]._id} > .show-notes-btn`).click();
                        }
                    }
                }
            );
        }
    },
    findNoteBookById(id){
       return usersNotebooks.find(n=>n._id===id);
    },
    // set up an alert, reset the former
    setAlert(msg, type){
        let strong;
        const $alertDanger = $(".alert-danger");
        strong = $alertDanger.find("strong");
        strong.text("");
        $alertDanger.hide();
        const $alertSuccess = $(".alert-success");
        strong = $alertSuccess.find("strong");
        strong.text("");
        $alertSuccess.hide();
        if(msg && type){
            $(`.alert-${type}`).show();
            $(`.alert-${type}`).find("strong").text(msg);
            $(`.alert-${type}`).on('closed.bs.alert', function () {
                this.remove();
                $("nav").after(
                    `
                    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                        <strong></strong>
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    `
                );
            });
        }
    },
    setFormErrLabel(form, msg){
        $(".err-label").hide();
        $(".err-label").find("strong").text("");
        if(form && msg){
            const $errLabel = $(form).children(".err-label");
            $errLabel.find("strong").text(msg);
            $errLabel.show();
            $errLabel.on('closed.bs.alert', function () {
                this.remove();
                $(form).prepend(
                    `
                    <div class="alert alert-danger alert-dismissible fade show err-label" role="alert">
                        <strong></strong>
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    `
                );
            });
        }
    },
    showPointedNotes(notes){
        for(let e of notes){
            const isPoinedLabel = $(e).find("strong").text();
            if(!(/true/gi.exec(isPoinedLabel))){
                $(e).hide();
            }
        }
    }

}