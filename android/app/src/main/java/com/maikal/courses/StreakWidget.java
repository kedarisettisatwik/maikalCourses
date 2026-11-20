package com.maikal.courses;
import android.appwidget.*;import android.content.*;import android.widget.*;import org.json.*;import java.time.*;
public class StreakWidget extends AppWidgetProvider {
 @Override public void onUpdate(Context c,AppWidgetManager m,int[] ids){update(c,m,ids);}
 static void refresh(Context c){AppWidgetManager m=AppWidgetManager.getInstance(c);update(c,m,m.getAppWidgetIds(new ComponentName(c,StreakWidget.class)));update(c,m,m.getAppWidgetIds(new ComponentName(c,StreakWidgetHorizontal.class)));}
 static void update(Context c,AppWidgetManager m,int[] ids){
  JSONObject s=AppState.state(c);int streak=AppState.streak(s),today=AppState.today(s),hour=LocalTime.now().getHour();JSONObject days=s.optJSONObject("studyDays");boolean history=false;
  if(days!=null){java.util.Iterator<String> keys=days.keys();while(keys.hasNext())if(days.optInt(keys.next())>0){history=true;break;}}
  String mood=WidgetMood.forWidget(streak,today,hour,history);boolean risk=mood.equals("worried")||mood.equals("urgent");
  int avatar=mood.equals("sleeping")?R.drawable.widget_miko_sleeping:mood.equals("knocked_out")?R.drawable.widget_miko_knocked_out:mood.equals("playing")?R.drawable.widget_miko_playing:mood.equals("urgent")?R.drawable.widget_miko_urgent:risk?R.drawable.widget_miko_worried:R.drawable.widget_miko_happy;
  String reaction=mood.equals("sleeping")?"Miko is sleeping: your streak is safe tonight":mood.equals("knocked_out")?"Miko is comically knocked out: a new session starts a new streak":mood.equals("playing")?"Miko is playing after your lesson":risk?"Miko is worried: finish a session before midnight to save your streak":"Miko is ready to explore";
  for(int id:ids){AppWidgetProviderInfo info=m.getAppWidgetInfo(id);boolean horizontal=info!=null&&info.provider.getClassName().equals(StreakWidgetHorizontal.class.getName());RemoteViews v=new RemoteViews(c.getPackageName(),horizontal?R.layout.streak_widget_horizontal:R.layout.streak_widget);v.setTextViewText(R.id.widget_streak,String.valueOf(streak));v.setImageViewResource(R.id.widget_avatar,avatar);boolean night=mood.equals("sleeping");v.setImageViewResource(R.id.widget_world,horizontal?(night?R.drawable.widget_world_horizontal_night:R.drawable.widget_world_horizontal):(night?R.drawable.widget_world_vertical_night:R.drawable.widget_world_vertical));v.setContentDescription(R.id.widget_root,streak+" day streak. "+reaction+". Tap to continue.");v.setTextColor(R.id.widget_streak,risk?0xFFB94F5E:0xFF655181);v.setOnClickPendingIntent(R.id.widget_root,AppState.open(c,AppState.pending(s),id));m.updateAppWidget(id,v);}
 }
}
