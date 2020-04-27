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
        })
    }
});

// show or hide edit note btn
$(notesContainer).on("click", ".edit-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const form = $(this).siblings(".edit-note-form")[0];
    coreMethods.toggleVisibility(form);
});

// update a note
$(notesContainer).on("submit", ".edit-note-form", function(e){
    e.preventDefault();
    e.stopPropagation();
    const noteElement = this.parentElement;
    const id = noteElement.getAttribute("id");
    const notebook = $(this).children(`#note-${id}-notebook`).val();
    const body =  $(this).children(`#note-${id}-body`).val();
    const $errLabel = $(this).children(".err-label");
    if(!notebook.length){
        $errLabel.text("Missing notebook!");
        $errLabel.show();
    } else if(!body.length){
        $errLabel.text("Missing body!");
        $errLabel.show();
    } else {
        const data = $(this).serialize();
        $.ajax(
            {
                url: `${notesBaseUrl}/${id}`,
                type: "PUT",
                noteElement,
                cache : false,
                processData: false,
                data,
                success: function(response){
                    let contNotebook = coreMethods.clientSideNotebookErrorHandler(response);
                    let contNote = coreMethods.clientSideNoteErrorHandler(response);    
                    if(contNote && contNotebook){
                        // remove current note 
                        const { note, notebook, oldNotebook } = response;
                        const { noteElement } = this;
                        if(notebook._id===oldNotebook._id){
                            const h3 = noteElement.children[0];
                            const pointedLabel = noteElement.children[1];
                            pointedLabel.textContent = "Pointed: " + note.pointed;
                            const form = noteElement.children[4];
                            h3.textContent = note.body;
                            form.style.display = "none";
                        } else {
                            // remove the original note from the DOM
                            $(noteElement).remove();
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
    const notebook = $(this).children("#note-notebook").val();
    const body =  $(this).children("#note-body").val();
    const $errLabel = $(this).children(".err-label");
    if(!notebook.length){
        $errLabel.text("Missing notebook!");
        $errLabel.show();
    } else if(!body.length){
        $errLabel.text("Missing note body!");
        $errLabel.show();
    } else {
        const data = $(this).serialize();
        $.ajax({
            url: notesBaseUrl, 
            data, 
            $errLabel,
            type: "POST",
            success: function(response){
                this.$errLabel.text("");
                this.$errLabel.hide();
                let contNotebook = coreMethods.clientSideNotebookErrorHandler(response);
                if(contNotebook){
                    // add note to the right notebook in the DOM and select it
                    const { note, notebook } = response;
                    const $notebookItem = $(`#${notebook._id}`);
                    $notebookItem
                        .find(".show-notes-btn")
                        .click();
                    $(notesContainer).append(
                        coreMethods.generateNoteMarkup(note, notebook.title)
                    );
                    // add updated notebook to the array usersNotebooks
                    const notebookElem = coreMethods.findNoteBookById(notebook._id);
                    const index = usersNotebooks.indexOf(notebookElem);
                    usersNotebooks.splice(index, 1, notebook);
                    // clean create note form   
                    $("#note-body").val("");
                    $("#note-notebook").val("");
                    $("#note-pointed").prop("checked", false);
                    coreMethods.toggleVisibility(createNoteForm);
                    coreMethods.setAlert("Note successfully created!", "success");
                }
             }
        });
    }
});