var host = "http://localhost:8080";
var urlString = window.location.href;
var url = new URL(urlString);
var codAzienda = url.searchParams.get("codAz");
var username = url.searchParams.get("username");
var connectionUrl = "";
var codCliFor = "";
var desCliFor = "";
var desDoc = "";
var codDoc = "";

function disableBack(){
	history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}

function removeLoader() {
	document.getElementById("loading").style.display = "none";
}

function openCamera(){
	cordova.plugins.barcodeScanner.scan(
      function (result) {
          if(result.cancelled == true) {
          		alert("Scansione cancellata.");
          		location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
				username);
          }else{
          		var xhttp = new XMLHttpRequest();
				xhttp.open("POST",host+"/moviORDER/FindArticleBarCode",true);
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var resp = JSON.parse(this.responseText);
						if(resp.messaggio == "no"){
							alert("Scansione errata o codice a barre non corrispondente ad un articolo del fornitore.");
							deleteModal();
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
          alert("Scanzione fallita: " + error);
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : false, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          saveHistory: true, // Android, save scan history (default false)
          prompt : "Centra il codice a barre o il QR dentro l'area di rilevamento.", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats : "all", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }
   );
}

function logout(){
	location.replace("login.html");
}

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
	var confirmBtn;
	if(codici.length == 1){
		confirmBtn = confirm("Genero documento "+desDoc+" per la riga selezionata?");
	}else{
		confirmBtn = confirm("Genero documento "+desDoc+" per le "+codici.length+" righe selezionate?");
	}
	if(confirmBtn==true){
		var input1 = document.getElementById("data").value;
		var input2 = document.getElementById("noteM").value;
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST",host+"/moviORDER/SendOrder",true);
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var resp = JSON.parse(this.responseText);
				if(resp.messaggio == "done"){
					alert("Ordine inviato con successo, riceverà presto una mail di conferma.");
					deleteConfirmModal();
					location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
						username);
				}else{
					alert("Ordine fallito. Sono presenti problemi nel database.");
				}
			}
		};
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		xhttp.send("codici="+send+"&username="+username+"&path="+connectionUrl+"&codCliFor="+codCliFor+
				"&codDoc="+codDoc+"&data="+input1+"&note="+input2+"&desCliFor="+desCliFor+"&codAz="+codAzienda);
	}
}

function openConfirmModal(){
	var check = document.getElementsByClassName("myCheck");
	var trovato=false;
	for(i=0;i<check.length;i++){
		if(check[i].checked){
			trovato=true;
		}
	}
	if(trovato==false){
		alert("Non si sono selezionati prodotti da ordinare!");
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

function deleteConfirmModal(){
	var modal = document.getElementById('confirmModal');
	modal.style.display = "none";
}

function removeError(){
	document.getElementById("error").style.display="none";
}

function addNewArticle(){
	var input = document.getElementById("inputBox");
	if(input.value == ""){
		document.getElementById("error").style.display="block";
	}else{
		compute(input.value);
	}
}

function compute(codice){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST",host+"/moviORDER/FindArticleCode",true);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var conferma = JSON.parse(this.responseText);
			if(conferma.messaggio == "presente"){
				alert("Articolo già presente in carrello. Cambiare la quantità dell'articolo con una pressione prolungata sulla riga corrispondente!");
				deleteModal();
			}else{
				location.replace("inserimentoModificaArticolo.html?username="+
				username+"&codArt="+codice.toUpperCase()+"&mode=insert&codAz="+codAzienda);
			}
		}
	};
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send("codArt="+codice+"&path="+connectionUrl+"&username="+username);
}

function deleteModal(){
	var modal = document.getElementById('myModal');
	modal.style.display = "none";
	var input = document.getElementById('insertCode');
	input.style.display = "none";
}

function insertCode(){
	var input = document.getElementById('insertCode');
	input.style.display = "block";
}

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

function displayTutorial(){
	var tutorialString = "";
	tutorialString += "Hai aperto il tutorial dell'applicazione:\n" +
			"1. Per inserire un nuovo prodotto premere sul primo bottone e selezionare input da tastiera o da fotocamera;\n" +
			"2. Per selezionare/deselezionare i prodotti si può selezionarli uno ad uno o premere sul secondo bottone per selezionarli/deselezionarli tutti;\n" +
			"3. Per eliminare i prodotti selezionati premere sul terzo bottone;\n" +
			"4. Per confermare l'ordine e generare il documento, premere sul quarto bottone;\n" +
			"5. Per modificare una riga, fare tap sulla riga da modificare e confermare."
			
	alert(tutorialString);
}

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
		alert("Non si sono selezionati prodotti da eliminare!");
	}else{
		send = send.substr(0, send.length - 1); //tolgo l'ultima virgola
		var codici = send.split(",");
		var confirmBtn;
		if(codici.length == 1){
			confirmBtn = confirm("Cancello la riga selezionata?");
		}else{
			confirmBtn = confirm("Cancello le "+codici.length+" righe selezionate?");
		}
		if(confirmBtn==true){
			var xhttp = new XMLHttpRequest();
			xhttp.open("POST",host+"/moviORDER/DeleteSelectedItems",true);
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var resp = JSON.parse(this.responseText);
					if(resp.messaggio == "done"){
						location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
							username);
					}else{
						alert("Ordine fallito. Sono presenti problemi nel database.");
					}
				}
			};
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
			xhttp.send("codici="+send+"&username="+username+"&path="+connectionUrl);
			//non viene ricevuta una risposta perché viene fatta una delete che non restituisce nulla
		}
	}
}

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

function updateArticle(articleCod){
	var conf = confirm("Vuoi modificare l'articolo selezionato?");
	if(conf == true){
		location.replace("inserimentoModificaArticolo.html?username="+username+"&codArt="+
				articleCod+"&mode=update&codAz="+codAzienda);
	}
}

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

//apre gli articoli, prima apre la connessione con il database dato il codice dell'azienda
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

openArticles();