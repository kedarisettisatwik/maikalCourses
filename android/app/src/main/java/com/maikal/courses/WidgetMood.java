package com.maikal.courses;
/** Pure local-day streak reactions; a completed session makes the streak safe. */
public final class WidgetMood {
 public static String forWidget(int streak,int completedToday,int hour,boolean history){if(completedToday>0)return hour>=21||hour<6?"sleeping":"playing";if(streak==0&&history)return "knocked_out";return forDay(streak,completedToday,hour);}
 public static String forDay(int streak,int completedToday,int hour){if(completedToday>0)return "happy";if(streak>0&&hour>=22)return "urgent";if(streak>0&&hour>=18)return "worried";return "ready";}
}
