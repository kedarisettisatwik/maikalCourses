package com.maikal.courses;
import android.content.Context;
import java.io.*;
import java.net.*;
import java.util.*;
import org.json.JSONObject;

/** Download only the eight supplied books, into private on-device storage. */
final class PdfBooks {
 interface Result { void send(String type,String value); }
 private static final Set<String> IDS=new HashSet<>(Arrays.asList("oops","system-design","computer-networks","dbms","operating-systems","devops","react","jsp"));
 private static final Set<String> downloading=new HashSet<>();
 static File file(Context c,String id){return new File(new File(c.getFilesDir(),"books"),id+".pdf");}
 static InputStream open(Context c,String id)throws IOException{return IDS.contains(id)&&file(c,id).isFile()?new FileInputStream(file(c,id)):null;}
 static void emit(Result r,String type,String id,long received,long total,String message){try{JSONObject data=new JSONObject();data.put("id",id);data.put("received",received);data.put("total",total);data.put("message",message);r.send(type,data.toString());}catch(Exception ignored){}}
 static void prepare(Context c,String id,Result result){
  if(!IDS.contains(id)){emit(result,"pdf-error",id,0,0,"This book is unavailable.");return;}
  if(file(c,id).isFile()){emit(result,"pdf-ready",id,0,0,"");return;}
  synchronized(downloading){if(!downloading.add(id))return;}
  new Thread(()->{
   File target=file(c,id),partial=new File(target.getParentFile(),id+".partial");HttpsURLConnectionHolder holder=new HttpsURLConnectionHolder();
   try{
    if(!target.getParentFile().isDirectory()&&!target.getParentFile().mkdirs())throw new IOException("Storage unavailable");
    HttpURLConnection connection=(HttpURLConnection)new URL("https://kedarisettisatwik.github.io/maikalCourses/assets/"+id+"/source.pdf").openConnection();holder.connection=connection;connection.setConnectTimeout(15000);connection.setReadTimeout(45000);connection.setInstanceFollowRedirects(false);
    if(connection.getResponseCode()!=200)throw new IOException("Book unavailable");long total=connection.getContentLengthLong(),received=0,last=0;
    if(total>120_000_000)throw new IOException("Book too large");
    try(InputStream in=connection.getInputStream();OutputStream out=new FileOutputStream(partial)){
     byte[] buffer=new byte[32768];int n;boolean first=true;
     while((n=in.read(buffer))!=-1){if(first){if(n<5||buffer[0]!='%'||buffer[1]!='P'||buffer[2]!='D'||buffer[3]!='F'||buffer[4]!='-')throw new IOException("Invalid book");first=false;}received+=n;if(received>120_000_000)throw new IOException("Book too large");out.write(buffer,0,n);long now=System.currentTimeMillis();if(now-last>350){emit(result,"pdf-progress",id,received,total,"");last=now;}}
    }
    if(received<100||total>0&&received!=total||!partial.renameTo(target))throw new IOException("Incomplete book");
    emit(result,"pdf-ready",id,received,total,"");
   }catch(Exception e){android.util.Log.w("MaikalBooks","Unable to download "+id,e);partial.delete();emit(result,"pdf-error",id,0,0,"Connect to the Internet to download this book. Once downloaded, you can read it offline.");}
   finally{if(holder.connection!=null)holder.connection.disconnect();synchronized(downloading){downloading.remove(id);}}
  },"Maikal-book-download").start();
 }
 private static final class HttpsURLConnectionHolder { HttpURLConnection connection; }
}
