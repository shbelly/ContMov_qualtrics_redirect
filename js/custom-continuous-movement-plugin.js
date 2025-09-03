/**
 * custom-continuous-movement-plugin for jsPsych
 * by Alex Rockhill
 * modified by Sara Parmigiani (2025)
* based on:
* jspsych-image-keyboard-response
* by Josh de Leeuw
 *
 * plugin for displaying a countdown with a stop potentially interjected
 *
 *
 **/

var stimuli = [];

jsPsych.plugins["custom-continuous-movement-plugin"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'custom-continuous-movement-plugin',
    description: 'continuous movement plugin for showing trials',
    parameters: {
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: null,
        description: 'Duration of the fixation.'
      },
      time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Countdown time',
        default: 6,
        description: 'The time to count down from'
      },
      t_stop_min: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Minimum stop time',
        default: 0.5,
        description: 'The closest the stop signal can be to the natural end of the countdown.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_type: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stop or go trial',
        default: null,
        description: 'Whether there is to be a premature stop in the trial'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before the participant stops moving after it ends.'
      },
      tone: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Tone to play during stop',
        default: null,
        description: 'The audio file path for a tone to play during the stop signal'
      },
      feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Give feedback',
        default: null,
        description: 'Display any issues'
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Duration of the feedback',
        default: null,
        description: 'Length of time the feedback is displayed'
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    // ===== FIXED: Initialize timestamp variables fresh for each trial =====
    var start_signal_timestamp = null;  // When start signal actually appears
    var stop_signal_timestamp = null;   // When stop signal actually appears
    var trial_start_time = null;        // Reference time for the whole trial
    
    console.log('=== NEW TRIAL STARTING ===');
    console.log('Trial type:', trial.trial_type);
    console.log('Current time at trial start:', performance.now());
    
    // setup audio with error handling
    var source = null;
    var audio = null;
    var context = null;
    if(trial.tone !== null) {
      try {
        context = jsPsych.pluginAPI.audioContext();
        if(context !== null){
          source = context.createBufferSource();
          var audioBuffer = jsPsych.pluginAPI.getAudioBuffer(trial.tone);
          if (audioBuffer && audioBuffer instanceof AudioBuffer) {
            source.buffer = audioBuffer;
            source.connect(context.destination);
            console.log('Audio buffer loaded successfully');
          } else {
            console.warn('Audio buffer not valid, continuing without audio');
            source = null;
          }
        } else {
          audio = jsPsych.pluginAPI.getAudioBuffer(trial.tone);
          if (audio && typeof audio.play === 'function') {
            audio.currentTime = 0;
            console.log('Audio element loaded successfully');
          } else {
            console.warn('Audio element not valid, continuing without audio');
            audio = null;
          }
        }
      } catch (e) {
        console.warn('Audio setup failed:', e, 'continuing without audio');
        source = null;
        audio = null;
      }
    }
    
    var stop_time = null;  // This is the calculated stop time (when stop should occur)
    var interval = null;
    var tmp_RT = null;
    
    // Movement stop detection variables
    var last_mouse_time = null;
    var movement_check_interval = null;
    var movement_threshold = 100;
    var movement_stopped = false;
    var actual_stop_time = null;
    
    if (trial.trial_type == 'stop') {
      stop_time = myrng() * (trial.time - 1 - trial.t_stop_min) + trial.t_stop_min;
    }

    // Fix stimulus (hide photodiode)
    var fix = '<img src="' + fix_stim + '"id="jspsych-image-keyboard-response-stimulus"></img>';

    var stimuli = [];

    // Start stimulus (show photodiode) 
    stimuli.push('<img src="' + start_stim + '"id="jspsych-image-keyboard-response-stimulus"></img>');

    // if shown stop at end of countdown
    var my_stop_time = 1000; 
    // Go stimuli (show photodiode)
    for (i = trial.time; i > 0; i--) {
    if (stop_time == null || i > stop_time) {
      stimuli.push('<img src="' + go_stim[i - 1] + '"id="jspsych-image-keyboard-response-stimulus"></img>');
    } else {
      if (stop_time !== null) {
         my_stop_time = parseInt((i + 1 - stop_time) * 1000);
        break;
       }
     }
   }

    // Stop stimulus (show photodiode)
    var stop = '<img src="' + stop_stim + '"id="jspsych-image-keyboard-response-stimulus"></img>';
    
    // add prompt
    if (trial.prompt !== null){
      stimuli[i] += trial.prompt;
    }

    // draw the first images
    display_element.innerHTML = fix;
    hidePhotodiodeBox();

    // store response
    var response = {
      goRT: null,
      RT: null,
      go_pos_x: [],
      go_pos_y: [],
      go_times: [],
      stop_pos_x: [],
      stop_pos_y: [],
      stop_times: [],
      exclude: null,
      wrong_way: 0,
      incorrect_movement: 0,
      too_slow: 0
    };

    // Function to detect when movement stops
    var detect_movement_stop = function() {
      var current_time = performance.now();
      
      if (last_mouse_time && !movement_stopped && (current_time - last_mouse_time) >= movement_threshold) {
        actual_stop_time = (last_mouse_time - trial_start_time) / 1000;
        movement_stopped = true;
        response.stop_times.push(last_mouse_time - trial_start_time);
        console.log(`Movement stopped detected at: ${actual_stop_time} seconds`);
      }
    };

    // Start movement stop detection
    var start_movement_detection = function() {
      last_mouse_time = null;
      actual_stop_time = null;
      movement_stopped = false;
      movement_check_interval = setInterval(detect_movement_stop, 20);
    };

    // function to end trial when it is time
    var end_trial = function() {
      // stop the audio file if it is playing with error handling
      if(trial.tone !== null) {
        try {
          if(context !== null && source){
            source.stop();
            source.onended = function() { }
          } else if (audio) {
            audio.pause();
          }
        } catch (e) {
          console.warn('Audio stop failed:', e);
        }
      }

      // Stop movement detection
      if (movement_check_interval) {
        clearInterval(movement_check_interval);
        movement_check_interval = null;
      }

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // remove mouse listener
      document.removeEventListener('mousemove', mouse_move_event);

      // ===== FIXED: Debug timestamp data before sending =====
      console.log('=== FINISHING TRIAL ===');
      console.log('Trial type:', trial.trial_type);
      console.log('start_signal_timestamp:', start_signal_timestamp);
      console.log('stop_signal_timestamp:', stop_signal_timestamp);
      console.log('Time difference:', stop_signal_timestamp ? (stop_signal_timestamp - start_signal_timestamp) : 'N/A', 'ms');

      // gather the data to store for the trial
      var trial_data = {
        "trial_type_data": trial.trial_type,
        "count": trial.time,
        "start_signal": start_signal_timestamp,    // FIXED: Use the actual timestamp variables
        "stop_signal": stop_signal_timestamp,      // FIXED: Use the actual timestamp variables
        "start_time": trial_start_time,            // Reference start time
        "number_times": number_times,
        "goRT": response.goRT,
        "RT": response.RT,
        "go_pos_x": response.go_pos_x,
        "go_pos_y": response.go_pos_y,
        "go_times": response.go_times,
        "stop_pos_x": response.stop_pos_x,
        "stop_pos_y": response.stop_pos_y,
        "stop_times": response.stop_times,
        "exclude": response.exclude
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var timeout = false;
    var judge_movement = function(x, y, xp, yp) {
      var x0 = window.innerWidth / 2;
      var y0 = window.innerHeight / 2;
      r = Math.sqrt((x - x0) ** 2 + (y - y0) **2);
      theta = Math.atan((y - y0) / (x - x0));
      thetap = Math.atan((yp - y0) / (xp - x0));
      if (Math.sign(theta) != Math.sign(thetap)) {
        if (theta < 0) {
          theta += Math.PI
        } else {
          thetap +=  Math.PI
        }
      }
      speed = Math.sqrt((x - xp) ** 2 + (y - yp) **2);
      if (!go && speed < 1) {
        end_trial();
      }
      if (theta < thetap) {
        response.wrong_way++;
      } else if (Math.abs(r - 0.8 * y0) / y0 > 0.5) {
        response.incorrect_movement++;
      } else if (speed < 1) {
        response.too_slow++;
      }
    };

    var go;
    var mouse_move_event = function(e){
      var now_time = performance.now();
      var x = e.clientX;
      var y = e.clientY;
      var xp = null;
      var yp = null;

      last_mouse_time = now_time;

      if (go == null) {
        return;
      } else if (go) {
        if (response.go_pos_x.length == 0){
          response.goRT = Math.round(now_time - trial_start_time);
          trigger_write(12);
          console.log('Go RT was ' + response.goRT + ' ms');
        } else {
          xp = response.go_pos_x[response.go_pos_x.length - 1];
          yp = response.go_pos_y[response.go_pos_x.length - 1];
        }
        response.go_pos_x.push(x);
        response.go_pos_y.push(y);
        response.go_times.push(Math.round(now_time - trial_start_time));
      } else {
        response.RT = Math.round(now_time - stop_time2);
        if (response.stop_pos_x.length > 0) {
          xp = response.stop_pos_x[response.stop_pos_x.length - 1];
          yp = response.stop_pos_y[response.stop_pos_y.length - 1];
        }
        response.stop_pos_x.push(x);
        response.stop_pos_y.push(y);
      }
      if (xp !== null) {
        judge_movement(x, y, xp, yp);
      }
    }

    var check_no_move = function() {
      if (response.RT == tmp_RT) {
        trigger_write(15);
        clearInterval(interval);
        console.log('Stop RT was ' + response.RT + ' ms');
        
        if (!movement_stopped && response.stop_times.length === 0) {
          response.stop_times.push(performance.now() - trial_start_time);
        }
        
        if (response.RT > 500) {
          response.exclude = 'remember: try to stop';
        } else if (response.wrong_way / response.go_pos_x.length > 0.25) {
          response.exclude = 'wrong way';
        } else if (response.incorrect_movement / response.go_pos_x.length > 0.5) {
          response.exclude = 'too far from the circle';
        } else if (response.too_slow / response.go_pos_x.length > 0.25 ||
                   response.goRT == null) {
          response.exclude = 'too slow';
        } else if (response.RT == null) {
          response.exclude = 'remember: don\'t stop too early';
        } else {
          response.exclude = 'no';
        }
        
        if (trial.feedback) {
          display_element.innerHTML = '<p style="font-size: 44px;">' +
            (response.exclude == 'no' ? correct_msg : response.exclude) + '</p>';
          if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
              display_element.innerHTML = '';
              end_trial();
            }, counter + Math.round(response.RT) + trial.feedback_duration);
          }
        } else {
          end_trial();
        }
      } else {
        tmp_RT = response.RT;
      }
    }

    document.addEventListener('mousemove', mouse_move_event);

    var counter = 0;
    
    // Always set up the start signal, regardless of fixation_duration
    var fixation_time = trial.fixation_duration || 0;
    counter += fixation_time;
    
    jsPsych.pluginAPI.setTimeout(function() {
      display_element.innerHTML = stimuli[0];
      showPhotodiodeBox();
      trigger_write(11);
      
      // ===== FIXED: Record timestamps when signals actually appear =====
      start_signal_timestamp = performance.now();
      trial_start_time = performance.now();  // Set reference time
      
      console.log('PLUGIN: Start signal appearing at:', start_signal_timestamp);
      
      go = true;
      start_movement_detection();
    }, counter);

    var number_times = [];
    for (i = 1; i < stimuli.length; i++) {
      if (stop_time == null || trial.time - i + 1 > stop_time) {
        counter += 1000;
        let my_stimuli = stimuli[i];
        let stim_idx = trial.time - i + 1;
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.innerHTML = my_stimuli;
          trigger_write(stim_idx);
          number_times.push(performance.now());
        }, counter);
      }
    }

    // show stop at end
    var stop_time2;
    counter += my_stop_time;
    jsPsych.pluginAPI.setTimeout(function() {
        display_element.innerHTML = stop;
        trigger_write(stop_time == null ? 13 : 14);
        
        // ===== FIXED: Record stop_signal timestamp when it actually appears =====
        stop_signal_timestamp = performance.now();
        
        console.log('PLUGIN: Stop signal appearing at:', stop_signal_timestamp);
        console.log('PLUGIN: Time difference from start:', (stop_signal_timestamp - start_signal_timestamp), 'ms');
        
        if(trial.tone !== null) {
          try {
            if(context !== null && source){
              source.start(context.currentTime);
            } else if (audio) {
              audio.play();
            }
          } catch (e) {
            console.warn('Audio playback failed:', e);
          }
        }
        go = false;
        stop_time2 = performance.now();
        tmp_RT = response.RT;
        interval = setInterval(function() {
          check_no_move();
        }, 30);
      }, counter);

    if (trial.trial_duration !== null) {
      counter += trial.trial_duration
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.innerHTML = '';
        end_trial();
      }, counter);
    }
  };

  return plugin;
})();
