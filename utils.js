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
