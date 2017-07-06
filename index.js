var QA_ANSWER_RADIO_BUTTON = '.js-quiz-app-answer-option input[type=radio]';
var QA_ANSWER_OPTION = '.js-quiz-app-answer-option';
var QA_TOPIC_HEADER = '.js-quiz-app-header h3';
var QA_PREV_BUTTON = '.js-quiz-app-previous-button-container button';
var QA_NEXT_BUTTON = '.js-quiz-app-next-button-container button';
var QA_START_BUTTON = '.js-quiz-app-start-button-container button';
var QA_RESET_BUTTON = '.js-quiz-app-retake-button-container';
var QA_CONTINUR_BUTTON = '.js-quiz-app-result-button-container button';
var QA_START_SCREEN = '.js-quiz-app-start-screen';
var QA_HEADER_USER_PROGRESS = '.js-quiz-app-header-user-progress';
var QA_QUESTION_ANSWER_CONTAINER = '.js-quiz-app-question-answer-container';
var QA_FOOTER = '.js-quiz-app-footer';
var QA_QUESTION = '.js-quiz-app-question';
var QA_QUESTION_NUMBER = '.js-quiz-app-question-number';
var QA_QUIZ_SUMMARY = '.js-quiz-app-summary-container';
var QA_QUIZ_SUMMARY_LIST = '.js-quiz-app-summary-list';
var QA_RESULT_SCREEN = '.js-quiz-app-result-screen';
var QA_RESULT_TEXT = '.js-quiz-app-result-screen-text';
var QA_WRONG_COUNT = '.js-quiz-app-wrong-count';
var QA_CORRECT_COUNT = '.js-quiz-app-correct-count';
var QA_PROGRESS_COUNT = '.js-quiz-app-progress-count';
var QA_PROGRESS_BAR = '.js-quiz-app-progress-bar';
var QA_SUBTOPIC_ICON = '.js-quiz-app-subtopic-icon';
var QA_ANSWER_CHOICES_TEXT = ' + span';
var QA_ANSWER_CHOICES = [ 
                          '#answer-option-1',
                          '#answer-option-2',
                          '#answer-option-3',
                          '#answer-option-4'
                        ];

var quizAppCurrentAnswerSelection;
var quizAppQuestionIndex;
var quizAppQuestionStartTime;
var quizAppTesterProgress;

$(onReady);

function onReady()
{
  bindUserInputEvents();
}

function bindUserInputEvents()
{
  console.log('Biding user input events.');
  $(QA_START_BUTTON).click(onStartButtonClicked);
  $(QA_ANSWER_RADIO_BUTTON).click(onAnswerSelectionChanged);
  $(QA_NEXT_BUTTON).click(onNextButtonClicked);
  $(QA_CONTINUR_BUTTON).click(onContinueButtonClicked);
  $(QA_RESET_BUTTON).click(onResetButtonClicked);
  console.log('User input events binding complete.');
}

function onResetButtonClicked(event)
{
  location.reload();
}

function loadQuiz(quiz)
{
  $(QA_TOPIC_HEADER).text(quiz.topic);
  resetQuiz();
  loadQuestion();
  beginQuiz();
}

function onStartButtonClicked(event)
{
  loadQuiz(QA_QUIZ);
}

function resetQuiz()
{
  console.log( 'Reseting quiz.');
  quizAppTesterProgress = { 
                            countCorrect : parseInt(0),
                            countWrong : parseInt(0),
                            startTime : Date.now(),
                            endTime : undefined,
                            countQuestionsAnswered : function(){return this.countWrong + this.countCorrect;},
                            questionAnswerLog : []
                          };
  $(QA_START_SCREEN).css('display', 'block');
  $(QA_HEADER_USER_PROGRESS).css('display', 'none');
  $(QA_QUESTION_ANSWER_CONTAINER).css('display', 'none');
  $(QA_FOOTER).css('display', 'none');
  $(QA_WRONG_COUNT).text('Incorrect: 0');
  $(QA_CORRECT_COUNT).text('Correct: 0');
  $(QA_PROGRESS_COUNT).text('1 / ' + QA_QUIZ.questionCount);
  updateLiveStats();
  console.log('Quiz reset complete.');
}

