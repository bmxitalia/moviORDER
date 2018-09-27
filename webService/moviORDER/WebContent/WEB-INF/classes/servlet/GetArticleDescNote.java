/*
 * Servlet che rappresenta il servizio di ricerca e restituzione di descrizione, quantità minima e note, utili a descrivere un articolo da modificare o inserire in carrello.
 * Richiede in input il codice azienda per ottenere la path di connessione al db dell'azienda, e il codice articolo di cui si vogliono ottenere tali informazioni.
 * Restituisce le tre info prima descritte e la path di connessione al database. Questo per evitare che ogni servlet debba prima connettersi al CommonDB per ottenere la path e poi al db dell'azienda.
 * Infatti, tramite la path, ci si potrà direttamente collegare al db dell'azienda.
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
 * Servlet implementation class GetArticleDesc
 */
@WebServlet("/GetArticleDesc")
public class GetArticleDescNote extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetArticleDescNote() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String codAz = request.getParameter("codAz");
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
		rs = null;
		String codArt=request.getParameter("codArt");
		rs=dbConnect.doQuery("select DesArt,Note, QtaMin, QtaMul from Art where CodArt='"+codArt+"'");
		String json = "";
		String desc = "";
		String note = "";
		try {
			while(rs.next()) {
				note = rs.getString(2);
				desc = rs.getString(1);
				desc = desc.replaceAll("\"", "''");
				note = note.replaceAll("\"", "''");
				note = note.replaceAll("\n", "");
				note = note.replaceAll("\r", "");
				json += "{\"descrizione\":\""+desc+"\",\"note\":\""+note+"\",\"qta\":\""+rs.getFloat(3)+"\",\"qtaMul\":\""+rs.getFloat(4)+"\",";
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}
		json += "\"path\":\""+connectionUrl+"\"}";
		response.setContentType("application/json");
		response.getWriter().write(json);
		dbConnect.closeConnection();
		try {
			rs.close();
		}catch(SQLException e) {
			e.printStackTrace();
		}
	}

}
