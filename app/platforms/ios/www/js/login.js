//13.74.155.237
var host = "http://13.74.155.237:8080"; // è l'indirizzo del server dove gira il servizio web. Il servizio è costituito da servlet che girano su un server Tomcat.
document.addEventListener("deviceready",checkConnection,false); // è necessario scrivere questa riga per fare in modo che le componenti phonegap possono essere chiamate una volta che il dispositivo è pronto e quindi una volta che esse sono state caricate correttamente.
//senza questo listener l'applicazione non funzionerebbe correttamente.

//funzione chiamata ogni volta che il device su cui gira l'app va offline. Visualizza con un alert il fatto che non si è più connessi alla rete.
function off(){
    navigator.notification.alert("Non sei più connesso ad Internet! L'applicazione è inutilizzabile. Attendere la connessione o chiudere l'app.",null,"Errore");
}

//funzione che permette di disabilitare il funzionamento del tasto indietro su Android
function disableBack(){
	history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}

//funzione che viene chiamata appena la pagina di login viene caricata. Se il device è offline in quel momento, viene lanciato un messaggio d'errore e l'app viene chiusa.
//l'applicazione, infatti, funziona solo ed esclusivamente online. Non vi è alcun dato in locale.
function checkConnection(){
	if(navigator.onLine == false) {
		navigator.notification.alert("Non sei connesso ad Internet. L'applicazione è inutilizzabile.",function(){
		    navigator.app.exitApp();
		},"Errore");
	}else{
	    document.addEventListener("offline", off, false);
	    disableBack();
	}
}

//funzione per rimuovere il messaggio d'errore relativo alle credenziali di login. Il messaggio viene rimosso ogni volta che si setta il focus su una delle input box.
function removeP(){
	var errore=document.getElementById("errorMessage");
	errore.style.display="none";
}

//funzione chiamata se avviene un errore di login. Viene mostrata la tipologia di errore tramite un paragrafo colorato. Rosso se la password o il nome utente sono sbagliati e blu se non sono stati inseriti.
function showSomething(xhttp){
	var jsonObject = JSON.parse(xhttp.responseText);
	var errore=document.getElementById("errorMessage");
	errore.innerHTML=jsonObject.messaggio;
	errore.style.backgroundColor="#f44336";
	errore.style.display="block";
	document.getElementById("username").value="";
	document.getElementById("password").value="";
}

//funzione chiamata al momento della pressione del pulsante "Login". Viene effettuata una chiamata alla Servlet /AuthenticationServlet e viene tentato il login.
//in caso di risposta affermativa della servlet, si viene reindirizzati alla home page dell'app. In caso di risposta negativa viene chiamata la funzione showSomething() per visualizzare il tipo di errore che è stato identificato.
function tryLogin(){
	var usern = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var xhttp = new XMLHttpRequest();
	if(usern!="" && password!=""){
	    document.getElementById("loading").style.display = "block";
		xhttp.open("POST",host+"/moviORDER/AuthenticationServlet",true);
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var risp=JSON.parse(this.responseText);
				if(risp.messaggio=="OK"){
				    var xhttp1 = new XMLHttpRequest();
				    xhttp1.open("POST",host+"/moviORDER/CheckConnectionURL",true);
				    xhttp1.onreadystatechange = function() {
				        if (xhttp1.readyState == 4 && xhttp1.status == 200) {
				            var risp2 = JSON.parse(xhttp1.responseText);
				            if(risp2.messaggio != "no"){
				                document.getElementById("loading").style.display = "none";
				                location.replace("visualizzazioneArticoli.html?codAz="+risp.codAz+"&username="+risp.username);
				            }else{
				                document.getElementById("loading").style.display = "none";
				                navigator.notification.alert("Il database di Vision è inconsistente per l'utente "+usern+".",null,"Errore");
				            }
				        }
				    };
				    xhttp1.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                    xhttp1.send("codAz="+risp.codAz);
				}else{
				    document.getElementById("loading").style.display = "none";
					showSomething(this);
				}
			}
		};
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		xhttp.send("username="+usern+"&password="+password);
	}else{
		var errore=document.getElementById("errorMessage");
		errore.innerHTML="Inserire username e password";
		errore.style.backgroundColor="#2196F3";
		errore.style.display="block";
	}
}

