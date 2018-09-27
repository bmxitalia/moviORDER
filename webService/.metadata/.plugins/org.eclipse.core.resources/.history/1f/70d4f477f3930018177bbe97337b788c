/*
 * Servlet che rappresenta il servizio di ricerca e restituzione dei dati contenuti nella tabella TmpRig associati ad un CodArt e uno username associato.
 * Si tratta dei dati di un articolo già in carrello per un utente con username passato alla Servlet. I dati servono per inserire nel form di modifica i dati già presenti in TmpRig.
 * Richiede in input anche la path di connessione al db dell'azienda per evitare il passaggio per il CommonDB.
 * Restituisce i dati precedentemente descritti per un CodArt e uno username passato.
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

/**
 * Servlet implementation class GetTmpArticleData
 */
@WebServlet("/GetTmpArticleData")
public class GetTmpArticleData extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetTmpArticleData() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getParameter("path");
		String codArt = request.getParameter("codArt");
		String username = request.getParameter("username");
		DatabaseConnection dbConnect=new DatabaseConnection(url);
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		String json = "";
		ResultSet rs = dbConnect.doQuery("select Quantita, Note from TmpRig where CodArt='"+codArt+
				"' and Username='"+username+"'");
		try {
			while(rs.next()) {
				json += "{\"quantita\":\""+rs.getString(1)+"\",\"note\":\""+rs.getString(2)+"\"}";
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}
		System.out.println(json);
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
