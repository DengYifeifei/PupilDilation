/* ************************************ */
/* Define helper functions */
/* ************************************ */

function assessPerformance() {
  /* Function to calculate the "credit_var", which is a boolean used to
  credit individual experiments in expfactory. */
  var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim');
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  
  // Record choices participants made
  var choice_counts = {};
  choice_counts[-1] = 0;
  for (var k = 0; k < choices.length; k++) {
    choice_counts[choices[k]] = 0;
  }
  
  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].possible_responses != 'none') {
      trial_count += 1;
      rt = experiment_data[i].rt;
      var key = experiment_data[i].key_press;
      choice_counts[key] += 1;
      if (rt == -1) {
        missed_count += 1;
      } else {
        rt_array.push(rt);
      }
    }
  }
  
  // Calculate average rt
  var avg_rt = -1;
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array);
  }
  
  // Determine which response is rare based on P1 and (1 - P1)
  var rare_response = P1 < 0.5 ? choices[0] : choices[1];
  
  // Calculate whether response distribution is okay
  var responses_ok = true;
  if (choice_counts[rare_response] > trial_count * 0.5) {
    responses_ok = false;
  }
  
  var missed_percent = missed_count / trial_count;
  var credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok);
  jsPsych.data.addDataToLastTrial({ "credit_var": credit_var });
}


var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

var post_trial_gap = function() {
  gap = Math.floor(Math.random() * 500) + 500
  return gap;
}

var getTestTrials = function() {
  return test_trials.pop()
}

/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
  jsPsych.data.addDataToLastTrial({
    trial_num: current_trial
  })
  current_trial = current_trial + 1
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 5 ///in seconds
var credit_var = true

// task specific variables
var num_blocks = 3
var block_len = 50
var training_len = 20
var gap = 0
var current_trial = 0
  //set stim/response mapping


var correct_responses = jsPsych.randomization.shuffle([
  ['"F"', 70], 
  ['"J"', 74]  
  ])

var choices = [correct_responses[0][1], correct_responses[1][1]]
var trainingInstance = new Training(correct_responses, training_len); // Assuming trainingLen is 20
var testingInstance = new Testing(numBlocks, block_len, correctResponses, P1 = 0.25, Q1 = 0.5); // Assuming 3 blocks of 50 trials each

// Generate stimuli using class methods
var practice_stimuli = trainingInstance.generateTrainingStimuli();
var test_stimuli_block = testingInstance.generateTestStimuli();

// Example usage in timeline
var practice_block = {
  timeline: practice_stimuli.map(stimulus => ({
    type: 'html-keyboard-response',
    stimulus: stimulus.stimulus,
    choices: trainingInstance.choices,
    data: stimulus.data,
    on_finish: appendData // Assuming appendData function is defined to handle trial data
  }))
};

var test_block = {
  timeline: test_stimuli_block.map(stimulus => ({
    type: 'html-keyboard-response',
    stimulus: stimulus.stimulus,
    choices: testingInstance.choices,
    data: stimulus.data,
    on_finish: appendData // Assuming appendData function is defined to handle trial data
  }))
};

// Define the timeline
var timeline = [];

// Add practice and test blocks to the timeline
timeline.push(practice_block);

// Initialize jsPsych
jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    jsPsych.data.displayData();
  }
});