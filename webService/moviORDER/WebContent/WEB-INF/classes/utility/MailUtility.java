/*
 * Classe di utilità che permette la configurazione di un server di invio e-mail e l'invio di e-mail.
 */
package utility;
import javax.mail.*;
import javax.mail.internet.*;
import java.util.*;

public class MailUtility {
	private String host;
	private int port;
	private String username;
	private String password;
	
	/*
	 * Costruttore con 4 parametri:
	 * host: è l'indirizzo del server SMTP da utilizzare per inviare la e-mail;
	 * post: è la porta sull'host dove è installato il server SMTP;
	 * username: è lo username per l'accesso al server SMTP;
	 * password: è la password per l'accesso al server SMTP.
	 */
	public MailUtility(String host, int port, String username, String password) {
		this.host = host;
		this.port = port;
		this.username = username;
		this.password = password;
	}
	
	/*
	 * Metodo per l'invio di una mail.
	 * Richiede 5 parametri:
	 * dest: indirizzo e-mail del destinatario della e-mail;
	 * az: indirizzo e-mail dell'azienda di cui il destinatario è cliente (inserita in CC);
	 * mitt: indirizzo e-mail del mittente della e-mail;
	 * oggetto: oggetto della e-mail;
	 * testoEmail: testo della e-mail.
	 */
	public void sendMail (String dest, String az, String mitt, String oggetto, String testoEmail) throws MessagingException {
		    // Creazione di una mail session
		    Properties props = new Properties();
		    //da settare il server smtp
		    props.put("mail.smtp.host", host);
		    props.put("mail.smtp.port", port);
		    props.put("mail.smtp.auth", "true");
		    Session session = Session.getDefaultInstance(props,new Authenticator() {

	            @Override
	            protected PasswordAuthentication getPasswordAuthentication() {
	                return new PasswordAuthentication(username,password);
	            }

	        });

		    // Creazione del messaggio da inviare
		    MimeMessage message = new MimeMessage(session);
		    message.setSubject(oggetto,"UTF-8");
		    Multipart mp = new MimeMultipart();
	        MimeBodyPart mbp = new MimeBodyPart();
	        mbp.setContent(testoEmail, "text/html;charset=utf-8");
	        mp.addBodyPart(mbp);
	        message.setContent(mp);
	        message.setSentDate(new java.util.Date());

		    // Aggiunta degli indirizzi del mittente e del destinatario
		    InternetAddress fromAddress = new InternetAddress(mitt);
		    InternetAddress toAddress = new InternetAddress(dest);
		    InternetAddress toAz = new InternetAddress(az);
		    message.setFrom(fromAddress);
		    message.setRecipient(Message.RecipientType.TO, toAddress);
		    message.setRecipient(Message.RecipientType.CC, toAz);
		    
		    // Invio del messaggio
		    Transport.send(message);
	}
}