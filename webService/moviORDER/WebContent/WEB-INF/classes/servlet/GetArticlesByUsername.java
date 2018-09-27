/*
 * Servlet che dato il codice azienda e lo username dell'utente, restituisce tutte le informazioni degli articoli presenti nel carrello dell'utente.
 * I dati servono per creare una tabella degli articoli nell'applicazione. Il codice azienda permette di cercare nel CommonDB l'URL di connessione al db dell'azienda su server cloud o su server dell'azienda stessa.
 * Una volta eseguito l'accesso al db vengono prese quantità, codice e descrizione per ogni articolo presente in TmpRig per l'utente loggato. Queste info vengono resituite sottoforma di JSON.
 */
package servlet;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import dbConnection.DatabaseConnection;
import utility.GetParam;

/**
 * Servlet implementation class GetArticlesByUsername
 */
@WebServlet("/GetArticlesByUsername")
public class GetArticlesByUsername extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetArticlesByUsername() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String codAz = request.getParameter("codAzienda");
		String username = request.getParameter("username");
		String json = "";
		DatabaseConnection dbConnect=new DatabaseConnection(GetParam.getUrlCommonDB());
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		ResultSet rs=dbConnect.doQuery("select Path from Aziende where codAzienda='"+codAz+"'");
		String connectionUrl = null;
		try {
			while(rs.next()) {
				connectionUrl = rs.getString(1);
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}
		dbConnect.closeConnection();
		dbConnect=new DatabaseConnection(connectionUrl);
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		boolean entrato = false;
		rs=null;
		String desc = "";
		rs=dbConnect.doQuery("select Quantita, TmpRig.CodArt, DesArt from TmpRig INNER JOIN Art ON TmpRig.CodArt=Art.CodArt where Username='"+username+"'");
		try {
			json += "{\"dbPath\":\""+connectionUrl+"\",";
			json += "\"articoli\":[";
			while(rs.next()) {
				desc = rs.getString(3);
				desc = desc.replaceAll("\"", "''");
				entrato = true;
				json += "{\"quantita\":\""+rs.getString(1)+"\",\"codiceArt\":\""+
						rs.getString(2)+"\",\"descrizione\":\""+desc+"\"},";
			}
			if(entrato == true) {
				json = json.substring(0, json.length() - 1); //per togliere l'ultima virgola
				json += "]}";
			}else {
				json = json.substring(0, json.length() - 12);
				json += "\"quantita\":\"0\",\"codiceArt\":\"0\",\"descrizione\":\"0\"}"; //siginifica che non ci sono articoli in tmprig
			}
			response.setContentType("application/json");
			response.getWriter().write(json);
		}catch(SQLException e) {
			e.printStackTrace();
		}
		dbConnect.closeConnection();
		try {
			rs.close();
		}catch(SQLException e) {
			e.printStackTrace();
		}
	}

}
