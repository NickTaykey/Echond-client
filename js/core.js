const coreMethods = {
    // toggle from display none to block or viceversa
    toggleVisibility(element){
        const display = element.style.display;
        element.style.display = display==="block" ? "none" : "block";
    },
    generateNoteMarkup(note){
        const markup = `
        <div class="note" id=${note._id}>
            <h3 class="title">${ note.body }</h3>
            <strong>Pointed: ${ note.pointed }</strong>
            <button type="button" class="edit-note-btn" id="">Edit</button>
            <button type="button" class="delete-note-btn">Delete Note</button>
            <form action="${ notesBaseUrl }/${ note._id }" class="edit-note-form">
                <label for="note-${ note._id }-body">Your Note</label>
                <textarea name="body" id="note-${ note._id }-body" cols="30" rows="10">${ note.body }</textarea>
                <label for="note-${ note._id }-pointed">Pointed</label>
                <input type="checkbox" name="pointed" id="note-${ note._id }-pointed" ${ note.pointed ? "checked" : "" }>
                <button type="submit">Update</button>
            </form>
        </div>
        `;
        return markup; 
    }

}