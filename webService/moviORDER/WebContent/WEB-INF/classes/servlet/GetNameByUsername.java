/*
 * Servlet che dato il path di connessione al db dell'azienda e lo username dell'utente loggato, restituisce il nome del cliente, il suo codice, il codice del documento da creare e la descrizione del documento.
 * Questi dati servono per costruire il modal per la conferma di creazione di un nuovo documento. Quindi il modal di conferma dell'ordine.
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
 * Servlet implementation class GetNameByUsername
 */
@WebServlet("/GetNameByUsername")
public class GetNameByUsername extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetNameByUsername() {
        super();
        // TODO Auto-generated constructor stub
    }
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String path = request.getParameter("path");
		String username = request.getParameter("username");
		DatabaseConnection dbConnect=new DatabaseConnection(path);
		try {
			dbConnect.connectToDB();
		}catch(SQLException e) {
			e.printStackTrace();
		}
		String json = "";
		ResultSet rs=dbConnect.doQuery("select DesCliFor, CodCliFor, CodDoc, DesDoc from Users where UserID='"+username+"'");
		try {
			while(rs.next()) {
				json += "{\"descrizioneCliente\":\""+rs.getString(1)+"\",\"codiceCliente\":\""+rs.getString(2)+
						"\",\"codiceDocumento\":\""+rs.getString(3)+"\",\"descrizioneDocumento\":\""+rs.getString(4)+"\"}";
			}
		}catch(SQLException e){
			e.printStackTrace();
		}
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
