const defaultUrl = "http://localhost:8888";
let notebooksBaseUrl;
let notesBaseUrl;
let previouslyLoggedIn = false;
if(localStorage.JWTtoken){
    notebooksBaseUrl = `${defaultUrl}/${localStorage.JWTtoken}/notebooks`;
    notesBaseUrl = `${defaultUrl}/${localStorage.JWTtoken}/notes`;
    previouslyLoggedIn = true;
    const h1 = document.querySelector("h1");
    const { currentUser } = localStorage;
    const newContent = `Welcome back to the note app ${JSON.parse(currentUser).username}!`;
    h1.textContent = newContent;
}
coreMethods.configureTextEditor("#note-body");