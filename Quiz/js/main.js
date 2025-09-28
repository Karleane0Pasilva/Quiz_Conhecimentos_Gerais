import { Quiz } from "./quiz.js";
import { questions } from "./questions.js";

/** 
 * Telas principais do quiz 
 */
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");

/** 
 * Botões de controle do quiz 
 */
const normalBtn = document.getElementById("normal-mode");
const challengeBtn = document.getElementById("challenge-mode");
const restartBtn = document.getElementById("restart");

/** 
 * Área de perguntas, respostas e progresso 
 */
const questionText = document.getElementById("question-text");
const answersDiv = document.getElementById("answers");
const progressSpan = document.getElementById("progress");
const timerSpan = document.getElementById("timer");

/** 
 * Exibição de scores e informações finais 
 */
const bestScoreSpan = document.getElementById("best-score");
const currentScoreSpan = document.getElementById("current-score");
const timeInfo = document.getElementById("time-info");

let quiz;

/**
 * Mostra a tela escolhida e esconde as demais
 * @param {HTMLElement} screen - Elemento da tela a ser exibida
 */
function showScreen(screen) {
  [startScreen, quizScreen, endScreen, 
   document.getElementById("fail-screen"), 
   document.getElementById("success-screen")
  ].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

/**
 * Inicia o quiz em modo normal ou desafio
 * @param {boolean} isChallenge - True se for modo desafio, false se normal
 */
function startQuiz(isChallenge) {
  quiz = new Quiz(isChallenge);
  showScreen(quizScreen);
  renderQuestion();

  if (isChallenge) {
    timerSpan.classList.remove("hidden");
    quiz.startTimer(updateTimer);
  } else {
    timerSpan.classList.add("hidden");
    timerSpan.textContent = "";    
    timerSpan.classList.remove("safe", "warning", "danger");
  }
}

/**
 * Atualiza o tempo mostrado na tela
 * @param {number} time - Tempo restante em segundos
 * @param {boolean} [ended=false] - Indica se o tempo terminou
 */
function updateTimer(time, ended = false) {
  timerSpan.textContent = `00:${String(time).padStart(2, "0")}`;
  if (ended) endQuiz();
}

/**
 * Renderiza a pergunta e alternativas na tela
 */
function renderQuestion() {
  const q = quiz.loadQuestion();
  questionText.textContent = q.question;
  progressSpan.textContent = `${quiz.currentIndex + 1} de ${20}`;
  const progressPercent = ((quiz.currentIndex + 1) / 20) * 100;
  document.getElementById("progress-bar").style.width = progressPercent + "%";

  answersDiv.innerHTML = "";

  // Paleta de cores
  const colorClasses = ["btn-green", "btn-yellow", "btn-blue", "btn-pink"];
  // Embaralhar as cores
  const shuffledColors = colorClasses.sort(() => Math.random() - 0.5);

  q.answers.forEach((ans, index) => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.classList.add(shuffledColors[index]); // aplica cor
    btn.onclick = () => handleAnswer(ans, btn);
    answersDiv.appendChild(btn);
  });
}

/**
 * Trata a resposta clicada pelo usuário
 * @param {string} answer - Texto da resposta escolhida
 * @param {HTMLButtonElement} button - Botão clicado
 */
function handleAnswer(answer, button) {
  const correct = quiz.checkAnswer(answer);
  button.classList.add(correct ? "correct" : "incorrect");

  setTimeout(() => {
    if (quiz.nextQuestion()) {
      renderQuestion();
    } else {
      endQuiz();
    }
  }, 100);
}

/**
 * Finaliza o quiz e mostra a tela de resultados
 */
function endQuiz() {
  quiz.stopTimer();
  quiz.finish();

  // Caso esteja no modo desafio
  if (quiz.isChallenge) {
    if (quiz.score === questions.length && quiz.timeLeft > 0) {
      // Vitória
      document.getElementById("success-score").textContent = `${quiz.score} / ${questions.length}`;
      document.getElementById("success-time").textContent = `${60 - quiz.timeLeft}s`;
      showScreen(document.getElementById("success-screen"));
    } else {
      // Falha
      document.getElementById("fail-score").textContent = `${quiz.score} / ${questions.length}`;
      showScreen(document.getElementById("fail-screen"));
    }
    return; // impede tela final normal
  }

  // Fluxo normal
  bestScoreSpan.textContent = `${quiz.bestScore} / ${questions.length}`;
  currentScoreSpan.textContent = `${quiz.score} / ${questions.length}`;
  timeInfo.textContent = quiz.isChallenge ? `Tempo restante: ${quiz.timeLeft}s` : "";
  showScreen(endScreen);
}

// Escuta o evento de tempo esgotado no modo desafio
document.addEventListener("timeUp", () => {
  endQuiz(); 
});

normalBtn.onclick = () => startQuiz(false);
challengeBtn.onclick = () => startQuiz(true);
restartBtn.onclick = () => showScreen(startScreen);

// Reiniciar do modo falha
const failRestartBtn = document.getElementById("restart-fail");
if (failRestartBtn) {
  failRestartBtn.onclick = () => showScreen(startScreen);
}

// Reiniciar do modo sucesso
const successRestartBtn = document.getElementById("restart-success");
if (successRestartBtn) {
  successRestartBtn.onclick = () => showScreen(startScreen);
}