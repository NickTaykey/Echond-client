const coreMethods = {
    // toggle from display none to block or viceversa
    toggleVisibility(element){
        const display = element.style.display;
        element.style.display = display==="block" ? "none" : "block";
    },
    sharedNoteBadge: "<span class='shared-note-badge'>Shared</span>",
    generateNotebookMarkup(notebook){
        const markup = `
        <div class="notebook" id=${notebook._id}>
            <h4 class="title">${ notebook.title }</h4>
            <section class="edit-notebook-form">
                <div class="err-label"></div>
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
            let msg = "You have to be logged in to do that";
            if(response.err==="user not found"){
                msg = response.err;
            }
            coreMethods.setAlert(msg, "danger");
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
    generateNoteMarkup(note, notebookTitle){
        const markup = `
        <div class="note" id=${note._id}>
            <h4 class="title">${ note.body }</h4>
            <strong>Pointed: ${ note.pointed }</strong>
            <button type="button" class="edit-note-btn" id="">Edit</button>
            <button type="button" class="delete-note-btn">Delete Note</button>
            <button type="button" class="share-note-btn">Share Note</button>
            <section class="find-user-section">
                <input type="text" name="username" placeholder="search by username">
                <ul class="user-found"></ul>
            </section>
            <form class="edit-note-form">
                <div class="err-label"></div>
                <label for="note-notebook">Notebook:</label>
                <input type="text" placeholder="title of the notebook" name="notebookTitle" id="note-${ note._id }-notebook" value="${ notebookTitle }">
                </br>
                <label for="note-${ note._id }-body">Your Note</label>
                <textarea name="body" id="note-${ note._id }-body" cols="30" rows="10">${ note.body }</textarea>
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
        $("#resources-container, #logout-link").hide();
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
                        for(let i = 0; i<notebooks.length; i++){
                            const note = notebooks[i];
                            const oldContent = notebooksContainer.innerHTML;
                            const newContent = coreMethods.generateNotebookMarkup(note);
                            notebooksContainer.innerHTML = oldContent + newContent;
                            usersNotebooks = notebooks;
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
        const $alertDanger = $(".alert-danger");
        $alertDanger.text();
        $alertDanger.hide();
        const $alertSuccess = $(".alert-success");
        $alertSuccess.text()
        $alertSuccess.hide();
        $(`.alert-${type}`).show();
        $(`.alert-${type}`).html(`<h4>${msg}</h4>`);
        if(!msg && !type){
            $alertDanger.hide();
            $alertDanger.text("");
            $alertSuccess.hide();
            $alertSuccess.text("");
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