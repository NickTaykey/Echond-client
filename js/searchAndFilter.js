// note fuzzy search feature
const searchFiled = document.getElementById("search-field");
searchFiled.addEventListener("input", function(e){
    e.preventDefault();
    const queryString = encodeURIComponent(this.value);
    const url = `${defaultUrl}/search?search=${queryString}`;
    if(this.value.length){
        $.get(url, function(response){
            const { notes, notebooks } = response;
            let newContent = "";
            notes.forEach(n=>{
                newContent += coreMethods.generateNoteMarkup(n);
            });
            notesContainer.innerHTML = newContent;
            
            newContent = "";
            notebooks.forEach(n=>{
                newContent += coreMethods.generateNotebookMarkup(n);
            });
            notebooksContainer.innerHTML = newContent;
        });
    } else coreMethods.loadNotebooks();
});

// filter notes feature
const filterNotesBtn = document.getElementById("filter-notes");
filterNotesBtn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    const filterPointed = $(this)
        .siblings("#filter-pointed")[0]
        .checked;
    const filterDate = $(this)
        .siblings("#filter-date")[0]
        .checked;

    // FILTER THE NOTES BY DATE
    // remove all the notes from the DOM
    $(notesContainer).html("");
    // find the selected notebook in the usersNotebooks array
    const notebookId = $(".selected-notebook").attr("id");
    const notebook = coreMethods.findNoteBookById(notebookId);
    let notes = [...notebook.notes];
    if(filterDate) notes.reverse();
    // append the content of that array to the DOM
    for(let n of notes){
        $(notesContainer)
            .append(coreMethods.generateNoteMarkup(n));
    }

    // FILTER THE NOTES IF THEY ARE POINTED
    notes = $(notesContainer).children(".note");
    if(filterPointed){
        for(let e of notes){
            const isPoinedLabel = $(e).find("strong").text();
            if(!(/true/gi.exec(isPoinedLabel))){
                $(e).hide();
            }
        }
    } else {
        for(let e of notes){
            $(e).show();
        }
    }

    // FILTER BY NOTEBOOK
    // find the names of the selected notebook
    const selectedNotebooks = [];
    $(".notebook-filter-item:checked")
        .siblings("label")
        .each((i, l)=>{
            const id = l.getAttribute("for")
                        .replace("filter-", "");
            selectedNotebooks.push(id);
        });
    if(selectedNotebooks.length){
        // hide all the notebooks
        $(notebooksContainer)
            .children()
            .hide();
        // show only the selected notebooks
        selectedNotebooks.forEach((id, i)=>{
            $(`#${id}`).show();
            if(i===0) 
                $(`#${id} > .show-notes-btn`).click();
        });
    } else {
        // hide all the notebooks
        $(notebooksContainer)
            .children()
            .show();
        const firstNote = $(notebooksContainer)
            .children()[0];
        $(firstNote)
            .find(".show-notes-btn")
            .click();
    }
});