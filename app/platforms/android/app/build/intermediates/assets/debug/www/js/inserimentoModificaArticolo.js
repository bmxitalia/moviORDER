var host = "http://13.74.155.237:8080"; // è l'indirizzo del server dove gira il servizio web. Il servizio è costituito da servlet che girano su un server Tomcat.
var urlString = window.location.href; // è l'URL della pagina corrente. Serve prendere questo dato perché contiene dei parametri passati in GET dalla pagina precedente.
var url = new URL(urlString);
var codiceArticolo = url.searchParams.get("codArt"); //è il codice articolo dell'articolo che si vuole inserire/modificare
var username = url.searchParams.get("username");//è lo username dell'utente loggato all'applicazione
var mode = url.searchParams.get("mode");//è la modalità con cui è stata aperta la pagina. Può essere in inserimento (insert) o in modifica (update)
var codAzienda = url.searchParams.get("codAz");//è il codice azienda dell'azienda fornitrice dell'utente loggato
var connectUrl = "";//è la stringa di connessione al database dell'azienda presente sul server cloud di Vision o su un server dell'azienda stessa. Questa stringa viene passata di pagina in pagina per diminuire le interazioni con il db.
var descrizione = "";//è il nome dell'articolo
var noteA = "";//sono le note dell'articolo
var qtaMin = "";//è la quantità minima ordinabile dell'articolo
var qtaMul = "";

//funzione chiamata ogni volta che il device su cui gira l'app va offline. Visualizza con un alert il fatto che non si è più connessi alla rete.
function off(){
    navigator.notification.alert("Non sei più connesso ad Internet! L'applicazione è inutilizzabile. Attendere la connessione o chiudere l'app.",null,"Errore");
}

//funzione chiamata quando tutto il contenuto della pagina è caricato. In questo caso quando la form di modifica/inserimento è stata tutta caricata. Permette di disabilitare il loader che mostra il caricamento della pagina.
function removeLoader() {
    document.getElementById("loading").style.display = "none";
}

document.addEventListener("offline", off, false); // è necessario scrivere questa riga per fare in modo che le componenti phonegap possono essere chiamate una volta che il dispositivo è pronto e quindi una volta che esse sono state caricate correttamente.
//senza questo listener l'applicazione non funzionerebbe correttamente.

//funzione chiamata al momento del caricamento della pagina. Se la pagina viene aperta in modalità di inserimento allora viene settata solo la testata della pagina con codice e descrizione dell'articolo (chiamata a servlet /GetArticleDesc). Mentre se la pagina
//viene aperta in modalità di modifica, oltre alla testata, vengono settate la quantità e le note (chiamata a servlet /GetTmpArticleData) già presenti per tale articolo e tale utente loggato in tabella TmpRig nel db dell'azienda. Il pulsante "Info articolo" viene settato con le note per tale articolo nella tabella Art.
function setDescrizioneQtaNote(){
    var selectQta = document.getElementById("selectQta");
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",host+"/moviORDER/GetArticleDesc",true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var resp = JSON.parse(this.responseText);
			connectUrl = resp.path;
			descrizione = resp.descrizione;
			noteA = resp.note;
			qtaMin = resp.qta;
			qtaMul = resp.qtaMul;
			selectQta.setAttribute("min",qtaMin);
            selectQta.value = qtaMin;
            if(resp.qtaMul == 1){
                selectQta.setAttribute("step","0.01");
                qtaMul = 0.01;
            }else{
                selectQta.setAttribute("step",qtaMul);
            }
			if(noteA == undefined || noteA == ""){
            	var btn = document.getElementById("infoButton");
            	btn.style.color = "red";
            	btn.style.border = "3px solid red";
            	noteA = "Non ci sono note per l'articolo.";
            }
			document.getElementById("articleDesc").innerHTML=codiceArticolo+"<br/>"+descrizione;
			if(mode == "update"){
				var xhttp1 = new XMLHttpRequest();
				xhttp1.open("POST",host+"/moviORDER/GetTmpArticleData",true);
				xhttp1.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var resp = JSON.parse(this.responseText);
						document.getElementById("note").value=resp.note;
						selectQta.value=resp.quantita;
					}
				};
				xhttp1.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
				xhttp1.send("username="+username+"&path="+connectUrl+"&codArt="+codiceArticolo);
			}
			removeLoader();
		}
	};
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send("codArt="+codiceArticolo+"&codAz="+codAzienda);
}

//funzione chiamata se viene premuto il pulsante "Info articolo". Permette di visualizzare le note relative all'articolo.
function displayArticleNote(){
	navigator.notification.alert(noteA,null,"Info articolo");
}

//funzione chiamata se viene premuto il pulsante "OK". Se la modalità della pagina è "inserimento" allora viene eseguita una query di insert sulla tabella TmpRig.
//Se la modalità della pagina è "modifica" allora viene eseguita una query di update sulla tabella TmpRig. Viene chiamata la servlet /InsertUpdateArtcile.
function confirmInsert(){
	var elem = document.getElementById("selectQta");
	if(elem.value == ""){
	    navigator.notification.alert("La quantità è un campo obbligatorio.",null,"Info");
	}else{
	    elem.setCustomValidity("");
        if(!elem.checkValidity()){
        	elem.setCustomValidity("La quantità non può essere minore di "+qtaMin+", deve avere massimo due cifre decimali e andare a multipli di "+
                                   				qtaMul+".");
        	navigator.notification.alert(elem.validationMessage,null,"Errore");
        }else{
        	var qta = elem.value;
            var note = document.getElementById("note").value;
            var query = "";
            if(mode == "insert"){
                query = "insert into TmpRig(Username,CodArt,Quantita,Note) values ('"+
                	username+"','"+codiceArticolo+"',"+qta+",'"+note+"')";
            }else if(mode == "update"){
                query = "update TmpRig set Quantita='"+qta+"',Note='"+note+"' where Username='"+username+
                	"' and CodArt='"+codiceArticolo+"'";
            }
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST",host+"/moviORDER/InsertUpdateArticle",true);
            xhttp.onreadystatechange = function() {
            	if (this.readyState == 4 && this.status == 200) {
            		var resp = JSON.parse(this.responseText);
            		if(resp.messaggio == "done"){
            			location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
                             username);
            		}else{
            			navigator.notification.alert("Inserimento/modifica fallita. Sono presenti problemi nel database.",null,"Errore");
            		}
            	}
            };
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            xhttp.send("query="+query+"&path="+connectUrl);
        }
	}
}

//funzione chiamata se viene premuto il pulsante "Annulla". La pagina di inserimento/modifica viene chiusa e viene ricaricata la home page. Il tutto senza effettuare alcuna modifica nella tabella TmpRig. Il tutto viene lasciato inalterato in tale tabella.
function cancelInsert(){
	location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
			username);
}