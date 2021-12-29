package com.gitlabcistatuswatcherapp;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import javax.annotation.Nullable;
import androidx.core.app.NotificationCompat; 


public class backgroundLooperService extends HeadlessJsTaskService {
  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {

    Bundle extras = intent.getExtras();
    if (extras != null) {
      return new HeadlessJsTaskConfig(
          "setIntervalTask",
          Arguments.fromBundle(extras),
          5000, // timeout for the task
          true // optional: defines whether or not the task is allowed in foreground. Default is false
        );
    }
    return null;
  }
}