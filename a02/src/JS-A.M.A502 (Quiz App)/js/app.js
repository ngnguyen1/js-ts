class App {
  constructor(questions) {
    // 1) pick proper Question subclass based on the `multi` flag
    this.questions = questions.map((q, index) => {
      if (q.multi) {
        return new MultiChoiceQuestion(q, index);
      } else {
        return new SingleChoiceQuestion(q, index);
      }
    });

    this.quizContainer    = document.getElementById('quiz');
    this.resultsContainer = document.getElementById('results');
    this.submitButton     = document.getElementById('submit');
    this.previousButton   = document.getElementById('previous');
    this.nextButton       = document.getElementById('next');

    // 2) bind methods so `this` inside them refers to the App instance
    this.showResults       = this.showResults.bind(this);
    this.showNextSlide     = this.showNextSlide.bind(this);
    this.showPreviousSlide = this.showPreviousSlide.bind(this);

    this.submitButton.addEventListener('click', this.showResults);
    this.previousButton.addEventListener('click', this.showPreviousSlide);
    this.nextButton.addEventListener('click', this.showNextSlide);

    this.currentSlide = 0;
  }

  buildQuiz() {
    const output = this.questions.map((currentQuestion) =>
      currentQuestion.render()
    );
    this.quizContainer.innerHTML = output.join('');
  }

  showResults() {
    const answerContainers = this.quizContainer.querySelectorAll('.answers');
    let numCorrect = 0;

    this.questions.forEach((currentQuestion, questionNumber) => {
      const answerContainer = answerContainers[questionNumber];

      if (currentQuestion instanceof MultiChoiceQuestion) {
        // collect all checked boxes
        const checkedBoxes = answerContainer.querySelectorAll(
          `input[name=question-${questionNumber}]:checked`
        );
        const userAnswer = Array.from(checkedBoxes)
          .map((cb) => cb.value)
          .sort()
          .join('');
        if (userAnswer === currentQuestion.correctAnswer) {
          numCorrect++;
        }
      } else {
        // single choice
        const selector = `input[name=question-${questionNumber}]:checked`;
        const userAnswer = (answerContainer.querySelector(selector) || {}).value;
        if (userAnswer === currentQuestion.correctAnswer) {
          numCorrect++;
        }
      }
    });

    this.resultsContainer.innerHTML = `${numCorrect} out of ${
      this.questions.length
    }`;
  }

  showSlide(n) {
    if (!this.slides) {
      this.slides = document.querySelectorAll('.slide');
    }
    this.slides[this.currentSlide].classList.remove('active-slide');
    this.slides[n].classList.add('active-slide');
    this.currentSlide = n;

    this.previousButton.style.display =
      this.currentSlide === 0 ? 'none' : 'inline-block';

    if (this.currentSlide === this.slides.length - 1) {
      this.nextButton.style.display = 'none';
      this.submitButton.style.display = 'inline-block';
    } else {
      this.nextButton.style.display = 'inline-block';
      this.submitButton.style.display = 'none';
    }
  }

  showNextSlide() {
    this.showSlide(this.currentSlide + 1);
  }

  showPreviousSlide() {
    this.showSlide(this.currentSlide - 1);
  }

  start() {
    this.buildQuiz();
    this.showSlide(0);
  }
}
