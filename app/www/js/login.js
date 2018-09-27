var host = "http://localhost:8080";

function disableBack(){
	history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}

function checkConnection(){
	if(navigator.onLine == false) {
		alert("Non sei connesso ad Internet. L'applicazione è inutilizzabile.");
		window.close();
	}else{
		disableBack();
	}
}


function removeP(){
	var errore=document.getElementById("errorMessage");
	errore.style.display="none";
}

function showSomething(xhttp){
	var jsonObject = JSON.parse(xhttp.responseText);
	var errore=document.getElementById("errorMessage");
	errore.innerHTML=jsonObject.messaggio;
	errore.style.backgroundColor="#f44336";
	errore.style.display="block";
	document.getElementById("username").value="";
	document.getElementById("password").value="";
}

function tryLogin(){
	var usern = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var xhttp = new XMLHttpRequest();
	if(usern!="" && password!=""){
		xhttp.open("POST",host+"/moviORDER/AuthenticationServlet",true);
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var risp=JSON.parse(this.responseText);
				if(risp.messaggio=="OK"){
					alert("Accesso avvenuto con successo.");
					location.replace("visualizzazioneArticoli.html?codAz="+risp.codAz+"&username="+
							risp.username);
				}else{
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

