// English paper submission data (ES Module)
export const SUBMISSION_DATA_EN = {
    tiers: [
        {
            id: 'tier_1',
            name: 'Predatory Journal',
            description: 'Academic landfill. Pay the fee, get published.',
            baseCost: 2500,
            kFactor: 5000,
            baseRate: 0.60,
            maxBaseChance: 0.95,
            rebuttalSwing: 0.05,
            questionConfig: { total: 1, funny: 1, tech: 0 },
            rewardCitations: 50,
            rewardMultiplier: 1,
            targets: [
                'IJCSWI (Intl. Journal of Ctrl+C & Ctrl+V)',
                'JPTP (Pay-To-Publish Daily)',
                'Proc. of Fake IEEE',
                'Journal of Nowhere'
            ]
        },
        {
            id: 'tier_2',
            name: 'Mainstream Conf. (Tier-B)',
            description: 'Conference is in Hawaii. People are totally there for the science (sure).',
            baseCost: 50000,
            kFactor: 150000,
            baseRate: 0.30,
            maxBaseChance: 0.85,
            rebuttalSwing: 0.10,
            questionConfig: { total: 2, funny: 1, tech: 1 },
            rewardCitations: 800,
            rewardMultiplier: 5,
            targets: ['ICASSP', 'COLING', 'BMVC', 'WACV', 'INTERSPEECH']
        },
        {
            id: 'tier_3',
            name: 'Top-Tier',
            description: 'The Alchemist\'s Arena. Reviewer #2 is sharpening the knife...',
            baseCost: 1000000,
            kFactor: 5000000,
            baseRate: 0.10,
            maxBaseChance: 0.75,
            rebuttalSwing: 0.15,
            questionConfig: { total: 3, funny: 2, tech: 1 },
            rewardCitations: 15000,
            rewardMultiplier: 20,
            targets: ['NeurIPS', 'ICML', 'CVPR', 'ICLR', 'AAAI']
        }
    ],
    flavorText: {
        accepted: [
            'Reviewer didn\'t understand it but felt intimidated. Accept!',
            'Paper accepted! Mostly thanks to Random Seed 42.',
            'Oral Presentation! Your PPT is better than your experiments.',
            'Congrats! You are one step closer to graduation (0.01%).',
            'Reviewer loved your color palette. Accept!'
        ],
        rejected: [
            'Reviewer #2 says you failed to cite a paper from 1998.',
            'Reviewer says your Related Work reads like a blog post.',
            'Rejection Reason: \"Lacks Novelty\" (Translation: I didn\'t get it).',
            'Area Chair says your formatting is wrong. Go relearn MS Word.',
            'Reviewer asked 10 questions and questioned your mental health.',
            'Rejected, but the reviewer wishes you good health.'
        ]
    },
    questionPool: {
        funny: [
            {
                q: 'Reviewer #2 points out your Related Work missed a key paper, implying you should cite him?',
                options: ['Argue it is irrelevant', 'Add it and praise it heavily', 'Withdraw paper'],
                correct: 1,
                comment: 'Correct! You have mastered academic politics.'
            },
            {
                q: 'Results are 0.5% worse than Baseline. 1 hour to deadline?',
                options: ['Report honestly', 'Hack the seed until it looks good', 'Claim it is a \"Trade-off\"'],
                correct: 1,
                comment: 'Correct! Seed 42 is the answer to everything.'
            },
            {
                q: 'Reviewer asks: Why no experiments on ImageNet? (You have no GPUs)',
                options: ['No cards, poor', 'This research focuses on Low-resource scenarios', 'ImageNet is outdated'],
                correct: 1,
                comment: 'Correct! Packaging \"Poverty\" as \"Optimization\" is a vital skill.'
            },
            {
                q: 'During Rebuttal, Reviewer requests a 2-week experiment. Rebuttal ends in 3 days?',
                options: ['Pull all-nighters', 'Admit defeat', 'Thanks for the suggestion, we leave it for Future Work'],
                correct: 2,
                comment: 'Correct! Future Work = Work we will never do.'
            },
            {
                q: 'Advisor wants his son as 2nd author. His son just turned 3.',
                options: ['Refuse, academic integrity', 'Sure, that is basically me anyway', 'Make him 1st author'],
                correct: 1,
                comment: 'Correct! He pays the salary (not much though).'
            },
            {
                q: 'Found a bug in the code, but fixing it lowers accuracy?',
                options: ['Fix bug, rewrite paper', 'Pretend the bug is a Feature', 'Keep bug for \"Reproducibility\"'],
                correct: 1,
                comment: 'Correct! We call this \"Bug-based Adversarial Training\".'
            },
            {
                q: 'Reviewer questions your English phrasing?',
                options: ['I am a Native Speaker', 'ChatGPT wrote it, ask OpenAI', 'My advisor wrote this part'],
                correct: 1,
                comment: 'Correct! Blaming AI is the new survival rule.'
            },
            {
                "q": "Reviewer #1 thinks your method is Trivial and lacks mathematical complexity.",
                "options": [
                  "Force in some Greek letters and integrals to look fancy",
                  "Admit it is simple",
                  "Reply: 'Simple yet Effective' is our design philosophy"
                ],
                "correct": 2,
                "comment": "Correct! 'Simple yet Effective' is the ultimate academic shield."
              },
              {
                "q": "Reviewer #2 asks you to compare against a paper uploaded to arXiv yesterday.",
                "options": [
                  "Reimplement that paper overnight",
                  "Reply: That is Concurrent Work, no comparison needed",
                  "Withdraw, I am unworthy"
                ],
                "correct": 1,
                "comment": "Correct! If it's not peer-reviewed, it doesn't exist (unless you want to fight)."
              },
              {
                "q": "Reviewer #3 asks: Why is there no code link?",
                "options": [
                  "Truth: Code is spaghetti, too shy to share",
                  "Reply: 'Code will be released upon acceptance'",
                  "Link an empty GitHub repo"
                ],
                "correct": 1,
                "comment": "Correct! This usually means 'Code will never be released'."
              },
              {
                "q": "R1 and R2 have opposite opinions. R1 says 'Novel', R2 says 'Boring'.",
                "options": [
                  "Point out R2 is an idiot",
                  "Thank R1 profusely, downplay R2's comment",
                  "Try to merge their views"
                ],
                "correct": 1,
                "comment": "Correct! Embrace one, deflect the other. That is politics."
              },
              {
                "q": "Reviewer questions your massive parameter count and slow inference speed.",
                "options": [
                  "Admit inefficiency",
                  "Reply: We haven't optimized yet (Future Work)",
                  "Reply: We are exploring the Upper Bound of model capability"
                ],
                "correct": 2,
                "comment": "Correct! If it's slow, say it's a sacrifice for 'Science'."
              },
              {
                "q": "Reviewer suggests the visualizations in Figure 3 look Cherry-picked.",
                "options": [
                  "They totally are, others look terrible",
                  "Reply: These samples are 'Representative'",
                  "Generate 10k images again"
                ],
                "correct": 1,
                "comment": "Correct! As long as you don't say it, it's 'Random'."
              },
              {
                "q": "Reviewer asks about strange Hyperparameters. Why learning_rate=0.00037?",
                "options": [
                  "Tried 100 numbers, only this one worked",
                  "Reply: Based on Empirical Grid Search",
                  "It's my birthday"
                ],
                "correct": 1,
                "comment": "Correct! Call your random guessing 'Empirical Search'. Professional."
              },
              {
                "q": "Reviewer asks why you only ran 3 Seeds instead of 10?",
                "options": [
                  "No other seeds achieved SOTA",
                  "Reply: Due to Computational Constraints",
                  "Run the other 7 now"
                ],
                "correct": 1,
                "comment": "Correct! 'Computational Constraints' and 'Environment' are the best excuses."
              },
              {
                "q": "Reviewer says your 'Novelty' is just applying Method A to Task B (Incremental).",
                "options": [
                  "Admit it's low effort",
                  "Reply: This validates 'Generalizability' and provides Insights",
                  "Insult their taste"
                ],
                "correct": 1,
                "comment": "Correct! If no innovation, emphasize 'Validation' and 'Insight'."
              },
              {
                "q": "Reviewer points out a derivation error in Eq (3).",
                "options": [
                  "It's over, the core is rotten",
                  "Reply: Thanks, just a Typo, conclusions hold",
                  "Pretend you didn't see it"
                ],
                "correct": 1,
                "comment": "Correct! If the code runs, math errors are always 'Typos'."
              },
              {
                "q": "Reviewer says: 'This paper is better suited for an Engineering venue, not here'.",
                "options": [
                  "Withdraw and transfer",
                  "Ask AI to hallucinate a theoretical proof section",
                  "Reply: You are right, but I won't change it"
                ],
                "correct": 1,
                "comment": "Correct! Math is like the plot in adult films; nobody reads it, but it must be there."
              },
              {
                "q": "Reviewer asks: Why no Ablation Study removing core module X?",
                "options": [
                  "That's the only new thing, removing it breaks everything",
                  "Lie",
                  "Run an experiment removing X all night"
                ],
                "correct": 1,
                "comment": "Correct! Use 'Trivial' or 'Out of Scope' to hide your fear."
              },
              {
                "q": "Reviewer #2 gives Strong Reject: 'I did not understand this paragraph'.",
                "options": [
                  "Admit poor writing",
                  "Reply: We will rewrite for better Clarity",
                  "Reply: Go back to school"
                ],
                "correct": 1,
                "comment": "Correct! No matter how angry you are, always say 'We will clarify'."
              },
              {
                "q": "Reviewer says your User Study only has 5 people. Sample size too small.",
                "options": [
                  "The 5 people are me and my roommates",
                  "Reply: This is Qualitative Analysis, not Quantitative",
                  "Grab 50 strangers from the street"
                ],
                "correct": 1,
                "comment": "Correct! Small sample = 'Qualitative'. Big sample = 'Statistically Significant'."
              },
              {
                "q": "Paper is 1 page over limit. Reviewer suggests cutting content.",
                "options": [
                  "Cut core experiments",
                  "Hack the vspace in LaTeX",
                  "Reply: We will reorganize for clarity"
                ],
                "correct": 1,
                "comment": "Correct! Layout Wizardry. Never cut text, just shrink the whitespace."
              },
            { q: 'Reviewer #2 gave a Strong Reject because "this paper reminds me of my ex\'s research".', options: ['Request a new reviewer', 'Sympathize with their heartbreak in the Rebuttal', 'Cite their ex\'s paper and praise it lavishly'], correct: 2, comment: 'Correct! Academic drama is best resolved with citations.' },
            { q: 'Reviewer claims your method "lacks theoretical support," but you copied it from their paper?', options: ['Point out it is their own method', 'Pretend not to know and add theoretical analysis', 'Suspect they haven\'t read their own paper'], correct: 1, comment: 'Correct! Never let a reviewer realize their own stupidity.' },
            { q: 'Three reviewers gave scores of 8, 3, and 3. What will the Area Chair do?', options: ['Take the average, Accept', 'Listen to the majority, Reject', 'Let the three fight it out, see who wins'], correct: 2, comment: 'Correct! This is the charm of academic democracy.' },
            { q: 'Reviewer asks you to compare with 20 Baselines, but you only have GPU for 3?', options: ['Borrow cards from classmates', 'Only run the Baselines you can beat', 'Claim other methods are "unreproducible"'], correct: 2, comment: 'Correct! "Unreproducible" is the ultimate shield.' },
            { q: 'Reviewer says "experiments are insufficient," but you already ran 200?', options: ['Put all 200 experiments in', 'Ask exactly how many they want', 'Run 200 more, it\'s not his electricity bill'], correct: 0, comment: 'Correct! Conquer them with the thickness of your Appendix.' },
            { q: 'The Reviewer\'s comment is just one sentence: "Not good enough."', options: ['Ask for a detailed explanation', 'Reply "Your review is not good enough either."', 'Silently accept your fate'], correct: 0, comment: 'Correct! Though they probably won\'t reply to you anyway.' },
            { q: 'One Reviewer says your Related Work is too long, another says it\'s too short?', options: ['Pick a medium length', 'Satisfy both requirements separately', 'Let them argue in the Rebuttal'], correct: 1, comment: 'Correct! Schrödinger\'s Related Work: simultaneously too long and too short.' },
            { q: 'Reviewer asks "Why not use GPT-4 for experiments," but the API cost is $10,000?', options: ['Say budget is limited', 'Say it is out of the scope of this research', 'Ask if they can reimburse you'], correct: 1, comment: 'Correct! "Out of scope" allows you to reject all unreasonable demands.' },
            { q: 'You discover the Reviewer is a direct competitor in this field?', options: ['Request recusal', 'Cite them heavily in the paper', 'Accept fate and prepare to resubmit elsewhere'], correct: 1, comment: 'Correct! Bribery via citation is an unspoken rule of academia.' },
            { q: 'Reviewer says your paper "reads like an undergraduate assignment"?', options: ['I AM an undergraduate', 'Rewrite it using GPT-4', 'Reply "Thanks for the compliment, my advisor says so too"'], correct: 1, comment: 'Correct! AI writing levels have surpassed most grad students.' },
            { q: 'Reviewer smuggles in a request for you to cite 8 of their own papers?', options: ['Cite them all', 'Cite the 2 most relevant ones', 'Report them for academic misconduct'], correct: 1, comment: 'Correct! A symbolic citation maintains the peace.' },
            { q: 'Reviewer says "experimental results are not convincing" but doesn\'t say why?', options: ['Guess and add experiments', 'Ask them to point out specific issues', 'Bold all the numbers to make them look more confident'], correct: 1, comment: 'Correct! Even though they probably don\'t know either.' },
            { q: 'Reviewer\'s comments are copy-pasted from another paper, they didn\'t even change the title?', options: ['Screenshot and report', 'Pretend not to see it', 'Reply "You might have the wrong number"'], correct: 0, comment: 'Correct! This kind of lazy behavior must be reported.' },
            { q: 'Reviewer suddenly disappears during Rebuttal?', options: ['Spam @ mention them', 'Write a complaint to the AC', 'Pray they are too busy rather than ignoring you'], correct: 1, comment: 'Correct! The AC is your last hope.' },
            { q: 'Reviewer says your novelty "was done back in 1990" but provides no citation?', options: ['Search for 1990 papers yourself', 'Demand they provide a citation', 'Reply that Deep Learning didn\'t exist in 1990'], correct: 1, comment: 'Correct! Accusations without citations are just bullying.' },
            // ========== Advisor Related ==========
            { q: 'Advisor wants to be first author, but you grinded for a whole year?', options: ['Fight for your rights', 'Accept it silently', 'Be passive-aggressive in the Acknowledgements'], correct: 1, comment: 'Correct! Your diploma is still in his hands.' },
            { q: 'Advisor says "this direction is promising," but last week he said that about another one?', options: ['Work on the new one', 'Stick to the old one', 'Do both and die of exhaustion'], correct: 2, comment: 'Correct! The daily life of a PhD student.' },
            { q: 'Advisor texts at 11 PM Friday: "Let\'s chat"?', options: ['Reply instantly', 'Pretend you didn\'t see it', 'Reply Monday saying "Just saw this"'], correct: 0, comment: 'Correct! The terror of "Let\'s chat" rules every grad student.' },
            { q: 'Advisor gave your code to a junior student, and the junior got first author?', options: ['Demand your name be added', 'Confront the advisor', 'Silently note this debt in your heart'], correct: 2, comment: 'Correct! Revenge is a dish best served after graduation.' },
            { q: 'Advisor asks you to tutor his son in high school math?', options: ['Refuse', 'Agree', 'Agree but charge a fee'], correct: 1, comment: 'Correct! This is technically part of "research training" (trust me).' },
            { q: 'Advisor looks at your draft and says "it\'s okay"?', options: ['Happy, submit immediately', 'Anxious, what does "okay" mean?', 'Ask for specific feedback'], correct: 2, comment: 'Correct! "Okay" is a Schrödinger\'s evaluation.' },
            { q: 'Advisor criticizes your work as "worthless" in front of the whole group?', options: ['Argue back on the spot', 'Accept it in silence', 'Talk privately after the meeting'], correct: 2, comment: 'Correct! Save the advisor\'s face, and leave yourself a way out.' },
            { q: 'Advisor promised a recommendation letter, but it\'s the deadline and he hasn\'t written it?', options: ['Nag frantically', 'Write it yourself and ask him to sign', 'Wait and trust the advisor'], correct: 1, comment: 'Correct! An open secret in academia.' },
            { q: 'Advisor says "your progress is a bit slow," but you work 12 hours a day?', options: ['Explain your workload', 'Work harder', 'Question the meaning of life'], correct: 2, comment: 'Correct! PhD = Permanent Head Damage.' },
            { q: 'Advisor asks "have you considered deferring graduation"?', options: ['Refuse firmly', 'Politely mention financial pressure', 'Ask "Have you considered increasing my salary?"'], correct: 1, comment: 'Correct! Use poverty to fight off the threat of deferral.' },
            // ========== Experiment Related ==========
            { q: 'Model performance suddenly improved by 10%, but you don\'t know what changed?', options: ['Check code carefully', 'Ignore it, write the paper fast', 'Attribute it to "mysterious hyperparameter tuning"'], correct: 1, comment: 'Correct! If it runs, don\'t ask why.' },
            { q: 'Experiment ran for 3 days, server power went out just before results?', options: ['Cry violently', 'Check if there is a checkpoint', 'Suspect sabotage by competitors'], correct: 1, comment: 'Correct! Checkpoints are a researcher\'s lifeline.' },
            { q: 'Your method works great on MNIST, but fails on real data?', options: ['Claim it is a "Proof of Concept"', 'Only report MNIST results', 'Go back and tune parameters'], correct: 0, comment: 'Correct! MNIST is the alpha and the omega.' },
            { q: 'Experimental results are completely opposite to theoretical expectations?', options: ['Modify theory to fit results', 'Redo experiments', 'Discover a "counter-intuitive" new phenomenon'], correct: 2, comment: 'Correct! "Counter-intuitive" sounds much more advanced than "I messed up."' },
            { q: 'Found the GPU is occupied by a senior student\'s mining script?', options: ['Secretly kill his process', 'Negotiate with him', 'Report to advisor'], correct: 1, comment: 'Correct! Peaceful coexistence, shared compute.' },
            { q: 'Changed random seed and results went from SOTA to last place?', options: ['Report only the best seed', 'Report average of multiple seeds', 'State in paper "We used seed 42"'], correct: 1, comment: 'Correct! Even though everyone just reports the best one.' },
            { q: 'Baseline code results are 5% better than reported in their paper?', options: ['Contact authors to confirm', 'Use the higher result you got', 'Pretend not to see, use paper numbers'], correct: 0, comment: 'Correct! Academic integrity starts with verifying data.' },
            { q: 'Experiment needs 10,000 labeled data points, but it\'s just you?', options: ['Hire undergrads', 'Use GPT-4 to auto-label', 'Reduce data and claim "low-resource scenario"'], correct: 2, comment: 'Correct! Turning a predicament into a research direction is a core skill.' },
            { q: 'Model Loss stays at 0.6931 (ln2) during training?', options: ['Model isn\'t learning, check code', 'This is a stable loss', 'Increase training epochs'], correct: 0, comment: 'Correct! Usually means the model is guessing randomly (binary classification).' },
            { q: 'Ablation studies show every module you proposed is useless?', options: ['Report honestly', 'Adjust settings until they are useful', 'Claim these modules have "synergistic effects"'], correct: 2, comment: 'Correct! 1+1>2, that is the magic of Deep Learning.' },
            // ========== Submission Related ==========
            { q: 'Deadline is in 2 hours, but you are missing one Section?', options: ['Pull an all-nighter to finish', 'Submit a placeholder version', 'Give up, wait for next conference'], correct: 1, comment: 'Correct! "Get on the bus first, buy the ticket later" is an academic tradition.' },
            { q: 'Discovered the conference is fake (predatory)?', options: ['Withdraw', 'Go anyway since you paid', 'Put it on CV, nobody checks'], correct: 0, comment: 'Correct! Predatory conferences will ruin your academic reputation.' },
            { q: 'Same paper rejected by three conferences in a row?', options: ['Major revision and resubmit', 'Change title and resubmit', 'Doubt if you are suited for research'], correct: 0, comment: 'Correct! "Try, try again" is the norm in research.' },
            { q: 'Paper accepted but registration is $2000, Advisor says no money?', options: ['Pay out of pocket', 'Abandon conference, just want the publication', 'Apply for Student Volunteer to waive fee'], correct: 2, comment: 'Correct! Trading labor for entry, a classic move.' },
            { q: 'Found a typo in the Camera Ready version?', options: ['Pray nobody notices', 'Contact publisher to fix', 'Upload a corrected arXiv version'], correct: 2, comment: 'Correct! arXiv is the medicine for regret.' },
            { q: 'Just submitted and found someone scooped you with almost identical work?', options: ['Withdraw', 'Add that paper to Related Work', 'Pretend not to see it'], correct: 1, comment: 'Correct! And claim your methods have "fundamental differences".' },
            { q: 'Submission system crashed 10 minutes before Deadline?', options: ['Refresh frantically', 'Email the committee', 'Complain on Twitter/X'], correct: 1, comment: 'Correct! Keep evidence, fight for an extension.' },
            { q: 'Your paper was assigned to a Reviewer in a totally unrelated field?', options: ['Request reassignment', 'Write a Rebuttal for laymen', 'Accept fate'], correct: 1, comment: 'Correct! Learn to explain your research to anyone.' },
            { q: 'Forgot to add Advisor\'s name in Acknowledgements during submission?', options: ['Add it immediately', 'Forget it, it\'s anonymous anyway', 'Pray Advisor won\'t read Camera Ready'], correct: 0, comment: 'Correct! The Advisor\'s name is more important than experimental results.' },
            { q: 'Paper rejected from top tier, moved to a Workshop, won Best Paper?', options: ['Happy', 'Feel the irony', 'Both emotions simultaneously'], correct: 2, comment: 'Correct! Academic life is magical like that.' },
            // ========== Daily Struggles ==========
            { q: 'Read 100 papers and found your idea was already done?', options: ['Give up on this direction', 'Find differences and continue', 'Pretend not to see those papers'], correct: 1, comment: 'Correct! Micro-innovation is still innovation.' },
            { q: 'Called by Advisor to "chat" on weekend, ended up staying till dawn?', options: ['Ask for overtime pay', 'Accept silently', 'Turn off phone next time'], correct: 1, comment: 'Correct! The concept of "weekend" does not exist in research.' },
            { q: 'External examiner asked a question you know nothing about during defense?', options: ['Honestly say I don\'t know', 'Improvise and bluff', 'Steer the question to a familiar topic'], correct: 2, comment: 'Correct! The art of defense is controlling the conversation.' },
            { q: 'Discovered your paper was plagiarized?', options: ['Happy, means I have influence', 'Report plagiarism', 'Contact them and ask for a citation'], correct: 1, comment: 'Correct! Upholding academic integrity is everyone\'s responsibility.' },
            { q: 'Classmates have 3 top-tier papers, you have 0?', options: ['Anxiety', 'Question life choices', 'Tell yourself "quality over quantity"'], correct: 2, comment: 'Correct! Self-comfort is a necessary survival skill.' },
            { q: 'No progress in experiments for a whole week?', options: ['Keep grinding', 'Change direction', 'Go for a walk to cool down'], correct: 2, comment: 'Correct! Sometimes inspiration is found outside the lab.' },
            { q: 'Figures drawn in PPT, Reviewer says "figures are ugly"?', options: ['Learn TikZ', 'Learn Matplotlib', 'Outsource to a friend who can draw'], correct: 1, comment: 'Correct! Python plotting is a required course for every grad student.' },
            { q: 'Received Advisor email at 2 AM: "Asleep? Check this out"?', options: ['Reply instantly', 'Pretend to sleep, reply tomorrow', 'Reply "Not sleeping, checking now"'], correct: 2, comment: 'Correct! The hustle is mutual.' },
            { q: 'Found your GitHub stars are higher than your citations?', options: ['Happy, code is useful', 'Sad, paper is ignored', 'Look for inspiration in Issues'], correct: 2, comment: 'Correct! User feedback is more useful than reviewer comments.' },
            { q: 'Writing paper at 3 AM, found Intro and Conclusion contradict each other?', options: ['Rewrite Intro', 'Rewrite Conclusion', 'Sleep, deal with it tomorrow'], correct: 2, comment: 'Correct! Fatigue writing is the main cause of research accidents.' },
            // ========== Academic Phenomena ==========
            { q: 'Attending a conference and realized talks are just reading slides?', options: ['Play on phone', 'Pretend to listen', 'Go to hallway to social'], correct: 2, comment: 'Correct! The value of conferences is networking, not reports.' },
            { q: 'Received email from unknown professor: "Read your paper, very interested"?', options: ['Reply happily', 'Check if it is phishing', 'Suspect he wants you to review a paper'], correct: 1, comment: 'Correct! Overly enthusiastic emails are usually suspicious.' },
            { q: 'Someone on Twitter says your paper is "padding/filler"?', options: ['Respond directly', 'Block', 'Check if it is Reviewer #2'], correct: 2, comment: 'Correct! The truth is often depressing.' },
            { q: 'Advisor asks you to write a survey but didn\'t say if you get first author?', options: ['Ask clearly first', 'Write it first then see', 'Bargain after writing'], correct: 0, comment: 'Correct! Negotiate early.' },
            { q: 'Don\'t know anyone at the Conference Banquet?', options: ['Find a corner to eat', 'Force yourself to social', 'Pretend to reply to emails'], correct: 1, comment: 'Correct! Stepping out of your comfort zone is the only way to grow.' },
            { q: 'Invited to review but totally don\'t understand the field?', options: ['Politely decline', 'Accept and study hard', 'Accept and give a conservative score'], correct: 0, comment: 'Correct! Responsible reviewing starts with saying no.' },
            { q: 'Collaborator hasn\'t replied to emails for three months?', options: ['Keep waiting', 'Phone bombing', 'Delete them from author list'], correct: 1, comment: 'Correct! Though they probably won\'t pick up the phone either.' },
            { q: 'Someone asks if you can help "polish" their paper\'s English?', options: ['Agree', 'Recommend Grammarly', 'Quote a price'], correct: 2, comment: 'Correct! Professional services should be paid.' },
            { q: 'Found an arXiv paper exactly the same as your ongoing work?', options: ['Speed up and publish fast', 'Change research direction', 'Contact authors for collaboration'], correct: 2, comment: 'Correct! Turning enemies into friends is the best strategy.' },
            { q: 'Someone commented on your paper saying they found a bug?', options: ['Thank and fix', 'Make excuses', 'Pretend not to see'], correct: 0, comment: 'Correct! Transparency is a basic academic standard.' },
            // ========== More Satire ==========
            { q: 'Reviewer asks "What is the main contribution?" but it\'s in the first line of Abstract?', options: ['Copy-paste Abstract to them', 'Explain in a different way', 'Doubt if they read the paper'], correct: 1, comment: 'Correct! Maybe if you say it differently they will get it (probably).' },
            { q: 'Paper title is "XXX is All You Need", Reviewer says it\'s clickbait?', options: ['Change to academic title', 'Insist, it\'s a tribute', 'Change to "XXX May Be What You Need"'], correct: 0, comment: 'Correct! The era of clickbait titles has passed.' },
            { q: 'Bold numbers in table are actually within 95% confidence interval?', options: ['Mark confidence interval', 'Just bold it', 'Do more experiments to ensure significance'], correct: 2, comment: 'Correct! Significance testing is the bottom line of science.' },
            { q: 'Required to open source code, but code looks like spaghetti?', options: ['Refactor then open source', 'Open source as-is with "For Reference Only"', 'Claim "Company Policy forbids it"'], correct: 0, comment: 'Correct! Code quality is part of academic reputation.' },
            { q: 'Attending Poster Session but no one comes to your poster?', options: ['Actively pull people in', 'Stand there playing phone', 'Go see other posters'], correct: 0, comment: 'Correct! Learn to sell your research.' },
            { q: 'Advisor says "I came up with this idea" but you remember proposing it in group meeting?', options: ['Correct him', 'Accept silently', 'Record meetings next time'], correct: 1, comment: 'Correct! Memory is unreliable, especially advisor\'s memory.' },
            { q: 'Writing Related Work and realized all papers in this field are from your lab?', options: ['Cite them all', 'Cite only relevant ones', 'Suspect you are in a niche field'], correct: 1, comment: 'Correct! Though it also proves the lab is strong.' },
        ],
        technical: [
            {
                q: 'Training Loss becomes NaN. Most likely cause?',
                options: ['Learning Rate (LR) too high', 'GPU loose connection', 'Dataset too small'],
                correct: 0,
                comment: 'Correct! Exploding gradients. Lower the LR.'
            },
            {
                q: 'Common method to prevent Overfitting?',
                options: ['Increase depth', 'Dropout / Regularization', 'Decrease Batch Size'],
                correct: 1,
                comment: 'Correct! Make the model \"forget\" some things.'
            },
            {
                q: 'Core component of Transformer architecture?',
                options: ['CNN', 'Attention', 'RNN'],
                correct: 1,
                comment: 'Correct! Attention is all you need.'
            },
            {
                q: 'Command for backpropagation in PyTorch?',
                options: ['loss.backward()', 'loss.go_back()', 'please.optimize()'],
                correct: 0,
                comment: 'Correct! Code you type 100 times a day.'
            },
            {
                q: "What does 'P' in GPT stand for?",
                options: ['Pre-trained', 'Professional', 'Python'],
                correct: 0,
                comment: 'Correct! Generative Pre-trained Transformer.'
            },
            {
                "q": "Main feature of Adam Optimizer?",
                "options": ["It is Eve's boyfriend", "Adaptive Learning Rate", "Never converges"],
                "correct": 1,
                "comment": "Correct! Works with default settings. The lazy choice."
              },
              {
                "q": "Increasing Temperature in LLM sampling causes?",
                "options": ["Model gets hot", "Output becomes random/diverse", "Output becomes deterministic"],
                "correct": 1,
                "comment": "Correct! Turn it up if you want the model to go crazy."
              },
              {
                "q": "Core innovation of ResNet?",
                "options": ["Skip Connection", "Dropout", "Attention"],
                "correct": 0,
                "comment": "Correct! Finally, we can train super deep networks."
              },
              {
                "q": "Formula for ReLU?",
                "options": ["y = x", "y = max(0, x)", "y = 1 / (1 + e^-x)"],
                "correct": 1,
                "comment": "Correct! Simple, brutal, effective."
              },
              {
                "q": "What does 'H' in RLHF stand for?",
                "options": ["Human", "Hardware", "Huge"],
                "correct": 0,
                "comment": "Correct! Reinforcement Learning from Human Feedback."
              },
              {
                "q": "Main purpose of Batch Normalization (BN)?",
                "options": ["Compress images", "Mitigate Covariate Shift", "Auto-code"],
                "correct": 1,
                "comment": "Correct! Stabilizes training and converges faster."
              },
              {
                "q": "Pooling layers in CNNs are usually for?",
                "options": ["Adding parameters", "Downsampling / Dim Reduction", "Brightness"],
                "correct": 1,
                "comment": "Correct! Though people prefer Stride Conv nowadays."
              },
              {
                "q": "Primary use case for LoRA?",
                "options": ["Pre-training from scratch", "Efficient Fine-Tuning (PEFT)", "Data Cleaning"],
                "correct": 1,
                "comment": "Correct! The savior of poor people fine-tuning LLMs."
              },
              {
                "q": "Output range of Sigmoid?",
                "options": ["(-1, 1)", "(0, 1)", "(-∞, +∞)"],
                "correct": 1,
                "comment": "Correct! Often used for binary classification probabilities."
              },
              {
                "q": "What is 'Few-shot' Learning?",
                "options": ["Show model a few examples", "Model runs for a few seconds", "Drink shots before coding"],
                "correct": 0,
                "comment": "Correct! A type of In-context Learning."
              },
              {
                "q": "Goal of Generator in GAN?",
                "options": ["Classify data", "Fool the Discriminator", "Generate training data"],
                "correct": 1,
                "comment": "Correct! A game of cat and mouse."
              },
              {
                "q": "Biggest pain point of RNNs?",
                "options": ["Can't handle images", "Vanishing Gradient / Long sequences", "Too few params"],
                "correct": 1,
                "comment": "Correct! That's why LSTM and Transformers replaced it."
              },
              {
                "q": "'Tokenization' in NLP refers to?",
                "options": ["Crypto coins", "Splitting text into units (Tokens)", "Login verify"],
                "correct": 1,
                "comment": "Correct! The first step for the model to 'read'."
              },
              {
                "q": "F1 Score is the harmonic mean of?",
                "options": ["Precision and Recall", "Accuracy and Loss", "Bias and Variance"],
                "correct": 0,
                "comment": "Correct! Use this when data is imbalanced."
              },
              {
                "q": "Who owns CUDA architecture?",
                "options": ["Intel", "AMD", "NVIDIA"],
                "correct": 2,
                "comment": "Correct! The reason you can't buy a GPU."
              },
              {
                "q": "One of BERT's training tasks?",
                "options": ["Next Token Prediction", "Masked LM", "Drawing"],
                "correct": 1,
                "comment": "Correct! Like a fill-in-the-blank test."
              },
              {
                "q": "Softmax is usually used for?",
                "options": ["Normalizing output to probability", "Convolution", "Weight Init"],
                "correct": 0,
                "comment": "Correct! Makes all outputs sum to 1."
              },
              {
                "q": "What is 'Hallucination'?",
                "options": ["GPU overheating", "Model confidently speaking nonsense", "Model generating scary pics"],
                "correct": 1,
                "comment": "Correct! AI lies too."
              },
              {
                "q": "Stable Diffusion belongs to which class?",
                "options": ["Autoregressive", "Diffusion Model", "SVM"],
                "correct": 1,
                "comment": "Correct! Generating images by denoising."
              },
              {
                "q": "Purpose of Clip_grad_norm?",
                "options": ["Trimming the GPU", "Prevent Gradient Explosion", "Reduce layers"],
                "correct": 1,
                "comment": "Correct! Stops the updates from going too wild."
              },
            { q: 'What is the difference in behavior of BatchNorm during training and inference?', options: ['Exactly the same', 'Train uses batch stats, Inference uses moving average', 'Inference does not use BatchNorm'], correct: 1, comment: 'Correct! This is why you must call model.eval().' },
            { q: 'What is the main disadvantage of ReLU activation function?', options: ['Computation too slow', 'Can cause "Dead Neurons"', 'Gradient too large'], correct: 1, comment: 'Correct! Dead ReLU Problem, gradient is 0 in negative region.' },
            { q: 'Adam optimizer combines which two optimization methods?', options: ['SGD and Momentum', 'Momentum and RMSprop', 'SGD and AdaGrad'], correct: 1, comment: 'Correct! Adam = Adaptive Moment Estimation.' },
            { q: 'What is the Vanishing Gradient problem?', options: ['Gradients become tiny preventing training', 'Gradients are deleted', 'Gradients become negative'], correct: 0, comment: 'Correct! Gradients decay exponentially during backpropagation in deep networks.' },
            { q: 'What is the function of Dropout?', options: ['Accelerate training', 'Prevent overfitting', 'Increase model parameters'], correct: 1, comment: 'Correct! Regularization by randomly dropping neurons.' },
            { q: 'What is the characteristic of Softmax function output?', options: ['Outputs are 0 or 1', 'Sum of outputs is 1', 'Outputs are all > 1'], correct: 1, comment: 'Correct! Softmax converts logits into a probability distribution.' },
            { q: 'Main difference between L1 and L2 regularization?', options: ['L1 produces sparse solutions', 'L2 produces sparse solutions', 'No difference'], correct: 0, comment: 'Correct! L1 tends to drive unimportant weights to 0.' },
            { q: 'What is the purpose of Xavier initialization?', options: ['Set weights to 0', 'Keep variance stable across layers', 'Accelerate convergence'], correct: 1, comment: 'Correct! Avoids signals vanishing or exploding during forward pass.' },
            { q: 'Why is Cross Entropy Loss better than MSE for classification?', options: ['Calculates faster', 'More stable gradients, faster convergence', 'More accurate results'], correct: 1, comment: 'Correct! CE Loss gradients don\'t vanish when close to the correct answer.' },
            { q: 'What is Learning Rate Warmup?', options: ['Let GPU warm up', 'Use small LR at start of training', 'Increase LR at end of training'], correct: 1, comment: 'Correct! Letting the model walk slowly while parameters are unstable.' },
            // ========== NLP / Transformer Related ==========
            { q: 'What is the complexity of Self-Attention in Transformer?', options: ['O(n)', 'O(n²)', 'O(n³)'], correct: 1, comment: 'Correct! This is the bottleneck for long sequence processing.' },
            { q: 'Which Attention mechanism does BERT use?', options: ['Causal (Unidirectional)', 'Bidirectional', 'Linear'], correct: 1, comment: 'Correct! BERT can see all information in the context.' },
            { q: 'What is the training objective of GPT series models?', options: ['Masked Language Modeling', 'Next Token Prediction', 'Sentence Classification'], correct: 1, comment: 'Correct! Autoregressively predicting the next token.' },
            { q: 'What does BPE mean in Tokenization?', options: ['Byte Pair Encoding', 'Basic Processing Element', 'Batch Processing Engine'], correct: 0, comment: 'Correct! A method merging character pairs based on frequency.' },
            { q: 'What is the role of Position Embedding?', options: ['Let model know word position info', 'Make model faster', 'Reduce parameters'], correct: 0, comment: 'Correct! Transformer itself has no position awareness.' },
            { q: 'Main difference between Layer Normalization and Batch Normalization?', options: ['LN normalizes over feature dimension', 'BN normalizes over feature dimension', 'No difference'], correct: 0, comment: 'Correct! LN normalizes individual samples, independent of batch stats.' },
            { q: 'What is the role of Multi-Head Attention?', options: ['Reduce computation', 'Let model focus on different representation subspaces', 'Replace FFN'], correct: 1, comment: 'Correct! Different heads can learn different types of relations.' },
            { q: 'What is Prompt Engineering?', options: ['Designing model architecture', 'Designing input prompts', 'Designing training data'], correct: 1, comment: 'Correct! Asking the LLM correctly to get better answers.' },
            { q: 'What is the core idea of LoRA?', options: ['Retrain entire model', 'Train only low-rank decomposition matrices', 'Freeze all parameters'], correct: 1, comment: 'Correct! Approximating full finetuning effects with few parameters.' },
            { q: 'What does H stand for in RLHF?', options: ['Hybrid', 'Human', 'High-quality'], correct: 1, comment: 'Correct! Reinforcement Learning from Human Feedback.' },
            // ========== CV Related ==========
            { q: 'Main function of Pooling layer in CNN?', options: ['Increase parameters', 'Downsample to reduce computation', 'Increase nonlinearity'], correct: 1, comment: 'Correct! Also provides some translation invariance.' },
            { q: 'What problem did ResNet solve?', options: ['Overfitting', 'Vanishing/Exploding gradients', 'Computation too slow'], correct: 1, comment: 'Correct! Residual connections allow gradients to flow directly.' },
            { q: 'What is the role of 1x1 Convolution?', options: ['Nothing', 'Change channel count', 'Increase receptive field'], correct: 1, comment: 'Correct! Used for dimensionality reduction or expansion.' },
            { q: 'What is the purpose of Data Augmentation?', options: ['Increase training data diversity', 'Reduce training time', 'Increase model parameters'], correct: 0, comment: 'Correct! Preventing overfitting by increasing variety via transformations.' },
            { q: 'In Transfer Learning, what is common during Fine-tuning?', options: ['Random init all parameters', 'Freeze all parameters', 'Freeze shallow layers, tune deep layers'], correct: 2, comment: 'Correct! Shallow features are general, deep features are task-specific.' },
            { q: 'How does Vision Transformer (ViT) process image input?', options: ['Input pixels directly', 'Cut into patches then linear project', 'Use CNN to extract features'], correct: 1, comment: 'Correct! An image is worth 16x16 words.' },
            { q: 'What is the role of FPN (Feature Pyramid Network)?', options: ['Fuse multi-scale features', 'Reduce parameters', 'Accelerate training'], correct: 0, comment: 'Correct! Used for detecting objects of different sizes.' },
            { q: 'What does the name YOLO stand for?', options: ['You Only Look Once', 'Your Observation Learning Object', 'Yearly Optimization for Learning Objects'], correct: 0, comment: 'Correct! Detection completed in one forward pass.' },
            { q: 'What does IoU (Intersection over Union) measure?', options: ['Classification accuracy', 'Overlap of detection boxes', 'Training speed'], correct: 1, comment: 'Correct! Core evaluation metric in Object Detection.' },
            { q: 'What is the sampling process of Diffusion Models?', options: ['Denoising from noise', 'Adding noise to image', 'Random generation'], correct: 0, comment: 'Correct! Learning the reverse diffusion process.' },
            // ========== Training Tricks ==========
            { q: 'Model performs well on training set but poor on validation set?', options: ['Underfitting', 'Overfitting', 'Learning rate too high'], correct: 1, comment: 'Correct! Model is "memorizing answers" instead of learning patterns.' },
            { q: 'What is the role of Gradient Clipping?', options: ['Accelerate training', 'Prevent gradient explosion', 'Increase gradients'], correct: 1, comment: 'Correct! Limiting the maximum value of gradients.' },
            { q: 'Benefit of Mixed Precision Training (FP16)?', options: ['Improve accuracy', 'Reduce VRAM usage and accelerate', 'Increase stability'], correct: 1, comment: 'Correct! But watch out for numerical stability issues.' },
            { q: 'What is Cosine Annealing LR Schedule?', options: ['Linear decay', 'LR changes following cosine curve', 'Constant LR'], correct: 1, comment: 'Correct! Smoothly lowering LR, potentially with periodic restarts.' },
            { q: 'What is the basis for Early Stopping?', options: ['Training loss', 'Validation loss', 'Test accuracy'], correct: 1, comment: 'Correct! Stop when validation performance no longer improves.' },
            { q: 'What problem can Gradient Accumulation solve?', options: ['Insufficient VRAM', 'Training too slow', 'Overfitting'], correct: 0, comment: 'Correct! Simulating a larger batch size.' },
            { q: 'What is the role of Label Smoothing?', options: ['Make labels smoother', 'Regularization to prevent overfitting', 'Accelerate convergence'], correct: 1, comment: 'Correct! Preventing the model from being overconfident.' },
            { q: 'Why does Ensemble Learning usually improve performance?', options: ['Increase parameters', 'Reduce variance and bias', 'Accelerate training'], correct: 1, comment: 'Correct! Errors from multiple models may cancel each other out.' },
            { q: 'Relationship between Teacher and Student in Knowledge Distillation?', options: ['Student larger than Teacher', 'Teacher larger than Student', 'Same size'], correct: 1, comment: 'Correct! Teaching a small model with a big model.' },
            { q: 'What is Test Time Augmentation (TTA)?', options: ['Augment input at test time and aggregate results', 'Increase model parameters at test time', 'Retrain at test time'], correct: 0, comment: 'Correct! Voting with predictions from multiple augmented versions.' },
        ]
    },
    paperGenerator: {
        vocabulary: {
            adjectives: [
                "Robust", "Optimal", "Federated", "Self-Supervised", "Zero-Shot",
                "Lazy", "Hallucinated", "Adversarial", "Quantum", "Deep",
                "Explainable", "Unsupervised", "End-to-End", "Large-Scale", "Efficient",
                "Generative", "Probabilistic", "Differentiable", "Neuromorphic", "Semantic",
                "Context-Aware", "Bi-directional", "Recursive", "Infinite", "Synthetic",
                "Automatic", "Dynamic", "Static", "Distributed", "Hyper-Realistic"
            ],
            nouns: [
                "Attention", "Transformer", "Diffusion", "Gradient", "Entropy",
                "Reasoning", "Knowledge Graph", "Hyperparameter", "Backdoor",
                "Bias", "Token", "Latent Space", "Ablation", "Benchmark",
                "Architecture", "Paradigm", "Modality", "Embeddings", "Loss Function",
                "Regularization", "Distillation", "Inference", "Datasets", "Benchmarks",
                "Agents", "Hallucinations", "Prompt", "Weights", "Layers", "Tensors"
            ],
            methods: [
                "Reinforcement Learning", "Chain-of-Thought", "Contrastive Learning",
                "Gradient Descent", "Random Guessing", "Brute Force", "Prompt Engineering",
                "Knowledge Distillation", "Fine-Tuning", "Monte Carlo Tree Search",
                "Bayesian Optimization", "Neural Search", "Genetic Algorithms", "Grid Search",
                "Active Learning", "Transfer Learning", "Few-Shot Prompting", "Human Feedback (RLHF)",
                "Magic", "Manual Labor", "Asking ChatGPT", "Stack Overflow Copy-Paste"
            ],
            verbs: [
                "Optimizing", "Revisiting", "Breaking", "Aligning", "Deconstructing",
                "Understanding", "Simulating", "Generalizing", "Faking", "Scaling",
                "Unifying", "Demystifying", "Augmenting", "Compressing", "Accelerating",
                "Evaluating", "Memorizing", "Forgetting", "Debugging", "Tuning"
            ]
        },
        templates: [
            "{Adjective} {UserTopic} is All You Need",
            "Attention is All You Need for {UserTopic}",
            "Towards {Adjective} {UserTopic} via {Method}",
            "{UserTopic}: A {Adjective} Approach",
            "Deep {UserTopic} for {Adjective} {Noun}",
            "Rethinking {UserTopic} in the Era of {Noun}",
            "Why {UserTopic} Fails at {Noun}",
            "Do We Really Need {UserTopic}?",
            "Can {Method} Solve {UserTopic}?",
            "Is {UserTopic} Actually {Adjective}?",
            "How to Break {UserTopic} using {Method}",
            "What Does {UserTopic} Learn?",
            "{Method} for {Adjective} {UserTopic}",
            "Optimizing {UserTopic} with {Adjective} {Noun}",
            "Learning to {Verb} {UserTopic}",
            "A Framework for {Adjective} {UserTopic}",
            "Unifying {UserTopic} and {Noun}",
            "Scaling {UserTopic} to {Adjective} Levels",
            "Training {UserTopic} without {Noun}",
            "Zero-Shot {UserTopic} via {Method}",
            "A {Adjective} Survey on {UserTopic}",
            "A Comprehensive Review of {UserTopic}",
            "{UserTopic}: The {Adjective} Road Ahead",
            "The State of {UserTopic} in 2025",
            "Ten Years of {UserTopic}: A Retrospective",
            "{Adjective} {Noun} Meets {UserTopic}",
            "From {Noun} to {UserTopic}: A {Adjective} Journey",
            "Generalized {UserTopic} with {Adjective} {Noun}",
            "Hierarchical {UserTopic} using {Method}",
            "Disentangling {Noun} from {UserTopic}",
            "End-to-End {UserTopic} Generation",
            "Lazy {UserTopic}: Doing Less for More {Noun}",
            "Hallucinated {UserTopic} is Better Than Real {UserTopic}",
            "Infinite {UserTopic} via {Method}",
            "Stop Using {Noun} for {UserTopic}",
            "{UserTopic} Considered Harmful",
            "I Can't Believe It's Not {UserTopic}",
            "One {Noun} to Rule Them All: {UserTopic}",
            "Solving {UserTopic} by {Verb} Randomly",
            "My Advisor Forced Me To Study {UserTopic}",
            "We Tried {Method} on {UserTopic} and It Failed",
            "A {Adjective}, {Adjective} Approach to {UserTopic}",
            "Multi-Modal {UserTopic} with {Adjective} {Noun} Constraints",
            "Cross-Domain {UserTopic} Adaptation via {Method}",
            "Self-Supervised {UserTopic} Pre-training",
            "Robustifying {UserTopic} against {Adjective} Attacks",
            "Prompting {UserTopic} to {Verb} {Noun}",
            "Beyond {Noun}: The Future of {UserTopic}"
        ]
    }
};



