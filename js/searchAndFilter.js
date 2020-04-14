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
})