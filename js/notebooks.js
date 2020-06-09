const notesContainer = document.querySelector(".notes-container");
const notebooksContainer = document.querySelector(".notebooks-container");
let usersNotebooks = [];

// show the notes of the selected notebook
$(notebooksContainer).on("click", ".show-notes-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    // activate the former notebook show notes btn
    $(".selected-notebook")
        .find(".show-notes-btn")
        .removeClass("disabled");
    // disable show notes btn
    $(this)
        .addClass("disabled")
        .css({ boxShadow: "none" });
    // remove selected state from the former selected notebook
    $(notebooksContainer)
        .find(".selected-notebook")
        .removeClass("selected-notebook");
    const notebookContainer = $(this).parents(".notebook")[0];
    // add selected state to the current showed notebook
    notebookContainer.classList.add("selected-notebook");
    const notebookId = notebookContainer.id;
    const notebook = usersNotebooks.find(n=>n._id===notebookId);
    let newContent = "";
    const notes = [...notebook.notes];
    if(filterDate){
        notes.reverse();
    }
    notes.forEach(n=>{
        newContent += coreMethods.generateNoteMarkup(n);
    });
    notesContainer.innerHTML = newContent;
    if(filterPointed){
        const $notes = $(notesContainer).children(".note");
        coreMethods.showPointedNotes($notes);
    }
    lastInspectedNotebook = notebookContainer;
});

// load all the notebooks
coreMethods.loadNotebooks();


$(notebooksContainer).on("click", ".edit-notebook-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const $div = $(this).parents("div");
    const title = $div.siblings(".card-title").text();
    $div.siblings("section").find("input").val(title);
    coreMethods.setAlert();
    $div.siblings(".card-title").toggle();
    $div.siblings(".edit-notebook-form").toggle();
});

// update a notebook
$(notebooksContainer).on("click", ".update-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).parents(".notebook").attr("id");
    const data = $(this).siblings("input").serialize();
    const titleField = $(this).siblings("input[type=text]").val();
    const originalTitle = $(this)
        .parents("section")
        .siblings(".notebook-showcase")
        .find(".card-title")
        .text();
    const editForm = $(this).parents(".edit-notebook-form")[0];
    if(!titleField.length){
        coreMethods.setFormErrLabel(editForm, "Provide a title");
    } else {
        const n = usersNotebooks.find(n=>n.title===titleField);
        if(n && originalTitle!==titleField){
            coreMethods.setFormErrLabel(editForm, "Notebook already existing");
        } else {
            $.ajax({
                type: "PUT",
                url: `${notebooksBaseUrl}/${id}`,
                data,
                btn: this,
                success: function(response){
                    const { err } = response;
                    if(err){
                        coreMethods.loginErrorHandler();
                    } else {
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
                            $("#search-field").val("");
                            $("#sf-item").show();
                            coreMethods.setFormErrLabel();
                            coreMethods.loadNotebooks();
                            coreMethods.setAlert("Notebook successfully updated!", "success");
                        }
                    }
                }
            });
        }
    }
});

// delete a notebook
$(notebooksContainer).on("click", ".delete-notebook-btn", function(e){
    e.preventDefault();
    e.stopPropagation();
    const $notebook = $(this).parents(".notebook");
    const id = $notebook.attr("id");
    $.ajax({
        type: "DELETE",
        url: `${notebooksBaseUrl}/${id}`,
        $notebook,
        success: function(response){
            const { err } = response;
            if(err){
                coreMethods.loginErrorHandler();
            } else {
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
                    // show the first notebook notes
                    notesContainer.innerHTML = "";
                    if(usersNotebooks[0]){
                        usersNotebooks[0].notes.forEach(n=>{
                            notesContainer.innerHTML += coreMethods.generateNoteMarkup(n);
                        });
                    }
                    $(`#delete-${ notebook._id }-modal`).modal('hide');
                    $("#search-field").val("");
                    $("#sf-item").show();
                    coreMethods.loadNotebooks();
                    coreMethods.setAlert("Notebook successfully deleted!", "success");
                }
            }
        }
    })
});

// CREATE NOTEBOOK FEATURE

// toggle create notebook form
const createNotebookBtn = document.getElementById("create-notebook-btn");
createNotebookBtn.addEventListener("click", function(e){
    e.preventDefault();
    $(this)
        .siblings("#create-notebook-form")
        .toggle();
    coreMethods.setAlert();
});

const createNotebookForm = document.getElementById("create-notebook-form");
createNotebookForm.addEventListener("submit", function(e){
    e.preventDefault();
    const titleField = $("input[name=title]").val();
    if(!titleField.length){
        coreMethods.setFormErrLabel(this, "Provide a title");
    } else {
        const n = usersNotebooks.find(n=>n.title===titleField); 
        if(n){
            coreMethods.setFormErrLabel(this, "Notebook already existing");
        } else {
            // create the notebook
            const data = $(this).serialize();
            $.ajax({
                url: notebooksBaseUrl, 
                type: "POST",
                data, 
                success: function(response){
                    const { err, notebook } = response;
                    if(err){
                        coreMethods.loginErrorHandler();
                    } else {
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
                        $("#search-field").val("");
                        $("#sf-item").show();
                        $("#no-notebooks-label").remove();
                        coreMethods.setFormErrLabel();
                        coreMethods.loadNotebooks();
                        coreMethods.setAlert("Notebook successfully added!", "success");
                    }

                }
            });
        }
    }
});

$(".notebooks-bar-toggler").click(function(e){
    e.preventDefault();
    const $notebooksBar = $("#notebooks-bar");
    $notebooksBar.collapse('toggle');
    $(".notebooks-bar-toggler").toggle("fast");
    const $notesBar = $("#notes-bar");
    $notesBar.toggleClass("col-lg-8");
    const $createNoteBtn = $("#create-note-btn");
    $createNoteBtn.toggleClass("create-note-btn-on");
    $("#header-row").toggleClass("mb-4")
    $(".note")
        .toggleClass(["col-lg-6", "col-lg-4"])
});