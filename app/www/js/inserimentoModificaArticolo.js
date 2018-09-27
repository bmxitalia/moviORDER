var host = "http://localhost:8080";
var urlString = window.location.href;
var url = new URL(urlString);
var codiceArticolo = url.searchParams.get("codArt");
var username = url.searchParams.get("username");
var mode = url.searchParams.get("mode");
var codAzienda = url.searchParams.get("codAz");
var connectUrl = "";
var noteA = "";
var descrizione = "";
var qtaMin = "";
var qtaMul = "";

function removeLoader() {
	document.getElementById("loading").style.display= "none";
}

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
			selectQta.setAttribute("min",resp.qta);
			qtaMin = resp.qta;
			qtaMul = resp.qtaMul;
			selectQta.setAttribute("min",qtaMin);
            selectQta.value = qtaMin;
            if(resp.qtaMul == 1.0){
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
						selectQta.value = resp.quantita;
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

function displayArticleNote(){
	alert(noteA);
}

function confirmInsert(){
	var elem = document.getElementById("selectQta");
	if(elem.value == ""){
		alert("La quantità è un campo obbligatorio.");
	}else{
		elem.setCustomValidity("");
		alert(elem.checkValidity());
		if(!elem.checkValidity()){
			elem.setCustomValidity("La quantità non può essere minore di "+qtaMin+", deve avere massimo due cifre decimali e andare a multipli di "+
				qtaMul+".");
			alert(elem.validationMessage);
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
						alert("Inserimento/modifica fallita. Sono presenti problemi nel database.");
					}
				}
			};
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
			xhttp.send("query="+query+"&path="+connectUrl);
		}
	}
}

function cancelInsert(){
	location.replace("visualizzazioneArticoli.html?codAz="+codAzienda+"&username="+
			username);
}