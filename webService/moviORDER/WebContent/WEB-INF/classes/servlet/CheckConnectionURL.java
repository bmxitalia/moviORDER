/*
 * Servlet che verifica se l'URL di connessione ad un database è raggiungibile.
 * Serve quando si tenta di fare la login con un nome utente esistente a cui corrisponde una stringa di connessione al database non corretta o nulla.
 * In questi casi viene restituito un JSON contenente un messaggio negativo in modo che la business logic possa reagire a questa situazione.
 * Nel caso in cui la stringa risultasse corretta viene restituito un messaggio positivo e la business logic permetterà il login.
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
 * Servlet implementation class CheckConnectionURL
 */
@WebServlet("/CheckConnectionURL")
public class CheckConnectionURL extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public CheckConnectionURL() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String codiceAzienda = request.getParameter("codAz");
		System.out.println(codiceAzienda);
		DatabaseConnection dbConnect = new DatabaseConnection(GetParam.getUrlCommonDB());
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		String query = "select Path from Aziende where CodAzienda='"+codiceAzienda+"'";
		ResultSet rs = dbConnect.doQuery(query);
		String path = "";
		String json = "";
		try {
			while(rs.next()) {
				path = rs.getString(1);
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}
		dbConnect.closeConnection();
		if(path != "") {
			if(checkPath(path)) {
				dbConnect = new DatabaseConnection(path);
				try {
					dbConnect.connectToDB();
					json = "{\"messaggio\":\"OK\"}";
				}catch(SQLException e) {
					e.printStackTrace();
					json = "{\"messaggio\":\"no\"}";
				}
			}else {
				json = "{\"messaggio\":\"no\"}";
			}
		}else {
			json = "{\"messaggio\":\"no\"}";
		}
		response.setContentType("application/json");
		response.getWriter().write(json);
	}
	
	public boolean checkPath(String p) {
		String[] splitted=p.split(";");
		if(splitted.length == 4) {
			String[] db=splitted[1].split("=");
			String[] user2=splitted[2].split("=");
			String[] psw2=splitted[3].split("=");
			if(db.length != 2 || user2.length != 2 || psw2.length != 2) {
				return false;
			}else {
				return true;
			}
		}
		return false;
	}

}
