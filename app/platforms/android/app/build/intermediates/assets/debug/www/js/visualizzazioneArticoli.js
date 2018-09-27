var host = "http://13.74.155.237:8080"; // è l'indirizzo del server dove gira il servizio web. Il servizio è costituito da servlet che girano su un server Tomcat.
var urlString = window.location.href; // è l'URL della pagina corrente. Serve prendere questo dato perché contiene dei parametri passati in GET dalla pagina precedente.
var url = new URL(urlString);
var codAzienda = url.searchParams.get("codAz"); //è il codice azienda dell'azienda fornitrice dell'utente loggato
var username = url.searchParams.get("username"); //è lo username dell'utente loggato all'applicazione
var connectionUrl = "";//è la stringa di connessione al database dell'azienda presente sul server cloud di Vision o su un server dell'azienda stessa. Questa stringa viene passata di pagina in pagina per diminuire le interazioni con il db.
var codCliFor = ""; //è il codice cliente dell'utente loggato all'applicazione
var desCliFor = ""; //è il nome dell'utente loggato all'applicazione
var desDoc = ""; //è il codice del documento che deve essere generato per l'utente
var codDoc = ""; //è il nome (tipologia) del documento che deve essere generato per l'utente

//funzione chiamata ogni volta che il device su cui gira l'app va offline. Visualizza con un alert il fatto che non si è più connessi alla rete.
function off(){
    navigator.notification.alert("Non sei più connesso ad Internet! L'applicazione è inutilizzabile. Attendere la connessione o chiudere l'app.",null,"Errore");
}

//funzione chiamata quando tutto il contenuto della pagina è caricato. In questo caso quando la tabella degli articoli è stata tutta caricata. Permette di disabilitare il loader che mostra il caricamento della pagina.
function removeLoader() {
    document.getElementById("loading").style.display = "none";
}

document.addEventListener("offline", off, false);// è necessario scrivere questa riga per fare in modo che le componenti phonegap possono essere chiamate una volta che il dispositivo è pronto e quindi una volta che esse sono state caricate correttamente.
//senza questo listener l'applicazione non funzionerebbe correttamente.

//funzione che permette di disabilitare il funzionamento del tasto indietro su Android
function disableBack(){
	history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}

//funzione che viene chiamata al momento della pressione del pulsante "Fotocamera" sul modal per l'inserimento di un nuovo articolo. La funzione accede alla fotocamera del device e scansiona diverse tipologie di codici a barre di articoli venduti dall'azienda fornitrice.
//Le tipologie di codice a barre sono CODE 39, UPC, EAN e QR. Se l'utente annulla la scansione viene lanciato un messaggio. Se la scansione avviene correttamente viene aperta la pagina di inserimento di un nuovo articolo. Questo accade se l'articolo non è già presente in carrello. 
//Se l'articolo è già presente in carrello, viene lanciato un messaggio che invita a modificarne la quntità in carrello. Dal codice a barre viene estrapolato il codice dell'articolo presente nella tabella Art tramite la servlet /FindArticleBarCode
function openCamera(){
	cordova.plugins.barcodeScanner.scan(
      function (result) {
          if(result.cancelled == true) {
          		navigator.notification.alert("Scansione cancellata.",location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
                                                                     				username),"Info");
          }else{
          		var xhttp = new XMLHttpRequest();
                xhttp.open("POST",host+"/moviORDER/FindArticleBarCode",true);
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                    	var resp = JSON.parse(this.responseText);
                    	if(resp.messaggio == "no"){
                    		navigator.notification.alert("Scansione errata o codice a barre non corrispondente ad un articolo del fornitore.",deleteModal,"Info");
                    	}else{
                    		compute(resp.codArt);
                    	}
                    }
                };
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                xhttp.send("codArtAlias="+result.text+"&path="+connectionUrl);
          }
      },
      function (error) {
          navigator.notification.alert("Scanzione fallita: " + error,deleteModal,"Errore");
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : false, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          saveHistory: true, // Android, save scan history (default false)
          prompt : "Centra il codice a barre o il QR dentro l'area di rilevamento.", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats : "EAN_13,QR_CODE,EAN_8,CODE_39,UPC_A,UPC_E", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }
   );
}

