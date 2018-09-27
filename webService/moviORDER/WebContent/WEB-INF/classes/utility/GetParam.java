/*
 * Classe di utilità per avere l'URL del commonDB settato in un unico punto del servizio.
 * Questo URL potrebbe cambiare e basterà settarlo qui perché il servizio continui a funzionare.
 */
package utility;

public class GetParam {
	private static String urlCommonDB = "vision.cloudapp.net:1500;databaseName=mvo_CommonDB;user=sa;password=Vision2015";
	
	/*
	 * Metodo che restituisce l'URL del CommonDb su server cloud.
	 */
	public static String getUrlCommonDB() {
		return urlCommonDB;
	}
}