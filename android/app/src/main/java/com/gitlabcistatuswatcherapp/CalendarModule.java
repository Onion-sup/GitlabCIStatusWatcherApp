package com.gitlabcistatuswatcherapp; // replace com.your-app-name with your app’s name
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;


public class CalendarModule extends ReactContextBaseJavaModule {
    ReactApplicationContext context;
    CalendarModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        Intent service = new Intent(this.context, MyTaskService.class);
        Bundle bundle = new Bundle();
        service.putExtras(bundle);
        this.context.startService(service);
    }

    @Override
    public String getName() {
        return "CalendarModule";
    }

    @ReactMethod
    public void createCalendarEvent(String name, String location) {
        Log.i("CalendarModule", "Create event called with name: " + name
                + " and location: " + location);

    }
}