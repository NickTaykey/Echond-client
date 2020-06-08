// delete a note
$(notesContainer).on("click", ".delete-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const noteElement = $(this).parents(".note")[0];
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
                    const { note } = response;
                    $(`#delete-${ note._id }-modal`).modal("hide");
                    this.noteElement.remove();
                    // remove the note from the notebooks array
                    const { notes } = coreMethods.findNoteBookById(response.notebook._id);
                    const index = notes.indexOf(note);
                    notes.splice(index, 1);
                    coreMethods.setAlert("Note successfully deleted!", "success");
                }
            }
        }
    });
});

// show or hide edit note form
$(notesContainer).on("click", ".edit-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const $modalBody = $(this)
        .parents(".modal-header")
        .siblings(".modal-body");
    const form = $modalBody.find("form")[0];
    $modalBody.find(".note-view").toggle();
    coreMethods.toggleVisibility(form);
    const id = $(this).parents(".note").attr("id");
    const selector = `note-${id}-body`;
    if(form.style.display!=="none"){
        coreMethods.configureTextEditor(`#${selector}`);
    } else {
        tinyMCE.editors[selector].remove();
    }
});

$(".notes-container").on("click", ".close-show-note-modal-btn", function(e){
    const $form = $(this)
        .parents(".modal-header")
        .siblings(".modal-body")
        .find("form");
    const id = $form
        .find("textarea")
        .attr("id")
        .split("-")[1];
    const editor = tinyMCE.editors[`note-${ id }-body`]
    if(editor){
        editor.remove();
        coreMethods.toggleVisibility($form[0]);
    }
    $form.siblings("section").show();
});

// update a note
$(notesContainer).on("submit", ".edit-note-form", function(e){
    e.preventDefault();
    e.stopPropagation();
    const id = $(this)
        .find("textarea")
        .attr("id")
        .split("-")[1];
    const $noteElement = $(`#${id}`);
    const { activeEditor } = tinyMCE;
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
                $noteElement,
                activeEditor,
                modalEditForm: this,
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
                            const { $noteElement, modalEditForm, activeEditor } = this;
                            if(notebook._id===oldNotebook._id){
                                const $section = $noteElement.find(".note-body-show");
                                const $star = $noteElement
                                    .find(".controls-bar")
                                    .find(".fa-star");
                                $star.removeClass("d-none");
                                const $controlsBar = $noteElement.find(".controls-bar");
                                $controlsBar.removeClass(
                                    ["justify-content-end", "justify-content-between"]
                                );
                                if(!note.pointed){
                                    $star.addClass("d-none");
                                    $controlsBar.addClass("justify-content-end");
                                } else {
                                    $controlsBar.addClass("justify-content-between");
                                }
                                $section.html(coreMethods.summarizeNoteBody(note.body));
                                $(modalEditForm)
                                    .siblings(".note-view")
                                    .html(note.body);
                                $(modalEditForm)
                                    .parents(".modal-content")
                                    .find(".edit-note-btn")
                                    .click();
                                coreMethods.setAlert("Note successfully updated!", "success");
                            } else {
                                const modalSelector = `#show-${ note._id }-modal`;
                                // remove the original note from the DOM
                                $(modalSelector).modal("hide");
                                $(modalSelector).on('hidden.bs.modal', function (e) {
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
                                    activeEditor.remove();
                                    $noteElement.remove();
                                    coreMethods.setAlert("Note successfully updated!", "success");
                                });
                            }
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