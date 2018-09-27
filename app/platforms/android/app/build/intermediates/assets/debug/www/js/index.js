//Questa funzione è necessaria perché phonegap al momento dell'avvio dell'applicazione apre la pagina index.html. Siccome questa pagina è vuota occorre reinderizzare verso la pagina di login "login.html"
//Questa funzione permette appunto di reinderizzare verso la pagina di login in modo da avviare correttamente l'app.
function callLogin() {
	location.replace("login.html");
}