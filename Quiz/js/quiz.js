import { questions } from "./questions.js";

/**
 * Classe que controla o estado do Quiz
 */
export class Quiz {
  /**
   * Cria um novo quiz
   * @param {boolean} [isChallenge=false] - Define se o modo é desafio (com tempo) ou normal
   */
  constructor(isChallenge = false) {
    this.isChallenge = isChallenge;
    this.currentIndex = 0;
    this.score = 0;
    this.bestScore = localStorage.getItem("bestScore") || 0;
    this.timeLeft = 60; // 1 minuto
    this.timerId = null;
  }

  /**
   * Retorna a pergunta atual
   * @returns {{question: string, answers: string[], correct: string}} Objeto da pergunta
   */
  loadQuestion() {
    return questions[this.currentIndex];
  }

  /**
   * Verifica se a resposta está correta
   * @param {string} answer - Resposta escolhida pelo usuário
   * @returns {boolean} true se a resposta for correta, false caso contrário
   */
  checkAnswer(answer) {
    const correct = questions[this.currentIndex].correct;
    if (answer === correct) {
      this.score++;
      return true;
    }
    return false;
  }

  /**
   * Avança para a próxima pergunta
   * @returns {boolean} true se ainda houver perguntas, false se acabou
   */
  nextQuestion() {
    this.currentIndex++;
    return this.currentIndex < questions.length;
  }

  /**
   * Finaliza o quiz e salva a melhor pontuação no localStorage
   */
  finish() {
    if (this.score > this.bestScore) {
      localStorage.setItem("bestScore", this.score);
      this.bestScore = this.score;
    }
  }

  /**
   * Inicia o cronômetro do modo desafio
   * @param {function(number):void} callback - Função chamada a cada segundo com o tempo restante
   */
  startTimer(callback) {
    this.timeLeft = 60;

    // mostra tempo na largada
    callback(this.timeLeft);

    // aplica cor inicial
    const timerElement = document.getElementById("timer");
    if (this.timeLeft > 40) {
      timerElement.className = "safe";
    } else if (this.timeLeft > 20) {
      timerElement.className = "warning";
    } else {
      timerElement.className = "danger";
    }

    this.timerId = setInterval(() => {
      this.timeLeft--;
      callback(this.timeLeft);

      // atualiza cor
      if (this.timeLeft > 40) {
        timerElement.className = "safe";
      } else if (this.timeLeft > 20) {
        timerElement.className = "warning";
      } else {
        timerElement.className = "danger";
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        const event = new Event("timeUp");
        document.dispatchEvent(event);
      }
    }, 1000);
  }

  /**
   * Para o cronômetro
   */
  stopTimer() {
    if (this.timerId) clearInterval(this.timerId);
  }
}
