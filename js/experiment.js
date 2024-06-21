
/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
	  var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
	  var checks_passed = 0
	  for (var i = 0; i < attention_check_trials.length; i++) {
		if (attention_check_trials[i].correct === true) {
		  checks_passed += 1
		}
	  }
	  check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

  
function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
    choice_counts[choices[k]] = 0
  }
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
		//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
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

var end_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: 'end',
    exp_id: 'choice_reaction_time'
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: assessPerformance
};



var reset_block = {
  type: 'call-function',
  data: {
    trial_id: 'reset trial'
  },
  func: function() {
    current_trial = 0
  },
  timing_post_trial: 0
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var credit_var = true

// task specific variables
var num_blocks = 3
var block_len = 50
var training_len = 20
var gap = 0
var current_trial = 0
  //set stim/response mapping
var correct_responses = jsPsych.randomization.shuffle([
  ['"F、"', 70], 
  ['"J"', 74]  
  ])

var choices = [correct_responses[0][1], correct_responses[1][1]]

const instruction = new Instruction();
const training = new Training(correct_responses, training_len);

const test = new Test(num_blocks, block_len, correct_responses);
test.generateTestStimuli();
const testBlocks = test.generateTestStimuli();

var pupil_dilation_experiment = [];
pupil_dilation_experiment.push(instruction.generateInstructionNode(correct_responses));
pupil_dilation_experiment.push(training.setupStartTrainingBlock());
pupil_dilation_experiment.push(training.setupTrainingBlock());


// choice_reaction_time_experiment.push(training.setupTrainingBlock());
// choice_reaction_time_experiment.push(reset_block)
// choice_reaction_time_experiment.push(test.setupStartTestBlock());
// testBlocks.forEach(testBlock => {
//     choice_reaction_time_experiment.push(testBlocks);
//     choice_reaction_time_experiment.push(test.setupRestBlock());
// });
// choice_reaction_time_experiment.push(test.setupAttentionNode());
// choice_reaction_time_experiment.push(end_block);
