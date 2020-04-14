const noteContainer = document.querySelector(".container");

// get all the notes
$.get(
    notesBaseUrl, 
    function(response){
        const { notes } = response;
        for(let i = 0; i<notes.length; i++){
            const note = notes[i];
            const oldContent = noteContainer.innerHTML;
            const newContent = coreMethods.generateNoteMarkup(note);
            noteContainer.innerHTML = oldContent + newContent;
        }        
    }
);

// delete a note
$(noteContainer).on("click", ".delete-note-btn", function(e){
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
            this.noteElement.remove();
            alert("note successfully removed!");
           }
        })
    }
});

// show or hide edit note btn
$(noteContainer).on("click", ".edit-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const form = $(this).siblings(".edit-note-form")[0];
    coreMethods.toggleVisibility(form);
});

// update a note
$(noteContainer).on("submit", ".edit-note-form", function(e){
    e.preventDefault();
    e.stopPropagation();
    const data = $(this).serialize();
    const noteElement = this.parentElement;
    const id = noteElement.getAttribute("id");
    $.ajax(
        {
            url: `${notesBaseUrl}/${id}`,
            type: "PUT",
            noteElement,
            cache : false,
            processData: false,
            data,
            success: function(response){
                const h3 = this.noteElement.children[0];
                const form = this.noteElement.children[3];
                h3.textContent = response.note.body;
                form.style.display = "none";
            }
        }
    );
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
    const data = $(this).serialize();
    $.post(notesBaseUrl, data, function(response){
        const { note } = response;
        const previousContent = noteContainer.innerHTML;
        const newContent = coreMethods.generateNoteMarkup(note);
        noteContainer.innerHTML = newContent + previousContent;
        const textarea = createNoteForm.children[1];
        textarea.value = "";
        const pointedCheckBox = createNoteForm.children[3];
        pointedCheckBox.checked = false;
        coreMethods.toggleVisibility(createNoteForm);
    });
});