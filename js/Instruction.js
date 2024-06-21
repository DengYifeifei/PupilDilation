class Instruction {
    constructor() {
        // Initialize any properties here, such as instruction texts or conditions
        this.feedbackInstructText = 'Welcome to the experiment. Press <strong>enter</strong> to begin.';
        this.instructions = [
            '<p>In this experiment, you will need to respond to different stimuli according to the cues by pressing specific keys. Your points will be determined by both your reaction time and accuracy.</p>' +
            '<p>If the circle is <strong>blue</strong>, press the letter <strong> {correctResponse0}</strong> on the keyboard as fast as you can.</p>' +
            '<p>If the circle is <strong>orange</strong>, press the letter <strong> {correctResponse1}</strong> as fast as you can.</p>' +
            '<div>' +
            '<div class="inline-block">' +
            '<img src="img/blue.png" alt="Blue Image">' +
            '<p><strong>Press the {correctResponse0} key</strong></p>' +
            '</div>' +
            '<div class="inline-block">' +
            '<img src="img/orange.png" alt="Orange Image">' +
            '<p><strong>Press the {correctResponse1} key</strong></p>' +
            '</div>' +
            '</div>'
        ];          
        this.sumInstructTime = 0; // ms
        this.instructTimeThresh = 10; // in seconds
    }

    getInstructFeedback() {
        return '<div class="centerbox"><p class="center-block-text">' + this.feedbackInstructText + '</p></div>';
    }

    generateInstructionNode(correct_responses) {
        let feedbackBlock = {
            type: 'poldrack-text',
            cont_key: [13], // The 'Enter' key
            data: {
                trial_id: 'instruction'
            },
            text: this.getInstructFeedback(),
            timing_post_trial: 0,
            timing_response: 180000 // 3 minutes to read the feedback
        };

        let instructionsBlock = {
            type: 'poldrack-instructions',
            pages: this.instructions.map(page => 
                page.replace('{correctResponse0}', correct_responses[0][0])
                    .replace('{correctResponse1}', correct_responses[1][0])),
            allow_keys: false,
            data: {
                trial_id: 'instruction'
            },
            show_clickable_nav: true,
            timing_post_trial: 600 
        };

        return {
            timeline: [feedbackBlock, instructionsBlock],
            loop_function: data => this.checkInstructions(data)
        };
    }

    checkInstructions(data) {
        for (let i = 0; i < data.length; i++) {
            if ((data[i].trial_type === 'poldrack-instructions') && (data[i].rt !== -1)) {
                this.sumInstructTime += data[i].rt;
            }
        }
        if (this.sumInstructTime <= this.instructTimeThresh * 1000) {
            this.feedbackInstructText =
                'Read through instructions too quickly. Please take your time and make sure you understand the instructions. Press <strong>enter</strong> to continue.';
            return true; // Loop again
        } else {
            this.feedbackInstructText =
                'Press <strong>enter</strong> to continue.';
            return false; // Don't loop
        }
    }
}
