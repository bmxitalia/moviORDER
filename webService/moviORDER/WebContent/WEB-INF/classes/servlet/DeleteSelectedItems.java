/*
 * Servlet che rappresenta il servizio di cancellazione degli articoli checkati, e quindi passati alla servlet, dal carrello dell'utente loggato, e quindi dalla tabella TmpRig.
 * La servlet richiede una stringa contenente i codici degli articoli separati da una virgola, lo username dell'utente di cui si vogliono cancellare gli articoli in carrello, e la path del db dell'azienda fornitrice dell'utente loggato.
 * La servlet esegue la cancellazione di tutti i codici passati per l'utente passato.
 * La servlet ritorna un messaggio di fail se la cancellazione non � andata a buon fine, oppure un messaggio di done se la cancellazione � andata a buon fine.
 */
package servlet;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import dbConnection.DatabaseConnection;

/**
 * Servlet implementation class DeleteSelectedItems
 */
@WebServlet("/DeleteSelectedItems")
public class DeleteSelectedItems extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public DeleteSelectedItems() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String deleteCode = request.getParameter("codici");
		String username = request.getParameter("username");
		String dbPath = request.getParameter("path");
		String json = "";
		DatabaseConnection dbConnect=new DatabaseConnection(dbPath);
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		String[] codici = deleteCode.split(",");
		String query = "delete from TmpRig where username='"+username+"' and (";
		for(int i=0;i<codici.length;i++) {
			query += "CodArt='"+codici[i]+"' or ";
		}
		query = query.substring(0, query.length() - 4); //tolgo l'ultimo or di troppo
		query += ")";
		int affectedRows = dbConnect.doUpdateQuery(query);
		if(affectedRows == 0) {
			json = "{\"messaggio\":\"fail\"}";
		}else {
			json = "{\"messaggio\":\"done\"}";
		}
		dbConnect.closeConnection();
		response.setContentType("application/json");
		response.getWriter().write(json);
	}

}