function loadQuestion()
{
  console.log('Loading question.');
  $(QA_QUESTION_ANSWER_CONTAINER).fadeOut('fast', function()
  {
    resetUserSelection();
    quizAppQuestionIndex = getRandomQuestionIndex();
    var question = QA_QUIZ.questions[quizAppQuestionIndex];
    $(QA_QUESTION).text(question.query);
    QA_ANSWER_CHOICES.map(
      function(item)
      {
        $(item + QA_ANSWER_CHOICES_TEXT).text(question.choices[QA_ANSWER_CHOICES.indexOf(item)]);
        $(item).prop( 'value', question.choices[QA_ANSWER_CHOICES.indexOf(item)]);
      });
    $(QA_SUBTOPIC_ICON).prop('class', 'js-quiz-app-subtopic-icon colored');
    $(QA_SUBTOPIC_ICON).addClass(QA_QUIZ.subTopicIcons[question.subtopicIndex]);
    $(QA_QUESTION_ANSWER_CONTAINER).fadeIn();
    quizAppQuestionStartTime = Date.now();
    console.log('Question loaded. Index ' + quizAppQuestionIndex);
  });
}

function beginQuiz()
{
  $(QA_START_SCREEN).hide();
  showQuizElements();
  console.log('Quiz started.');
}

function getRandomQuestionIndex()
{
  var randex;
  
  if (quizAppTesterProgress.questionAnswerLog === null )
  {
    randex = getRandomInt(0, QA_QUIZ.questionCount -1);
  }
  else
  {
    do
    {
      randex = getRandomInt(0, QA_QUIZ.questionCount -1);
      
    } while ( quizAppTesterProgress.questionAnswerLog.find(function(item){return item.questionIndex == randex; }));
  }
  
  return randex;
}

function resetUserSelection()
{
  quizAppCurrentAnswerSelection = undefined;
  $(QA_ANSWER_RADIO_BUTTON).prop('checked', 'false');
  $(QA_ANSWER_OPTION).css('border-color', 'transparent');
}

function showQuizElements()
{
  $(QA_RESULT_SCREEN).hide();
  $(QA_QUIZ_SUMMARY).hide();
  $(QA_HEADER_USER_PROGRESS).fadeIn('fast');
  $(QA_QUESTION_ANSWER_CONTAINER).fadeIn('fast');
  $(QA_FOOTER).fadeIn('fast');
}

function updateTesterProgress()
{
  if ( !quizAppTesterProgress.questionAnswerLog.find(function(item){ return item.questionIndex === quizAppQuestionIndex; }) )
  {
    var quiz = QA_QUIZ;
    var solutionIndex = quiz.questions[quizAppQuestionIndex].solutionIndex;
    var question = quiz.questions[quizAppQuestionIndex];
    var questionSolution = question.choices[solutionIndex];
    var log = {
                questionIndex : quizAppQuestionIndex,
                answer : quizAppCurrentAnswerSelection,
                correct : quizAppCurrentAnswerSelection === questionSolution,
                timeTaken : Date.now() - quizAppQuestionStartTime
              };
              
    if (quizAppTesterProgress.questionAnswerLog === undefined )
      quizAppTesterProgress.questionAnswerLog = [ log ];
      
    else 
      quizAppTesterProgress.questionAnswerLog.push(log);
      
    if ( log.correct )
      quizAppTesterProgress.countCorrect++;
    else
      quizAppTesterProgress.countWrong++;
      
    console.log('User progress updated.');
  }
}

function updateLiveStats()
{
  var countTotalQuestions = QA_QUIZ.questionCount;
  var progressPercentage = ((Math.min( (quizAppTesterProgress.countQuestionsAnswered()), countTotalQuestions) / countTotalQuestions) * 100).toFixed(2);
  var progressBarCSS = 'linear-gradient(to right, #00C853 ' + progressPercentage + '%, white ' + progressPercentage + '% )'
  $(QA_PROGRESS_COUNT).text( Math.min( (quizAppTesterProgress.countQuestionsAnswered() + 1) , countTotalQuestions ) + ' / ' +  countTotalQuestions );
  $(QA_QUESTION_NUMBER).text('Question ' + Math.min( (quizAppTesterProgress.countQuestionsAnswered() + 1), countTotalQuestions));
  $(QA_WRONG_COUNT).text('Incorrect: ' + quizAppTesterProgress.countWrong);
  $(QA_CORRECT_COUNT).text('Correct: ' + quizAppTesterProgress.countCorrect);
  $(QA_PROGRESS_BAR).css('background', progressBarCSS );
  console.log('Live stats updated.');
}

