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
        const markup = 
        `
        <div class="card mb-3 notebook" id="${ notebook._id }">
            <div class="card-body">
                <div class="notebook-showcase">
                    <h5 class="card-title mr-4">${ notebook.title }</h5>
                    <div class="d-inline-block float-right">
                        <a href="#" class="btn btn-sm btn-primary show-notes-btn">
                            <i class="fas fa-eye"></i>
                        </a>
                        <a href="#" class="btn btn-sm btn-warning edit-notebook-btn">
                            <i class="fas fa-edit"></i>
                        </a>
                        <a href="#" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#delete-${ notebook._id }-modal">
                            <i class="fas fa-trash-alt"></i>
                        </a>
                        <div class="modal fade notebook-delete-modal" id="delete-${ notebook._id }-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title w-100 text-center" id="staticBackdropLabel">Are you sure to delete this notebook?</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-footer d-flex justify-content-center">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                        <button type="button" class="btn btn-danger delete-notebook-btn">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section class="edit-notebook-form mt-5">
                    <div class="alert alert-danger err-label" role="alert"></div>    
                    <input type="text" class="form-control" placeholder="Your notebook's title" name="title" value="${notebook.title}"/>
                    <button type="button" class="btn btn-warning btn-block mt-3 update-btn">Update</button>
                </section>
            </div>
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
    summarizeNoteBody(body){
        const elemsList = jQuery.parseHTML(body);
        let textContent = "";
        for(let e of elemsList){
            textContent+=e.textContent;
        }
        return textContent.slice(0, 50) + " ... ";
    },
    generateNoteMarkup(note, customNotebook){
        let updateNotebookFieldSet = `<h3 class="text-center my-3">Notebook</h3>`;
        const selectedNotebookId = $(".selected-notebook").attr("id");
        usersNotebooks.forEach(n=>{
            updateNotebookFieldSet+=
            `
            <input type="radio" name="notebook" class="notebook-radio" value="${ n._id }" id="${ note._id }-update-${ n._id }" ${ customNotebook===n._id || selectedNotebookId===n._id ? "checked" : "" }>
            <label for="${ note._id }-update-${ n._id }">${ n.title }</label>
            `;
        });
        const markup = `
        <div class="note col-12 col-lg-6 mb-4" id=${note._id}>
            <div class="mx-lg-1 card">
                <div class="card-body">
                    <div class="mb-4 d-flex justify-content-${ note.pointed ? 'between' : 'end'} controls-bar">
                        <i class="fas fa-star pointed-note-star text-warning${ note.pointed ? '' : ' d-none'}"></i>
                        <div>
                            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#show-${ note._id }-modal">
                                <i class="fas fa-search"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#delete-${ note._id }-modal">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <section class="note-body-show">${ coreMethods.summarizeNoteBody(note.body) }</section>
                    <div class="modal fade" id="delete-${ note._id }-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                            <h5 class="modal-title w-100 text-center" id="staticBackdropLabel">Are you sure to delete this note?</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>
                            <div class="modal-footer d-flex justify-content-center">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-danger delete-note-btn">Delete</button>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div class="modal fade" id="show-${ note._id }-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="btn btn-warning btn-sm edit-note-btn">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="close close-show-note-modal-btn" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body pt-0">
                                    <div class="alert alert-success my-3 show-note-modal-alert" role="alert"></div>
                                    <section class="note-view my-4">
                                        ${ note.body }
                                    </section>
                                    <form action="${ notesBaseUrl }/${ note._id }" class="edit-note-form">
                                        <div class="alert alert-danger err-label" role="alert"></div>
                                        <section class="notebooks-list-update">${ updateNotebookFieldSet }</section>
                                        <label for="note-${ note._id }-body" class="sr-only">Your Note</label>
                                        <h3 class="text-center my-3">Note</h3>
                                        <textarea class="note-body" name="body" id="note-${ note._id }-body" cols="30" rows="10">${ note.body }</textarea>
                                        <div class="my-3">
                                            <input type="checkbox" name="pointed" id="note-${ note._id }-pointed" ${ note.pointed ? "checked" : "" }>
                                            <label for="note-${ note._id }-pointed" class="ml-2 my-0">
                                                <i class="fas fa-star d-inline-block text-warning"></i> 
                                                Pointed
                                            </label>
                                        </div>
                                        <button type="submit" class="btn btn-warning btn-block mb-3">Update</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
    loadNotebooks(targetNotebook){
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
                        for(let n of notebooks){
                            notebooksFilterBar.innerHTML += 
                            `<li>
                                <input type="checkbox" id="filter-${n._id}" class="notebook-filter-item mr-2">
                                <label for="filter-${n._id}">${n.title}</label>
                            </li>`;
                        }
                        // add notebooks item to the container
                        notebooksContainer.innerHTML = "";
                        notesContainer.innerHTML = "";
                        const $notebooksList = $("#notebooks-list");
                        $notebooksList.html("<h3 class='mb-3'>Choose a Notebook</h3>");
                        for(let i = 0; i<notebooks.length; i++){
                            const notebook = notebooks[i];
                            const oldContent = notebooksContainer.innerHTML;
                            const newContent = coreMethods.generateNotebookMarkup(notebook);
                            notebooksContainer.innerHTML = oldContent + newContent;
                            usersNotebooks = notebooks;
                            $notebooksList.append(`
                            <input type="radio" name="notebook" class="notebook-radio d-inline-block ml-3 mr-1" value="${ notebook._id }" id="create-${ notebook._id }">
                            <label for="create-${ notebook._id }">${ notebook.title }</label>
                            `);
                        }
                        const notebookSelector = "#" + (targetNotebook ? targetNotebook : notebooks[0]._id);
                        $(notebookSelector).find(".show-notes-btn").click();
                    }
                }
            );
        }
    },
    findNoteBookById(id){
       return usersNotebooks.find(n=>n._id===id);
    },
    // set up an alert, reset the former
    setAlert(msg, type, html){
        if(msg && type){
            const selector = `.alert-${type}:not(.show-note-modal-alert)`;
            $(selector).show();
            if(html) $(selector).html(msg);
            else $(selector).text(msg);
        } else {
            $(".alert-danger, .alert-success").hide();
            $(".alert-danger, .alert-success").text("");
        }
    },
    setFormErrLabel(form, msg){
        $(".err-label").hide();
        $(".err-label").text("");
        if(form && msg){
            const $errLabel = $(form).children(".err-label");
            $errLabel.text(msg);
            $errLabel.show();
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