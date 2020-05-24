const defaultUrl = "http://localhost:8888";
let notebooksBaseUrl;
let notesBaseUrl;
let previouslyLoggedIn = false;
if(localStorage.JWTtoken){
    notebooksBaseUrl = `${defaultUrl}/${localStorage.JWTtoken}/notebooks`;
    notesBaseUrl = `${defaultUrl}/${localStorage.JWTtoken}/notes`;
    previouslyLoggedIn = true;
}
coreMethods.configureTextEditor("#note-body");