function onAnswerSelectionChanged()
{
  if ($(this).prop("checked"))
  {
    $(QA_ANSWER_OPTION).css('border-color', 'transparent');
    $(this).closest(QA_ANSWER_OPTION).css('border-color', '#00C853');
    quizAppCurrentAnswerSelection = $(this).val();
    console.log('Answer selection changed to: ' + $(this).prop('id'));
  }
}

function onNextButtonClicked(event)
{
  console.log('Next button clicked.');
  if ( quizAppTesterProgress !== undefined )
  {
    if (validateUserSelection())
    {
      console.log('Answer submitted.');
      updateTesterProgress();
      updateLiveStats();
      showAnswerResult();
    }
    else
    {
      console.log('No answer selection.');
      alert('You must select an answer first!');
      return;
    }
  }
}

function onContinueButtonClicked()
{
  if ( !isQuizComplete() )
  {
    loadQuestion();
    showQuizElements();
  }
  else
  {
    quizAppTesterProgress.endTime = Date.now();
    showQuizSummary();
    console.log('Quiz complete.');
  }
}

function showQuizSummary()
{
  $(QA_RESULT_SCREEN).hide();
  $(QA_FOOTER).hide();
  $(QA_HEADER_USER_PROGRESS).fadeIn('fast');
  loadSummaryDetails();
  $(QA_QUIZ_SUMMARY).fadeIn('fast');
}

function loadSummaryDetails()
{
  var score = ((quizAppTesterProgress.countCorrect / QA_QUIZ.questionCount ) * 100).toFixed(2);
  var totalTime = msToTime(quizAppTesterProgress.endTime - quizAppTesterProgress.startTime);
  $(QA_QUIZ_SUMMARY_LIST).append('<h2 style="font-weight:400">' + score  + '%</h2>');
  $(QA_QUIZ_SUMMARY_LIST).append('<h4 style="font-weight:400">Total Time: ' + totalTime  + '</h4>');
  quizAppTesterProgress.questionAnswerLog.map( 
    function(result)
    {
      $(QA_QUIZ_SUMMARY_LIST).append( '<details class="quiz-app-summary-detail"><summary>' + 
                                      ( result.correct ? '<i class="fa fa-check" aria-hidden="true"></i>' : 
                                                         '<i class="fa fa-times" aria-hidden="true"></i>' ) +
                                      QA_QUIZ.questions[result.questionIndex].query + 
                                      '</summary><ul>' +
                                      '<li><em>Time</em>: ' + msToTime(result.timeTaken)  + '</li>' +
                                      '<li><em>Answer</em>: ' + result.answer  + '</li>' +
                                      '<li><em>Solution</em>: ' + QA_QUIZ.questions[result.questionIndex]
                                                                         .choices[QA_QUIZ.questions[result.questionIndex].solutionIndex]  + 
                                      '</li><ul></detail>');
    });
}

function showAnswerResult()
{
  $(QA_HEADER_USER_PROGRESS).hide();
  $(QA_QUESTION_ANSWER_CONTAINER).hide();
  $(QA_FOOTER).hide();
  $(QA_RESULT_SCREEN + ' .fa').hide();
  $(QA_RESULT_SCREEN).fadeIn('fast');
  
  if ( quizAppTesterProgress.questionAnswerLog[quizAppTesterProgress.countQuestionsAnswered() -1].correct )
  {
    $(QA_RESULT_SCREEN + ' .js-quiz-app-result-right-answer').text('');
    $(QA_RESULT_SCREEN + ' .fa-check').show();
    $(QA_RESULT_TEXT).text('Great job! That was correct!');
  }
  
  else
  {
    var resultQuestionIndex = quizAppTesterProgress.questionAnswerLog[quizAppTesterProgress.countQuestionsAnswered() -1].questionIndex;
    var resultQuestion = QA_QUIZ.questions[resultQuestionIndex];
    var correctAnswer = resultQuestion.choices[resultQuestion.solutionIndex];
    $(QA_RESULT_SCREEN + ' .fa-times').show();
    $(QA_RESULT_TEXT).text('Sorry, that was not the correct answer!');
    $(QA_RESULT_SCREEN + ' .js-quiz-app-result-right-answer').html('<p>Correct Answer</p><sub>' + correctAnswer + '</sub>' );
  }
}

