const filterBarToggler = document.getElementById("filter-bar-toggler");
filterBarToggler.addEventListener("click", function(e){
    e.preventDefault();
    $("#search-filter-bar").toggle();
});

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
                // FIND THE NOTEBOOK ONLY WITH THE ID OF THE NOTE
                const notebook = notebooks.find(notebook=>{
                    return notebook.notes.find(note=>{
                       return note===n._id;
                    });
                });
                if(notebook)
                    newContent += coreMethods.generateNoteMarkup(n, notebook.title);
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
        .parents("#search-filter-bar")
        .find("#filter-pointed")[0]
        .checked;
    const filterDate = $(this)
        .parents("#search-filter-bar")
        .find("#filter-date")[0]
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
        const notebookTilte = notebook.title;
        $(notesContainer)
            .append(coreMethods.generateNoteMarkup(n, notebookTilte));
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

const resetBtn = document.getElementById("reset-search-filters-field");
resetBtn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    // reset search field
    $("#search-bar")
        .find("input[type=text]")
        .val("");
    // reset notes filters
    $("#filter-bar-notes")
        .find("input[type=checkbox]")
        .prop("checked", false);
    // reset notebooks filters
    $("#filter-bar-notebooks")
        .find("input[type=checkbox]")
        .prop("checked", false);
    // show all the notebooks and notes back
    coreMethods.loadNotebooks();
    // select the first notebook
    $(`#${usersNotebooks[0]._id} > .show-notes-btn`).click();
});