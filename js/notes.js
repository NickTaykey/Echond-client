// delete a note
$(notesContainer).on("click", ".delete-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const res = confirm("Are you sure you want to delete this note?");
    if(res){
        const noteElement = this.parentElement;
        const id = noteElement.getAttribute("id");
        $.ajax({
            url: `${notesBaseUrl}/${id}`,
            type: "DELETE",
            noteElement,
            success: function(response){
                const { err } = response;
                if(err){
                    coreMethods.loginErrorHandler();
                } else {
                    let contNotebook = coreMethods.clientSideNotebookErrorHandler(response);
                    let contNote = coreMethods.clientSideNoteErrorHandler(response);  
                    if(contNote && contNotebook){
                        this.noteElement.remove();
                        // remove the note from the notebooks array
                        const { note } = response;
                        const { notes } = coreMethods.findNoteBookById(response.notebook._id);
                        const index = notes.indexOf(note);
                        notes.splice(index, 1);
                        coreMethods.setAlert("Note successfully deleted!", "success");
                    }
                }
            }
        })
    }
});

// show or hide edit note btn
$(notesContainer).on("click", ".edit-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const form = $(this).siblings(".edit-note-form")[0];
    coreMethods.toggleVisibility(form);
    const id = $(this).parents(".note").attr("id");
    const selector = `note-${id}-body`;
    if(form.style.display!=="none"){
        coreMethods.configureTextEditor(`#${selector}`);
    } else {
        tinyMCE.editors[selector].remove();
    }
});

// update a note
$(notesContainer).on("submit", ".edit-note-form", function(e){
    e.preventDefault();
    e.stopPropagation();
    const noteElement = this.parentElement;
    const { activeEditor } = tinyMCE;
    const id = noteElement.getAttribute("id");
    const notebook = $(this).children(".notebooks-list-update").children("input[type=radio]:checked").val();
    const body =  activeEditor.getContent();
    const pointed = $(`#note-${ id }-pointed`).prop("checked");
    if(!notebook){
        coreMethods.setFormErrLabel(this, "Missing notebook!");
    } else if(!body.length){
        coreMethods.setFormErrLabel(this, "Missing body!");
    } else {
        const data = { body, notebook, pointed };
        $.ajax(
            {
                url: `${notesBaseUrl}/${id}`,
                type: "PUT",
                noteElement,
                activeEditor,
                data,
                success: function(response){
                    const { err } = response;
                    if(err){
                        coreMethods.loginErrorHandler();
                    } else {
                        let contNotebook = coreMethods.clientSideNotebookErrorHandler(response);
                        let contNote = coreMethods.clientSideNoteErrorHandler(response);    
                        if(contNote && contNotebook){
                            // remove current note 
                            const { note, notebook, oldNotebook } = response;
                            const { noteElement } = this;
                            if(notebook._id===oldNotebook._id){
                                const section = noteElement.children[0];
                                const pointedLabel = noteElement.children[1];
                                pointedLabel.textContent = `Pointed: ${ note.pointed }`;
                                const form = noteElement.children[4];
                                section.innerHTML = note.body;
                                form.style.display = "none";
                            } else {
                                // remove the original note from the DOM
                                $(noteElement).remove();
                                this.activeEditor.remove();
                                // update usersNotebooks
                                // remove the note from the old notebook
                                let clientNotebook = coreMethods.findNoteBookById(oldNotebook._id);
                                let notebookIndex = usersNotebooks.indexOf(clientNotebook);
                                let clientNote = usersNotebooks[notebookIndex].notes.find(n=>n._id===note._id);
                                let noteIndex = usersNotebooks[notebookIndex].notes.indexOf(clientNote);
                                usersNotebooks[notebookIndex].notes.splice(noteIndex, 1);
                                // add the note to the new notebook
                                clientNotebook = coreMethods.findNoteBookById(notebook._id);
                                notebookIndex = usersNotebooks.indexOf(clientNotebook);
                                usersNotebooks[notebookIndex].notes.push(note);
                                // select the new notebook
                                const $notebookElement = $(`#${notebook._id}`);
                                // show the notes
                                $notebookElement
                                    .find(".show-notes-btn")
                                    .click();
                            }
                            coreMethods.setAlert("Note successfully updated!", "success");
                        }
                    }
                }
            }
        );
    }
});

// show or hide note create form
const createNoteBtn = document.getElementById("create-note-btn");
createNoteBtn.addEventListener("click", function(e){
    e.preventDefault();
    const form = this.nextElementSibling;
    coreMethods.toggleVisibility(form);
});

// create the note
const createNoteForm = document.getElementById("create-note-form");
createNoteForm.addEventListener("submit", function(e){
    e.preventDefault();
    const notebook = $("#notebooks-list").children(".notebook-radio:checked").val();
    const activeEditor = tinyMCE.activeEditor;
    const body = activeEditor.getContent();
    const pointed = $(this).find("#note-pointed").prop("checked")
    if(!notebook){
        coreMethods.setFormErrLabel(this, "Missing notebook!");
    } else if(!body.length){
        coreMethods.setFormErrLabel(this, "Missing note body!");
    } else {
        $.ajax({
            url: notesBaseUrl, 
            data: { notebook, body, pointed }, 
            activeEditor,
            createNoteForm: this,
            type: "POST",
            success: function(response){
                const { err } = response;
                if(err){
                    coreMethods.loginErrorHandler();
                } else {
                    coreMethods.setFormErrLabel();
                    let contNotebook = coreMethods.clientSideNotebookErrorHandler(response);
                    if(contNotebook){
                        // add note to the right notebook in the DOM and select it
                        const { note, notebook } = response;
                        const $notebookItem = $(`#${notebook._id}`);
                        $notebookItem
                            .find(".show-notes-btn")
                            .click();
                        $(notesContainer).append(
                            coreMethods.generateNoteMarkup(note)
                        );
                        this.activeEditor.setContent("");
                        this.activeEditor.remove();
                        coreMethods.configureTextEditor("#note-body");
                        // add updated notebook to the array usersNotebooks
                        const notebookElem = coreMethods.findNoteBookById(notebook._id);
                        const index = usersNotebooks.indexOf(notebookElem);
                        usersNotebooks.splice(index, 1, notebook);
                        // clean create note form   
                        $(this.createNoteForm)
                            .find("#note-pointed, .notebook-radio")
                            .prop("checked", false);
                        coreMethods.toggleVisibility(createNoteForm);
                        coreMethods.setAlert("Note successfully created!", "success");
                    }
                }
             }
        });
    }
});