//funzione chiamata quando viene premuto il pulsante "Logout". Viene chiusa la home page e si viene reindirizzati alla pagina di login.
function logout(){
	location.replace("login.html");
}

//funzione chiamata se viene confermata la creazione di un nuovo documento dopo aver premuto il pulsante "V" nel modal di generazione di un nuovo documento. Prende la data inserita e le note inserite e crea un nuovo documento con tali dati.
//La creazione di un nuovo documento consiste nell'inserimento di un record in tabella DocTes e nello spostamento di tutti gli articoli checkati da TmpRig a DocRig. Quando un articolo finisce in DocRig, esso diventa pronto per essere importato nel gestionale.
function confermaDoc(){
    var input1 = document.getElementById("data").value;
    var input2 = document.getElementById("noteM").value;
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST",host+"/moviORDER/SendOrder",true);
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var resp = JSON.parse(this.responseText);
    		if(resp.messaggio == "done"){
    			navigator.notification.alert("Ordine inviato con successo, riceverà presto una mail di conferma.",function(){
                deleteConfirmModal();
                location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
                     username);},"Ordine inviato");
    		}else{
    			navigator.notification.alert("Ordine fallito. Sono presenti problemi nel database.",null,"Errore");
    		}
    	}
    };
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhttp.send("codici="+send+"&username="+username+"&path="+connectionUrl+"&codCliFor="+codCliFor+
    		"&codDoc="+codDoc+"&data="+input1+"&note="+input2+"&desCliFor="+desCliFor+"&codAz="+codAzienda);
}

//funzione chiamata se viene premuto il pulsante "V" nel modal di generazione di un nuovo documento. Viene lanciato un messaggio per chiedere conferma dell'azione e in caso affermativo viene generato il documento.
//In caso negativo viene chiuso il modal e si torna alla home page senza effettuare alcuna modifica al db.
function confirmProcedure(){
	var check = document.getElementsByClassName("myCheck");
	send = "";
	for(i=0;i<check.length;i++){
		if(check[i].checked){
			trovato=true;
			send+=check[i].id+",";
		}
	}
	
	send = send.substr(0, send.length - 1); //tolgo l'ultima virgola
	var codici = send.split(",");
	if(codici.length == 1){
		navigator.notification.confirm("Genero documento "+desDoc+" per la riga selezionata?",function(indice){
		    if(indice == 1){
		        confermaDoc();
		    }
		},"Conferma nuovo documento",["OK","Annulla"]);
	}else{
		navigator.notification.confirm("Genero documento "+desDoc+" per le "+codici.length+" righe selezionate?",function(indice){
		    if(indice == 1){
            	confermaDoc();
            }
		},"Conferma nuovo documento",["OK","Annulla"]);
	}
}

//funzione chiamata se viene premuto il pulsante "Conferma ordine". La funzione apre il modal di generazione di un nuovo documento. Nel modal sono presenti i dati del cliente e i dati del documento da creare.
//Viene porposta la data odierna (modificabile) e viene proposto di inserire delle note.
function openConfirmModal(){
	var check = document.getElementsByClassName("myCheck");
	var trovato=false;
	for(i=0;i<check.length;i++){
		if(check[i].checked){
			trovato=true;
		}
	}
	if(trovato==false){
		navigator.notification.alert("Non si sono selezionati prodotti da ordinare!",null,"Info");
	}else{
		var modal = document.getElementById("confirmModal");
		modal.style.display="block";
		window.onclick = function(event) {
		    if (event.target == modal) {
		        modal.style.display = "none";
		    }
		}
		document.getElementById("cliente").value=codCliFor+" | "+desCliFor;
		document.getElementById("documento").value=codDoc+" | "+desDoc;
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; 
		var yyyy = today.getFullYear();
		if(dd<10){
		    dd='0'+dd;
		} 
		if(mm<10){
		    mm='0'+mm;
		} 
		var today = yyyy+"-"+mm+"-"+dd;
		document.getElementById("data").value=today;
	}
}

