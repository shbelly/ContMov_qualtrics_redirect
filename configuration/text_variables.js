// instructions page 1
var page1 = [
  "<p>In this experiment, a circle will appear in the center " +
  "of the screen.</p><p>Your task is to move the cursor around the " +
  "circle at a steady rate until the word <strong>STOP</strong> " +
  "appears.</p><p>On some trials, the <strong>STOP</strong> will " +
  "occur at the end of a countdown, on others it will interupt the " +
  "countdown before it is completed.</p>"
];

// instructions page 2
// Do not forget to adjust the number of blocks
page2 = [
  '<p> It is important that you not move the mouse before the <strong>START</strong> cue is shown. <\p>' +
  '<p> Remember that the task is to stop when the <strong>STOP</strong> cue is shown. <\p>' +
  '<p> We will start with a short practice block in which you will receive immediate feedback. ' +
  'You will no longer receive immediate feedback in the experimental phase. </p>'+
  '<p> However, at the end of each experimental block, ' +
  'there will be a 15 second break. During this break, we will show you some information about ' +
  'your mean performance in the previous block.</p>' +
  '<p> The experiment consists of 1 practice block and 4 experimental blocks.</p>'
];

// informed consent text
var informed_consent_text = [
  '<p> Stop here if you have not previously provided informed consent. </p>'
];

// trial by trial feedback messages
correct_msg = 'good job'

// block feedback
no_signal_header = "<p><b>GO TRIALS: </b></p>"
avg_rt_msg = "<p>Average response time = %.2f seconds</p>"
prop_inc_msg = "<p>Proportion too far from the circle = %.2f (should be 0)</p>"
prop_ww_msg = "<p>Proportion wrong way = %.2f (should be 0)</p>"
prop_slow_msg = "<p>Proportion too slow = %.2f (should be 0)</p>"
prop_early_msg = "<p>Proportion early stops = %.2f (should be 0)</p>"
stop_signal_header = "<p><b>STOP-SIGNAL TRIALS: </b></p>"
next_block_msg = "<p>You can take a short break, the next block starts in <span id='timer'>15</span></p>"
final_block_msg = "<p>Press space to continue...</p>" // after the final block they don't need a break

// other
var label_previous_button = 'Previous';
var label_next_button = 'Next';
var label_consent_button = 'I agree';
var full_screen_message = '<p>The experiment will switch to fullscreen mode when you push the button below. </p>';
var welcome_message = ['<p>Welcome to the experiment.</p>' + '<p>Press "Next" to begin.</p>'];
var not_supported_message = ['<p>This experiment requires the Chrome or Firefox webbrowser.</p>'];
var subjID_instructions = "Enter your participant ID."
var age_instructions = "Enter your age."
var gender_instructions = "Choose your gender."
var gender_options = ['Female','Male', 'Other', 'Prefer not to say']
var text_at_start_block = '<p>Press space to begin.</p>'
var get_ready_message = '<p>Get ready...</p>'
var fixation_text = '<div style="font-size:60px;">TEST</div>'
var end_message = "<p>Thank you for your participation.</p>" +
  "<p>Press space to finalize the experiment.</p>"
