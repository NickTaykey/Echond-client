// note fuzzy search feature
const searchFiled = document.getElementById("search-field");
searchFiled.addEventListener("input", function(e){
    e.preventDefault();
    const queryString = encodeURIComponent(this.value);
    const url = `${defaultUrl}/${localStorage.JWTtoken}/search?search=${queryString}`;
    if(this.value.length){
        $.get(url, function(response){
            const { err, notes, notebooks } = response;
            if(err){
                coreMethods.loginErrorHandler();
            } else {
                let newContent = "";
                notes.forEach(n=>{
                    // FIND THE NOTEBOOK ONLY WITH THE ID OF THE NOTE
                    const notebook = usersNotebooks.find(notebook=>{
                        return notebook.notes.find(note=>{
                           return note._id===n._id;
                        });
                    });
                    if(notebook)
                        newContent += coreMethods.generateNoteMarkup(n);
                });
                notesContainer.innerHTML = newContent;
                
                newContent = "";
                notebooks.forEach(n=>{
                    newContent += coreMethods.generateNotebookMarkup(n);
                });
                notebooksContainer.innerHTML = newContent;
                let type = "danger", msg = "No results found!";
                const results = notes.length + notebooks.length;
                coreMethods.setAlert();
                if(results>0){
                    type = "success"; msg = `${results} results found!`;
                }
                $("fieldset:not(#search-bar)").hide();
                coreMethods.setAlert(msg, type);
            }
        });
    } else{
        $(".alert-danger, .alert-success").hide();
        $(".alert-danger, .alert-success").text("");
        $("fieldset:not(#search-bar)").show();
        coreMethods.loadNotebooks();
    }
});

// filter notes feature
const filtersLink = document.getElementById("filters-link");
let filterPointed = false;
let filterDate = false;

filtersLink.addEventListener("click", function(e){
    e.preventDefault();
    $(profile).hide();
    $(filters).toggle();
    /* filterPointed = $(this)
        .parents("#search-filter-bar")
        .find("#filter-pointed")[0]
        .checked;
    filterDate = $(this)
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
    let startMsg = "Filters active: ", msg = "", type="success";
    if(filterDate){
        msg+="recent date,";
        notes.reverse();
    }
    // append the content of that array to the DOM
    for(let n of notes){
        $(notesContainer)
            .append(coreMethods.generateNoteMarkup(n));
    }
    
    // FILTER THE NOTES IF THEY ARE POINTED
    notes = $(notesContainer).children(".note");
    if(filterPointed){
        msg+=" pointeds,";
        coreMethods.showPointedNotes(notes);
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
        msg+=" notebooks,";
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
    if(msg.length){
        const fullMsg = startMsg + " " + msg.slice(0, msg.length-1);
        coreMethods.setAlert(fullMsg, type);
    } */
});

const resetBtn = document.getElementById("reset-search-filters-field");
resetBtn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    // show all the notebooks and notes back
    coreMethods.loadNotebooks();
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
    $(".alert-success").text("");
    $(".alert-success").hide();
    filterDate = false; filterPointed = false;
    // select the first notebook
    $(`#${usersNotebooks[0]._id} > .show-notes-btn`).click();
    $(notesContainer)
        .children(".notes")
        .show();
});