//funzione chiamata se viene premuto il pulsante "X" nel modal di generazione di un nuovo documento. La funzione chiude il modal e visualizza la home page dell'applicazione.
function deleteConfirmModal(){
	var modal = document.getElementById('confirmModal');
	modal.style.display = "none";
}

//funzione chiamata quando viene premuto il pulsante "OK" sul modal per l'inserimento di un nuovo articolo. La funzione chiama la funzione per l'apertura della pagina di inserimento di un nuovo articolo.
//i casi sono i medesimi allo scenario della fotocamera. Se il codice non esiste viene visualizzato un errore. Se l'articolo è già in carrello si invita l'utente a modificarne la quantità.
//Se non viene inserito un codice articolo allora viene visualizzato un messaggio che consigli di inserire un codice articolo.
function addNewArticle(){
	var input = document.getElementById("inputBox");
	if(input.value == ""){
		navigator.notification.alert("È necessario inserire un codice articolo.",null,"Info");
	}else{
		compute(input.value);
	}
}

//Funzione chiamata dal plugin della fotocamera o dal modal per l'inserimento di un nuovo articolo. Tramite una chiamata a /FindArticleCode capisce se deve essere aperta la pagina per l'inserimento di un nuovo articolo o se deve essere visualizzato un messaggio d'errore.
function compute(codice){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",host+"/moviORDER/FindArticleCode",true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var conferma = JSON.parse(this.responseText);
			if(conferma.messaggio == "presente"){
				navigator.notification.alert("Articolo già presente in carrello. Cambiare la quantità dell'articolo con una pressione prolungata sulla riga corrispondente!",deleteModal,"Info");
			}else if(conferma.messaggio != "NO"){
				location.replace("inserimentoModificaArticolo.html?username="+
				username+"&codArt="+(conferma.codice).toUpperCase()+"&mode=insert&codAz="+codAzienda);
			}else{
			    navigator.notification.alert("Il codice articolo inserito non corrisponde ad un articolo del fornitore.",null,"Errore");
			}
		}
	};
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send("codArt="+codice+"&path="+connectionUrl+"&username="+username);
}

//funzione chiamata se viene premuto il pulsante "X" sul modal per l'inserimento di un nuovo articolo. La funzione chiude il modal e visualizza la home page dell'applicazione.
function deleteModal(){
	var modal = document.getElementById('myModal');
	modal.style.display = "none";
	var input = document.getElementById('insertCode');
	input.style.display = "none";
}

//Funzione chiamata alla pressione del pulsante "Tastiera" sul modal per l'inserimento di un nuovo articolo. La funzione visualizza un input box dove inserire il codice dell'articolo che si vuole inserire.
function insertCode(){
	var input = document.getElementById('insertCode');
	input.style.display = "block";
}

//funzione chiamata se viene premuto il pulsante "Aggiungi articolo". La funzione apre il modal per l'inserimento di un nuovo articolo.
function showAddModal(){
	// Get the modal
	var modal = document.getElementById('myModal');
	modal.style.display = "block";

	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	        var input = document.getElementById('insertCode');
	    	input.style.display = "none";
	    }
	}
}

//Funzione chiamata se viene premuto il pulsante "Tutorial". La funzione visualizza con un alert un breve tutorial che aiuta l'utente a capire come funziona l'applicazione.
function displayTutorial(){
	var tutorialString = "";
	tutorialString += "Hai aperto il tutorial dell'applicazione:\n" +
			"1. Per inserire un nuovo prodotto premere sul primo bottone e selezionare input da tastiera o da fotocamera;\n" +
			"2. Per selezionare/deselezionare i prodotti si può selezionarli uno ad uno o premere sul secondo bottone per selezionarli/deselezionarli tutti;\n" +
			"3. Per eliminare i prodotti selezionati premere sul terzo bottone;\n" +
			"4. Per confermare l'ordine e generare il documento, premere sul quarto bottone;\n" +
			"5. Per modificare una riga, fare tap sulla riga da modificare e confermare."
			
	navigator.notification.alert(tutorialString,null,"Tutorial applicazione");
}