function validateUserSelection()
{
  if (quizAppCurrentAnswerSelection === undefined)
    return false;
    
  else
    return true;
}

function isQuizComplete()
{
  return !(quizAppTesterProgress === undefined || 
           quizAppTesterProgress.questionAnswerLog.length < QA_QUIZ.questionCount);
}

// Sourced from MDN
function getRandomInt(min, max) 
{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sourced from Stack Overflow
function msToTime(duration) 
{
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24);
  
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  
  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

/*****************************************************
 * Quiz Object
******************************************************/
var QA_QUIZ =
{
  topic : 'Web Development Quiz',
  questionCount : 7,
  subTopics : [ 'css3', 'javascript', 'html5'  ],
  subTopicIcons : [
                    'devicon-css3-plain-wordmark',
                    'devicon-javascript-plain',
                    'devicon-html5-plain-wordmark'
                  ],
  
  questions : 
  [ 
    { 
      subtopicIndex : 2,
      query : 'What language is used to create the structure of a web page?',
      solutionIndex : 1,
      choices : [ 
                  'Human Torch Machine Language',
                  'Hypertext Markup Language',
                  'Document Structure Markup Language', 
                  'Dynamic Host Configuration Protocol' 
                ]
    },
    
    {
      subtopicIndex : 0,
      query : 'What is the language used to define the presentation layer of a web page?',
      solutionIndex : 3,
      choices : [ 
                  'Cool Cascading Styles', 
                  'Color Class Sheet', 
                  'Presentation Style Language',
                  'Cascading Style Sheet'
                ]
    },
    
    {
      subtopicIndex : 0,
      query : 'What does the clear property do when defined in a ruleset?',
      solutionIndex : 0, 
      choices : [ 
                  'The clear property will make the targeted elements aware of any right or left floated elements.',
                  'The left half of the elements targeted by the selector will be clear.', 
                  'The elements targeted by the selector will stay clear of the left side of the document.', 
                  'The text `clear` will be displayed on the left side of the elements targeted by the ruleset.' 
                ]
    },
    
    {
      subtopicIndex : 1,
      query : '	What is the name of the programming language browsers use to interact with the document object model?',
      solutionIndex : 2,
      choices : [
                  'SQL',
                  'CSS',
                  'JavaScript',
                  'C#'
                ]
    },
    
    {
      subtopicIndex : 0,
      query : 'It\'s a good practice to use a CSS reset and normalization file. What is the name of a common CSS normalizer?',
      solutionIndex : 3,
      choices : [
                  'clear.css',
                  'clean.css',
                  'norm.css',
                  'normalize.css'
                ]
    },
    
    {
      subtopicIndex : 1,
      query : 'What is hoisting in JavaScript?',
      solutionIndex : 1,
      choices : [
                  'To raise (something) by means of ropes and pulleys.',
                  'Is the way the JS interpreter finds every variable declaration within a given scope, and moves it to the top of that scope.',
                  'Is a method used to pull items out of an array.',
                  'Is what you call the concept of looping through an array.'
                ]
    },
    
    {
      subtopicIndex : 2,
      query : 'What is an example of using html semantically?',
      solutionIndex : 1,
      choices : [
                  'Using a `p` element for smaller text.',
                  'Using a `p` element for a paragraph.',
                  'Using an `h1` element for making text bigger.',
                  'Using a `span` element inside of a paragraph element.'
                ]
    },
    
    {
      subtopicIndex : 2,
      query : 'What is the correct syntax for linking a CSS file to you HTML file?',
      solutionIndex : 3,
      choices : [
                  '<file href="index.css" rel="child" type="text/css" >',
		              '<css type="text/css" rel="stylesheet" href="index.css" >',
		              '<link type="text/css" rel="stylesheet" src="index.css" >',
                  '<link href="index.css" rel="stylesheet" type="text/css" >'
                ]
    }
  ]
};