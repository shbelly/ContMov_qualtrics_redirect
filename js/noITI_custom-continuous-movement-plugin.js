/**
 * custom-continuous-movement-plugin for jsPsych
 * by Alex Rockhill
 *
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

  //jsPsych.pluginAPI.registerPreload('custom-continuous-movement-plugin', 'stimulus', 'image');

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

    // setup audio
    if(trial.tone !== null) {
      var context = jsPsych.pluginAPI.audioContext();
      if(context !== null){
        var source = context.createBufferSource();
        source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.tone);
        source.connect(context.destination);
      } else {
        var audio = jsPsych.pluginAPI.getAudioBuffer(trial.tone);
        audio.currentTime = 0;
      }
    }

    var stop_time = null;
    var interval = null;  // interval time for checking for stop
    var tmp_RT = null;  // variable for storing old RT to check if changed
    if (trial.trial_type == 'stop') {
      stop_time = myrng() * (trial.time - 1 - trial.t_stop_min) + trial.t_stop_min;
    }

    var fix;
    
    var fix = '<img src="' + fix_stim +
              '"id="jspsych-image-keyboard-response-stimulus"></img>';
    var stimuli = [];

    if (pd) {
      stimuli.push('<div class="container">' +
              '<img src="' + start_stim +
                '"id="jspsych-image-keyboard-response-stimulus"></img>' +
              '<div style="bottom:0px; right:0px; position:fixed; width:200px; ' +
                   'height:200px; background-color: rgb(0, 0, 0);">pd</div>' +
              '</div>');
    } else {
      stimuli.push('<img src="' + start_stim +
                   '"id="jspsych-image-keyboard-response-stimulus"></img>');
    }

    // if shown stop at end of countdown
    var my_stop_time = 1000; 
    for (i = trial.time; i > 0; i--) {
      if (stop_time == null || i > stop_time) {
        stimuli.push('<img src="' + go_stim[i - 1] +
                     '"id="jspsych-image-keyboard-response-stimulus"></img>');
      } else {
        if (stop_time !== null) {
          my_stop_time = parseInt((i + 1 - stop_time) * 1000); // need to go back one
          break;
        }
      }
    }

    var stop;

    if (pd) {
      stop = '<div class="container">' +
             '<img src="' + stop_stim +
               '"id="jspsych-image-keyboard-response-stimulus"></img>' +
             '<div style="bottom:0px; right:0px; position:fixed; width:200px; ' +
                          'height:200px; background-color: rgb(0, 0, 0);">pd</div>' +
             '</div>';
    } else {
      stop = '<img src="' + stop_stim +
             '"id="jspsych-image-keyboard-response-stimulus"></img>';
    }

    // add prompt
    if (trial.prompt !== null){
      stimuli[i] += trial.prompt;
    }

    // draw the first images
    display_element.innerHTML = fix;

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

    // function to end trial when it is time
    var end_trial = function() {
      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(trial.tone !== null) {
        if(context !== null){
          source.stop();
          source.onended = function() { }
        } else {
          audio.pause();
        }
      }

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // remove mouse listener
      document.removeEventListener('mousemove', mouse_move_event);

      // gather the data to store for the trial
      var trial_data = {
        "trial_type": trial.trial_type,
        "count": trial.time,
        "stop_time": stop_time,
        "start_time": start_time,
        "number_times": number_times,
        "stop_signal_time": stop_signal_time,
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
      // check phase wrap around needed
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
      } else if (Math.abs(r - 0.8 * y0) / y0 > 0.5) { //circle is about 80 % of height
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
      var xp = null;  // previous location
      var yp = null;

      if (go == null) {
        return;
      } else if (go) {
        if (response.go_pos_x.length == 0){
          response.goRT = Math.round(now_time - start_time);
          trigger_write(12);
          console.log('Go RT was ' + response.goRT + ' ms');
        } else {
          xp = response.go_pos_x[response.go_pos_x.length - 1];
          yp = response.go_pos_y[response.go_pos_x.length - 1];
        }
        response.go_pos_x.push(x);
        response.go_pos_y.push(y);
        response.go_times.push(Math.round(now_time - start_time));
      } else {
        response.RT = Math.round(now_time - stop_time2); // update time every mouse move
        if (response.stop_pos_x.length > 0) {
          xp = response.stop_pos_x[response.stop_pos_x.length - 1];
          yp = response.stop_pos_y[response.stop_pos_y.length - 1];
        }
        response.stop_pos_x.push(x);
        response.stop_pos_y.push(y);
        response.stop_times.push(Math.round(now_time - stop_time2));
      }
      if (xp !== null) {
        judge_movement(x, y, xp, yp);
      }
    }

    var check_no_move = function() {
      // check if no movement every 30 ms, if so write trigger
      if (response.RT == tmp_RT) {
        trigger_write(15);
        clearInterval(interval);
        console.log('Stop RT was ' + response.RT + ' ms');
        // judge if trial should be excluded
        if (response.RT > 500) {  // will be overwritten by all others, don't have to use
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
        // give feedback
        if (trial.feedback) {
          display_element.innerHTML = '<p style="font-size: 44px;">' +
            (response.exclude == 'no' ? correct_msg : response.exclude) + '<\p>';
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

    // add listener for moving mouse
    document.addEventListener('mousemove', mouse_move_event);

    var counter = 0;
    var start_time;
    if (trial.fixation_duration !== null) {
      counter += trial.fixation_duration;
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.innerHTML = stimuli[0];
        trigger_write(11);
        go = true;
        start_time = performance.now();
      }, counter + trial.fixation_duration)
    }

    var number_times = [];
    for (i = 0; i < (stimuli.length - 1); i++) {
      if (stop_time == null || trial.time - i - 1 > stop_time) {
        counter += 1000;
        let my_stimuli = stimuli[i + 1];
        let stim_idx = trial.time - i;
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.innerHTML = my_stimuli;
          trigger_write(stim_idx);
          number_times.push(performance.now());
        }, counter);
      }
    }

    // show stop at end
    var stop_time2;
    var stop_signal_time;
    counter += my_stop_time;
    jsPsych.pluginAPI.setTimeout(function() {
        display_element.innerHTML = stop;
        trigger_write(stop_time == null ? 13 : 14);
        stop_signal_time = performance.now();
        // start audio
        if(trial.tone !== null) {
          if(context !== null){
            source.start(context.currentTime);
          } else {
            audio.play();
          }
        }
        go = false;
        stop_time2 = performance.now();
        // check if stopped
        tmp_RT = response.RT;
        interval = setInterval(function() {
          check_no_move();
        }, 30);
      }, counter);

    // trial duration cap
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