//Funzione chiamata al momento del caricamento della home page dell'applicazione. Tramite una chiamata alla servlet /GetNameByUsername setta la testa della home page con il nome dell'utente loggato.
function setTitle(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",host+"/moviORDER/GetNameByUsername",true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var resp = JSON.parse(this.responseText);
			desCliFor = resp.descrizioneCliente;
			codCliFor = resp.codiceCliente;
			codDoc = resp.codiceDocumento;
			desDoc = resp.descrizioneDocumento;
			document.getElementById("pageTitle").innerHTML="Benvenuto<br/>"+desCliFor;
		}
	};
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send("username="+username+"&path="+connectionUrl);
}

//Funzione chiamata quando viene confermata la cancellazione degli articoli una volta premuto il pulsante "Cancella articoli". Tutti gli articoli selezionati vengono eliminati dalla tabella TmpRig tramite una chiamata alla servlet /DeleteSelectedItems.
function cancelRow(sendM){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST",host+"/moviORDER/DeleteSelectedItems",true);
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var resp = JSON.parse(this.responseText);
    		if(resp.messaggio == "done"){
    			location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
                    username);
    		}else{
    			navigator.notification.alert("Ordine fallito. Sono presenti problemi nel database.",null,"Errore");
    		}
    	}
    };
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhttp.send("codici="+sendM+"&username="+username+"&path="+connectionUrl);
}

//Funzione chiamata quando viene premuto il pulsante "Elimina articoli" sulla home page dell'applicazione. Viene visualizzato un messaggio per chiedere conferma dell'azione. In caso positivo, viene chiamata la funzione cancelRow() per l'effettiva cancellazione degli articoli.
//In caso di risposta negativa viene lasciato il carrello inalterato con gli articoli ancora selezionati come aveva deciso l'utente prima di premere il pulsante.
function deleteSelected(){
	var check = document.getElementsByClassName("myCheck");
	var trovato=false;
	var send="";
	for(i=0;i<check.length;i++){
		if(check[i].checked){
			trovato=true;
			send+=check[i].id+",";
		}
	}
	if(trovato==false){
		navigator.notification.alert("Non si sono selezionati prodotti da eliminare!",null,"Info");
	}else{
		send = send.substr(0, send.length - 1); //tolgo l'ultima virgola
		var codici = send.split(",");
		if(codici.length == 1){
			navigator.notification.confirm("Cancello la riga selezionata?",function(indice){
			    if(indice == 1){
			        cancelRow(send);
			    }
			},"Conferma cancellazione",["OK","Annulla"]);
		}else{
			navigator.notification.confirm("Cancello le "+codici.length+" righe selezionate?",function(indice){
			    if(indice == 1){
            		cancelRow(send);
            	}
			},"Conferma cancellazione",["OK","Annulla"]);
		}
	}
}

//Funzione chiamata se viene premuto il pulsante "Seleziona/deseleziona tutti". La funzione seleziona tutti gli articoli se nessun articolo è selezionato o solo alcuni sono selezionati, mentre se tutti gli articoli sono selezionati, la funzione deseleziona tutti gli articoli.
function selectAll(){
	var array = document.getElementsByClassName("myCheck");
	//controllo dei check, se qualcuno non è checkato allora li mette tutti checkati
	//se sono tutti checkati li decheka
	var trovato = false;
	for(i=0;i<array.length;i++){
		if(!array[i].checked){
			trovato=true;
		}
	}
	if(trovato==true){
		for(i=0;i<array.length;i++){
			array[i].checked=true;
		}
	}else{
		for(i=0;i<array.length;i++){
			array[i].checked=false;
		}
	}
}

