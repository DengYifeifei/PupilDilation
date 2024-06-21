class Test {
    constructor(numBlocks, blockLength, correctResponses, P1, Q1 = 0.5) {
        this.numBlocks = numBlocks;
        this.blockLength = blockLength;
        this.correctResponses = correctResponses;
        this.testTrials = [];
        this.choices = [correctResponses[0][1], correctResponses[1][1]];
        this.currentTrial = 0;
        this.P1 = P1;
        this.Q1 = Q1;
    }

    setupStartTestBlock() {
        return {
            type: 'poldrack-text',
            timing_response: 60000,
            data: { exp_id: 'pupil_dilation', trial_id: 'test_intro' },
            text: `
                <div class="centerbox">
                    <p class="block-text">
                        Now you have learned the correct response to each stimulus. Welcome to the test session!
                    </p>
                    <p class="block-text">
                        Different from the training session, now you will see two stimuli on the screen. (See the graph below for an example.) However, you will only respond to one of them. 
                        The stimulus that you should respond to would be hinted by a cue beforehand.
                    </p>
                    <p class="block-text">
                        Now let's see an example:
                    </p>
                    <div style='display: flex; justify-content: center; align-items: center; width: 700px; margin: 0 auto;'>
                        <div style='margin-right: 50px; text-align: center;'>
                            <span style='font-size: 48px;'>&#8592;</span> <!-- Left arrow -->
                            <p class='small'><strong>Press the F key</strong></p>
                        </div>
                        <div style='margin-left: 50px; text-align: center;'>
                            <span style='font-size: 48px;'>&#8594;</span> <!-- Right arrow -->
                            <p class='small'><strong>Press the J key</strong></p>
                        </div>
                    </div>
                    <p style='text-align: center;'>Press any key to begin.</p>
                </div>
            `,
            cont_key: [13],
            timing_post_trial: 1000
        };
    }
  
    setupRestBlock(currentBlock) {
        const isLastBlock = currentBlock === this.numBlocks - 1;
        const text = isLastBlock
            ? '<div class="centerbox"><p class="center-block-text">You have reached the end of the study! Thank you!</p></div>'
            : `<div class="centerbox"><p class="center-block-text">Time for a break! You have completed block ${currentBlock + 1} out of ${this.numBlocks}. Press <strong>enter</strong> to continue.</p></div>`;
        
        return {
            type: 'poldrack-text',
            data: {
                trial_id: "test_rest"
            },
            timing_response: 180000,
            text: text,
            cont_key: [13],
            timing_post_trial: 1000
        };
    }

    createTestBlock(blockLength) {
        const stimuli = [{
            stimulus: '<div class="centerbox" style="display: flex; justify-content: center; align-items: center; height: 100vh;"><img src="img/blue.png" style="width: 33.33vw; height: auto;" /></div>',
            data: {
                stim_id: 1,
                trial_id: 'stim',
                exp_stage: 'test',
                correct_response: this.correctResponses[0][1]
            }
        }, {
            stimulus: '<div class="centerbox" style="display: flex; justify-content: center; align-items: center; height: 100vh;"><img src="img/orange.png" style="width: 33.33vw; height: auto;" /></div>',
            data: {
                stim_id: 2,
                trial_id: 'stim',
                exp_stage: 'test',
                correct_response: this.correctResponses[1][1]
            }
        }];
    
        const cues = [{
            stimulus: '<div class="centerbox" style="font-size: 48px;">&#8592;</div>', // Left arrow
            data: {
                cue: 'left'
            }
        }, {
            stimulus: '<div class="centerbox" style="font-size: 48px;">&#8594;</div>', // Right arrow
            data: {
                cue: 'right'
            }
        }];
    
        const sampleStimulus = () => {
            return Math.random() < this.P1 ? stimuli[0] : stimuli[1];
        };
    
        const sampleCue = () => {
            return Math.random() < this.Q1 ? cues[0] : cues[1];
        };
    
        const createTrial = () => {
            const leftStimulus = sampleStimulus();
            const rightStimulus = sampleStimulus();
            const cue = sampleCue();
    
            return {
                timeline: [
                    {
                        type: 'html-keyboard-response',
                        stimulus: cue.stimulus,
                        choices: jsPsych.NO_KEYS,
                        trial_duration: 1000 // Duration for which the cue is displayed
                    },
                    {
                        type: 'poldrack-categorize',
                        stimulus: `
                            <div class="centerbox" style="display: flex; justify-content: space-between; align-items: center; height: 100vh;">
                                <div style="flex: 1; display: flex; justify-content: center;">${leftStimulus.stimulus}</div>
                                <div style="flex: 1; display: flex; justify-content: center;">${rightStimulus.stimulus}</div>
                            </div>
                        `,
                        choices: this.choices,
                        data: {
                            trial_id: 'stim',
                            exp_stage: 'test',
                            cue: cue.data.cue,
                            left_stim_id: leftStimulus.data.stim_id,
                            right_stim_id: rightStimulus.data.stim_id,
                            left_correct_response: leftStimulus.data.correct_response,
                            right_correct_response: rightStimulus.data.correct_response,
                            correct_response: cue.data.cue === 'left' ? leftStimulus.data.correct_response : rightStimulus.data.correct_response
                        },
                        correct_text: '<div class="centerbox"><div style="color:green;" class="center-text">Correct!</div></div>',
                        incorrect_text: '<div class="centerbox"><div style="color:red;" class="center-text">Incorrect</div></div>',
                        timeout_message: '<div class="centerbox"><div class="center-text">Respond Faster!</div></div>',
                        timing_response: 2000,
                        timing_stim: 2000,
                        timing_feedback_duration: 1000,
                        show_stim_with_feedback: false,
                        timing_post_trial: 1000 // You need to define `post_trial_gap` if you want to use it
                    }
                ]
            };
        };
    
        const blockTrials = [];
        for (let i = 0; i < blockLength; i++) {
            blockTrials.push(createTrial());
        }
    
        return {
            timeline: blockTrials
        };
    }

    generateTestStimuli() {
        for (let b = 0; b < this.numBlocks; b++) {
            this.testTrials.push(this.createTestBlock(this.blockLength));
            // Add a rest block after each block except the last one
            if (b < this.numBlocks - 1) {
                this.testTrials.push(this.setupRestBlock(b));
            }
        }
    }
}
