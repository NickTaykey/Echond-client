const container = document.querySelector(".container");
$.get(
    notesBaseUrl, 
    function(response){
        const { notes } = response;
        for(let i = 0; i<notes.length; i++){
            const oldContent = container.innerHTML;
            const newContent = 
            `
            <div class="note" id=${notes[i]._id}>
                <h3 class="title">${ notes[i].body }</h3>
                <button type="button" class="delete-note-btn">Delete Note</button>
                <button type="button" class="edit-note-btn" id="">Edit</button>
                <form action="${ notesBaseUrl }/${ notes[i]._id }" class="edit-note-form">
                    <label for="note-${ notes[i]._id }-body">Your Note</label>
                    <textarea name="body" id="note-${ notes[i]._id }-body" cols="30" rows="10">${ notes[i].body }</textarea>
                    <label for="note-${ notes[i]._id }-pointed">Pointed</label>
                    <input type="checkbox" name="pointed" id="note-${ notes[i]._id }-pointed">
                    <button type="submit">Update</button>
                </form>
            </div>
            `;
            container.innerHTML = oldContent + newContent;
        }        
    }
);

$(container).on("click", ".delete-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const res = confirm("Are you sure you want to delete this note?");
    if(res){
        // delete the note
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

$(container).on("click", ".edit-note-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    $(this).siblings("form").toggle();
});

$(container).on("submit", ".edit-note-form", function(e){
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
                debugger;
            }
        }
    );
});