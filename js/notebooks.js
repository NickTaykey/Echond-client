const notesContainer = document.querySelector(".notes-container");
const notebooksContainer = document.querySelector(".notebooks-container");
let usersNotebooks;

// show the notes of the selected notebook
$(notebooksContainer).on("click", ".show-notes-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    // activate the former notebook show notes btn
    $(".selected-notebook > .show-notes-btn").attr("disabled", false);
    // disable show notes btn
    this.setAttribute("disabled", true);
    // remove selected state from the former selected notebook
    $(notebooksContainer)
        .find(".selected-notebook")
        .removeClass("selected-notebook");
    const notebookContainer = this.parentElement;
    // add selected state to the current showed notebook
    notebookContainer.classList.add("selected-notebook");
    const notebookId = notebookContainer.id;
    const notebook = usersNotebooks.find(n=>n._id===notebookId);
    let newContent = "";
    notebook.notes.forEach(n=>{
        newContent += coreMethods.generateNoteMarkup(n, notebook.title);
    });
    notesContainer.innerHTML = newContent;
    lastInspectedNotebook = notebookContainer;
});

// load all the notebooks
coreMethods.loadNotebooks();


$(notebooksContainer).on("click", ".edit-notebook-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    if(this.textContent==="Edit"){
        $(this).siblings("h4").hide();
        $(this).siblings(".edit-notebook-form").show();
        this.textContent = "close";
    } else {
        $(this).siblings("h4").show();
        $(this).siblings(".edit-notebook-form").hide();
        this.textContent = "Edit";
    }
});

// update a notebook
$(notebooksContainer).on("click", ".update-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).parents(".notebook").attr("id");
    const data = $(this).siblings("input").serialize();
    $.ajax({
        type: "PUT",
        url: `${notebooksBaseUrl}/${id}`,
        data,
        btn: this,
        success: function(response){
            let cont = coreMethods.clientSideNotebookErrorHandler(response);
            if(cont){
                $(this.btn)
                    .parents(".edit-notebook-form")
                    .siblings(".edit-notebook-btn")
                    .click();
                $(this.btn)
                    .parents(".edit-notebook-form")
                    .siblings("h4")
                    .text(response.notebook.title);
                // update the notebook in the userNotebooks variable
                const notebook = coreMethods.findNoteBookById(response.notebook._id);
                const notebookIndex = usersNotebooks.indexOf(notebook);
                usersNotebooks.splice(notebookIndex, 1, response.notebook);
            }
        }
    })
});

// delete a notebook
$(notebooksContainer).on("click", ".delete-notebook-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    let choice = confirm("Are You sure You want to delete this notebook?");
    if(choice){
        const $notebook = $(this).parents(".notebook");
        const id = $notebook.attr("id");
        $.ajax({
            type: "DELETE",
            url: `${notebooksBaseUrl}/${id}`,
            $notebook,
            success: function(response){
                let cont = coreMethods.clientSideNotebookErrorHandler(response);
                if(cont){
                    const notebook = usersNotebooks.find(n=>response.notebook._id===n._id);
                    const notebookIndex = usersNotebooks.indexOf(notebook);
                    usersNotebooks.splice(notebookIndex, 1);
                    // if the selected notebook gets deleted select the next
                    if(this.$notebook.hasClass("selected-notebook")){
                        this.$notebook
                            .next()
                            .find(".show-notes-btn")
                            .click();
                    }
                    this.$notebook.remove();
                    // show the first notebook notes
                    notesContainer.innerHTML = "";
                    usersNotebooks[0].notes.forEach(n=>{
                        const notebookTitle = usersNotebooks[0].title;
                        notesContainer.innerHTML += coreMethods.generateNoteMarkup(n, notebookTitle);
                    });
                }
            }
        })
    } 
});

// CREATE NOTEBOOK FEATURE

// toggle create notebook form
const createNotebookBtn = document.getElementById("create-notebook-btn");
createNotebookBtn.addEventListener("click", function(e){
    e.preventDefault();
    $(this)
        .siblings("#create-notebook-form")
        .toggle();
});

const createNotebookForm = document.getElementById("create-notebook-form");
createNotebookForm.addEventListener("submit", function(e){
    e.preventDefault();
    // create the notebook
    const data = $(this).serialize();
    $.post(notebooksBaseUrl, data, function(response){
        const { notebook } = response;
        // add the notebook to the DOM
        $(notebooksContainer)
            .append(
                coreMethods.generateNotebookMarkup(notebook)
            );
        // clean the form
        $(createNotebookForm).find("input[type=text]").val("");
        $(createNotebookBtn).click();
        // add notebook to the usersNotebooks array
        usersNotebooks.push(notebook);
        // add the notebook to the filter bar
        $("#notebooks-fiter-bar").append(
            `<li>
                <label for="filter-${notebook._id}">${notebook.title}</label>
                <input type="checkbox" id="filter-${notebook._id}" class="notebook-filter-item">
            </li>`
        );
    });
});