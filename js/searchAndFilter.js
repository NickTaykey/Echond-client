// note fuzzy search feature
const searchFiled = document.getElementById("search-field");
searchFiled.addEventListener("input", function(e){
    e.preventDefault();
    const queryString = encodeURIComponent(this.value);
    const url = `${notesBaseUrl}/?search=${queryString}`;
    $.get(url, function(response){
        let newContent = "";
        response.notes.forEach(n=>{
            newContent += coreMethods.generateNoteMarkup(n);
        });
        noteContainer.innerHTML = newContent;
    });
});

// filter notes feature
const filterNotesBtn = document.getElementById("filter-notes");
filterNotesBtn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    const filterDate = $(this)
                        .siblings("#filter-date")[0]
                        .checked;
    const filterPointed = $(this)
                        .siblings("#filter-pointed")[0]
                        .checked;
    const url = `${notesBaseUrl}/?date=${encodeURIComponent(filterDate)}&pointed=${encodeURIComponent(filterPointed)}`;
    $.get(url, function(response){
        noteContainer.innerHTML = "";
        response.notes.forEach(n=>{
            noteContainer.innerHTML += coreMethods.generateNoteMarkup(n);
        });
    });
});