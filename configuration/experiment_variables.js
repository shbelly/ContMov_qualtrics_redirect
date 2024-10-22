/* #########################################################################

  Customize the experiment

########################################################################## */

// ----- CUSTOMISE THE STIMULI AND RESPONSES -----
// locate the stimuli that will be used in the experiment
var pd = true;  // whether to add photodiode dark square in the corner during fixation
var fix_stim = 'images/fix.png';
var circle_stim = 'images/circle.png';
var go_stim = ['images/go_stim1.png', 'images/go_stim2.png', 'images/go_stim3.png',
			   'images/go_stim4.png', 'images/go_stim5.png', 'images/go_stim6.png',
			   'images/go_stim7.png', 'images/go_stim8.png', 'images/go_stim9.png',
			   'images/go_stim10.png'];
var start_stim = 'images/start.png';
var stop_stim = 'images/stop.png';
var tone_stim = 'audio/tone.mp3';


// ----- CUSTOMISE THE BASIC DESIGN -----

// Define the proportion of stop signals.
// This will be used to determine the number of trials of the basic design (in the main experiment file):
// Ntrials basic design = number of stimuli / proportion of stop signals
// E.g., when nprop = 1/4 (or .25), then the basic design contains 8 trials (2 * 4).
// The following values are allowed: 1/6, 1/5, 1/4, 1/3. 1/4 = default (recommended) value

var nprop = 1/2;

// How many times should we repeat the basic design per block?
// E.g. when NdesignReps = 8, Nsecs.length=4 and nprop = 1/4 (see above),
// the number of trials per block = 64 (4 * 1 / (1 / 4))
// Do this for the practice and experimental phases (note: practice can never be higher than exp)

var NdesignReps_practice = 4;
var NdesignReps_exp = 5;

// Number of experimental blocks (excluding the first practice block).
// Note that NexpBl = 0 will still run the practice block

var NexpBL = 4;

// Number of seconds used to count down

var Nsecs = [6, 5, 4, 3];

// Range of seconds at which the stop occurs (uniform)

var tSTOPmin = 0.5 // minimum countdown time at which to stop
var tSTOPmax = 2.5   // maximum time at which to stop
//note: must be less than least Nsecs value


// ----- CUSTOMISE THE TIME INTERVALS (in milliseconds)-----

var ITI = 2000;   // fixed blank intertrial interval
var FIX = 250;    // fixed fixation presentation
var MAXRT = 1250; // fixed maximum reaction time
var iFBT = 750;   // immediate feedback interval (during the practice phase)
var bFBT = 15000; // break interval between blocks


// ----- CUSTOMISE INPUT/OUTPUT VARIABLES -----
// participant ID:
// - ID via participant (e.g. when the participant gets a number via experimenter)
// - ID via the URL of the experiment: 'XXXX.html?subject=15'(subject is the current keyword)
// - determine ID at random with jsPsych.randomization.randomID().

var id = 'participant' // use one of these three options: 'participant', 'url', 'random'


// ----- CUSTOMISE SCREEN VARIABLES -----
// Please note that Safari does not support keyboard input when in full mode!!!
// Therefore, this browser will be excluded by default

var fullscreen = true; // Fullscreen mode or not?
var minWidth = 800; // minimum width of the experiment window
var minHeight = 600; // minimum height of the experiment window


// ----- CUSTOMISE END-OF-EXPERIMENT REDIRECTION -----
// !!!!! use https ! (and link to your own experiment with https)
// should we redirect to another URL when the experiment ends? (useful for redirecting to e.g. Prolific or MTurk)

var redirect_onCompletion = true;
var redirect_link = 'html/debrief.html'