//Funzione chiamata se viene premuto sulla riga di un articolo sulla home page dell'applicazione. La funzione chiede con un alert se si vuole modificare l'articolo. In caso positivo viene aperta la pagina di modifica dell'articolo selezionato.
//In caso negativo, viene lasciato il carrello inalterato e viene visualizzata la home page.
function updateArticle(articleCod){
	navigator.notification.confirm("Vuoi modificare l'articolo selezionato?",function(indice){
	    if(indice == 1){
	        location.replace("inserimentoModificaArticolo.html?username="+username+"&codArt="+
            		articleCod+"&mode=update&codAz="+codAzienda);
	    }

	},"Conferma modifica",["OK","Annulla"]);
}

//Funzione che crea la tabella degli articoli in carrello per l'utente loggato. Gli articoli in carrello sono tutti gli articoli presenti in TmpRig per l'utente loggato.
//Per ogni articolo la tabella mostra quantità, codice e descrizione dell'articolo.
function createTable(xhttp){
	var array = JSON.parse(xhttp.responseText);
	connectionUrl = array.dbPath;
	setTitle();
	var div = document.getElementById("ArticleTable");
	if(array.quantita == 0 && array.descrizione == "0" && array.codiceArt == "0"){
		var p = document.createElement("p");
		var text = document.createTextNode("Non ci sono articoli in carrello.");
		p.appendChild(text);
		div.appendChild(p);
		removeLoader();
	}else{
		var table = document.createElement("table");
		table.setAttribute("id","firstpage");
		div.appendChild(table);
		var tr = null;
		var td = null;
		var input = null;
		var text = null;
		var codice = null;
		var j = null;
		tr = document.createElement("tr");
		var th = document.createElement("th");
		text = document.createTextNode("Check");
		th.appendChild(text);
		tr.appendChild(th);
		th = document.createElement("th");
		text = document.createTextNode("Q");
		th.appendChild(text);
		tr.appendChild(th);
		th = document.createElement("th");
		text = document.createTextNode("Codice");
		th.appendChild(text);
		tr.appendChild(th);
		th = document.createElement("th");
		text = document.createTextNode("Descrizione");
		th.appendChild(text);
		tr.appendChild(th);
		table.appendChild(tr);
		for(i=0;i<array.articoli.length;i++){
			tr = document.createElement("tr");
			td = document.createElement("td");
			tr.appendChild(td);
			input = document.createElement("input");
			input.setAttribute("type","checkbox");
			input.setAttribute("class","myCheck");
			td.appendChild(input);
			j = 0;
			for(x in array.articoli[i]){
				td = document.createElement("td");
				text = document.createTextNode(array.articoli[i][x]);
				if(x == "codiceArt"){
					input.setAttribute("id",array.articoli[i][x]);
					//capire come mettere su tutti i td
					codice = array.articoli[i][x];
					j = 1;
				}
				if(j == 1){
					td.setAttribute("onclick","updateArticle('"+codice+"')");
				}
				td.appendChild(text);
				tr.appendChild(td);
				if(x == "codiceArt"){
					td.previousSibling.setAttribute("onclick","updateArticle('"+codice+"')")
				}
			}
			table.appendChild(tr);
		}
		removeLoader();
	}
	
}

//Funzione chiamata al caricamento della pagina. La funzione tramite una chiamata alla servlet /GetArticlesByUsername prende i dati relativi agli articoli in carrello per l'utente loggato e poi chiama la funzione createTable() per mostrare tali dati in modo parlante all'utente utilizzatore dell'applicazione.
function openArticles() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",host+"/moviORDER/GetArticlesByUsername",true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			createTable(this);
		}
	};
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send("codAzienda="+codAzienda+"&username="+username);
}

//questa chiamata permette di visualizzare la home page dell'applicazione con gli articoli in carrello per l'utente loggato all'applicazione.
openArticles();