class Training {
    constructor(correctResponses, trainingLen) {
        this.correctResponses = correctResponses;
        this.trainingLen = trainingLen;
        this.choices = correctResponses.map(response => response[1]);
        this.trainingPassedMessage = {
            type: 'html-keyboard-response',
            stimulus: `
                <p>Congratulations! Your accuracy has reached 90%. Time to move on to the actual test.</p>
                <p>Press any key to continue.</p>
            `
        };
        this.trainingRetryMessage = {
            type: 'html-keyboard-response',
            stimulus: `
                <p>To better familiarize you with the stimuli and action pair let's practice again.</p>
                <p>Press any key to continue.</p>
            `
        };
    }

    setupStartTrainingBlock() {
        return {
            type: 'poldrack-text',
            timing_response: 60000,
            data: {exp_id: 'pupil_dilation', trial_id: 'training_intro'},
            text: `
            <div class="centerbox">
                <p class="block-text">
                    Let's see if you have remembered the rules!
                    Again, if you see the <font color="blue">blue</font> circle, you should press the <strong>${this.correctResponses[0][0]}</strong> key. 
                    If you see the <font color="orange">orange</font> square, you should press the <strong>${this.correctResponses[1][0]}</strong> key.
                    You will receive feedback telling you if you were correct. 
                    Press <strong>enter</strong> to begin.
                </p>
            </div>
        `,
            cont_key: [13],
            timing_post_trial: 1000
        };
    }

    generateTrainingStimuli() {
        return [{
            stimulus: '<div class="centerbox" style="display: flex; justify-content: center; align-items: center; height: 100vh;"><img src="img/blue.png" style="width: 33.33vw; height: auto;" /></div>',
            data: {
                stim_id: 1,
                trial_id: 'stim',
                exp_stage: 'training'
            },
            key_answer: this.correctResponses[0][1]
        }, {
            stimulus: '<div class="centerbox" style="display: flex; justify-content: center; align-items: center; height: 100vh;"><img src="img/orange.png" style="width: 33.33vw; height: auto;" /></div>',
            data: {
                stim_id: 2,
                trial_id: 'stim',
                exp_stage: 'training'
            },
            key_answer: this.correctResponses[1][1]
        }];
    }

    setupTrainingBlock() {
        const trainingStimuli = this.generateTrainingStimuli();
    
        const selectedStimuli = [];
        for (let i = 0; i < this.trainingLen; i++) {
            // Randomly select either 0 or 1 and push the corresponding stimulus to selectedStimuli
            const randomIndex = Math.floor(Math.random() * trainingStimuli.length);
            selectedStimuli.push(trainingStimuli[randomIndex]);
        }
    
        // Variables to track correct responses
        let correctResponses = 0;
        let totalTrials = 0;
    
        return {
            type: 'poldrack-categorize',
            timeline: selectedStimuli,
            is_html: true,
            data: {
                trial_id: 'training_trail',
                exp_stage: 'training'
            },
            correct_text: '<div class="centerbox"><div style="color:green;" class="center-text">Correct</div></div>',
            incorrect_text: '<div class="centerbox"><div style="color:red;" class="center-text">Incorrect</div></div>',
            timeout_message: '<div class="centerbox"><div class="center-text">Please Respond Faster</div></div>',
            choices: this.choices,
            timing_response: 500,
            timing_stim: 500,
            timing_feedback_duration: 100,
            show_stim_with_feedback: false,
            timing_post_trial: 500,  // You need to define `post_trial_gap` if you want to use it
            on_finish: function(data) {
                totalTrials++;
                if (data.correct) {
                    correctResponses++;
                }
    
                // Calculate correct response rate
                const correctRate = (correctResponses / totalTrials) * 100;
    
                // If correct rate exceeds 90%, end training session
                if (correctRate > 90) {
                    jsPsych.endCurrentTimeline();
                    jsPsych.addNodeToEndOfTimeline(this.trainingPassedMessage);
                } else if (totalTrials === this.trainingLen) {
                    jsPsych.endCurrentTimeline();
                    jsPsych.addNodeToEndOfTimeline(this.trainingRetryMessage);
                }
            }.bind(this) // Bind `this` to ensure proper context
        };
    }
}
