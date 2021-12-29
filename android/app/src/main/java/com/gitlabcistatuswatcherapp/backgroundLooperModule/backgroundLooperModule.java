package com.gitlabcistatuswatcherapp;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import android.content.Intent;
import android.os.Bundle;
import android.os.Build;
import com.facebook.react.bridge.ReactMethod;
import com.gitlabcistatuswatcherapp.backgroundLooperService;
import android.util.Log;
import androidx.core.app.NotificationCompat; 

public class backgroundLooperModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext context;
    private Intent service;
    backgroundLooperModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.service = new Intent(this.context.getApplicationContext(), backgroundLooperService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            this.context.startForegroundService(service);
        } else {
            this.context.startService(service);
        }
    }
    @Override
    public String getName() {
        return "backgroundLooperModule";
    }
    @ReactMethod
    public void startTask(String message) {
        System.out.println("println backgroundLooperModule startTask");
        Log.d("Log", "backgroundLooperModule startTask");
        Bundle bundle = new Bundle();
        bundle.putString("type", "start");
        this.service.putExtras(bundle);
    }
    @ReactMethod
    public void stopTask(String message) {
        Bundle bundle = new Bundle();
        bundle.putString("type", "stop");
        this.service.putExtras(bundle);
    }
}