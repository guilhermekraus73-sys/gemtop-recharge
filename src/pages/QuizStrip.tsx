import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUtmifyStripePixel } from "@/hooks/useUtmifyStripePixel";

import freefireLogoBanner from "@/assets/freefire-logo.png";
import q1BattleRoyale from "@/assets/quiz/q1-battle-royale.jpg";
import q2DjAlok from "@/assets/quiz/q2-dj-alok.jpg";
import q3Map from "@/assets/quiz/q3-map.jpg";
import q4Sniper from "@/assets/quiz/q4-sniper.jpg";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  imageUrl: string;
};

const questions: Question[] = [
  {
    question: "¿Cuál es el nombre del modo de juego principal de Free Fire?",
    options: ["Team Deathmatch", "Clash Squad", "Battle Royale", "Ranked Mode"],
    correctIndex: 2,
    imageUrl: q1BattleRoyale,
  },
  {
    question: "¿Cuál es la habilidad especial del personaje DJ Alok?",
    options: ["Curación en área", "Velocidad aumentada", "Daño extra", "Escudo de protección"],
    correctIndex: 0,
    imageUrl: q2DjAlok,
  },
  {
    question: "¿Cuál es el mapa clásico de Free Fire?",
    options: ["Kalahari", "Alpine", "Purgatory", "Bermuda"],
    correctIndex: 3,
    imageUrl: q3Map,
  },
  {
    question: "¿Cuál es el arma de francotirador más poderosa en Free Fire?",
    options: ["Kar98k", "AWM", "M82B", "SVD"],
    correctIndex: 1,
    imageUrl: q4Sniper,
  },
];

const QuizStrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useUtmifyStripePixel();

  const getNavigationPath = (basePath: string) => {
    return basePath + location.search;
  };

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentQuestion + 1) / totalQuestions) * 100);

  // Preload all images on mount for instant transitions
  useEffect(() => {
    questions.forEach((q) => {
      const img = new Image();
      img.src = q.imageUrl;
    });
  }, []);

  const handleSelectOption = (index: number) => {
    if (!showFeedback) setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || showFeedback) {
      return;
    }

    const current = questions[currentQuestion];
    const isCorrect = selectedOption === current.correctIndex;

    setShowFeedback(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);

      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 500);
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
  };

  // Start Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Logo outside the card */}
        <div className="mb-6">
          <img src={freefireLogoBanner} alt="Free Fire" className="h-20 md:h-24" />
        </div>
        
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-primary text-center mb-2">
            Encuesta Free Fire
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            ¡Pon a prueba tus conocimientos y gana premios!
          </p>

          <div className="info-box mb-4">
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
              🏆 Premio Increíble
            </h3>
            <p className="text-sm text-muted-foreground">
              Acierta 70% o más de las preguntas y desbloquea hasta{" "}
              <span className="text-primary font-bold">70% OFF</span> en paquetes de Diamantes.
            </p>
          </div>

          <div className="info-box mb-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <span>🔹</span> Reglas del Quiz
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 4 preguntas sobre Free Fire</li>
              <li>• Elige una respuesta para cada pregunta</li>
              <li>• Confirma tu respuesta para avanzar</li>
              <li>• Necesitas al menos 3 respuestas correctas (75%) para ganar</li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-xl font-semibold text-center btn-primary-gradient"
          >
            Comenzar Quiz 🔥
          </button>
        </div>
      </div>
    );
  }

  // Results Screen - Passed
  if (showResult) {
    const percent = Math.round((score / totalQuestions) * 100);
    const passed = percent >= 70;

    if (passed) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 text-center animate-fade-in">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Felicidades! 🎉</h2>
            <p className="text-muted-foreground mb-4">
              ¡Acertaste {score} de {totalQuestions} preguntas!
            </p>

            <div className="bg-primary/10 rounded-xl p-4 mb-4">
              <span className="text-2xl">✨</span>
              <p className="text-3xl font-bold text-primary">70% OFF</p>
              <p className="text-sm text-muted-foreground">¡en cualquier paquete de Diamantes!</p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              ¡Felicidades por haber acertado más del 70% de toda la encuesta! Esto demuestra que eres realmente
              un súper jugador, por eso liberamos nuestros paquetes de Diamantes más vendidos con 70% de descuento.
              ¡Garantiza ahora más de 5000 Diamantes prácticamente gratis!
            </p>

            <button
              onClick={() => navigate(getNavigationPath("/id-player"))}
              className="w-full mb-3 py-3 rounded-xl font-semibold btn-primary-gradient"
            >
              Reclamar Premio 💎
            </button>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }

    // Results Screen - Failed
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 text-center animate-fade-in">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Casi lo logras!</h2>
          <p className="text-muted-foreground mb-4">
            Has acertado {score} de {totalQuestions} preguntas.
          </p>

          <div className="bg-muted rounded-xl p-4 mb-4">
            <p className="text-3xl font-bold text-foreground">{percent}%</p>
            <p className="text-sm text-muted-foreground">correcto</p>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Necesitas al menos 3 respuestas correctas para ganar el descuento.
            ¡Inténtalo de nuevo!
          </p>

          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-xl font-semibold btn-primary-gradient"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  // Question Screen
  const q = questions[currentQuestion];
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Pregunta {currentQuestion + 1} de {totalQuestions}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Image */}
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-muted">
          <img
            src={q.imageUrl}
            alt="Question illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Question */}
        <h2 className="text-lg font-semibold text-foreground mb-4">{q.question}</h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt, index) => {
            let baseClass = "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ";

            if (!showFeedback && selectedOption === index) {
              baseClass += "border-primary bg-primary/5";
            } else if (!showFeedback) {
              baseClass += "border-border bg-card hover:border-primary/50";
            }

            if (showFeedback) {
              if (index === q.correctIndex) {
                baseClass += "border-green-500 bg-green-50";
              } else if (selectedOption === index && index !== q.correctIndex) {
                baseClass += "border-red-500 bg-red-50";
              } else {
                baseClass += "border-border bg-card";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={showFeedback}
                className={baseClass}
              >
                <span className="text-primary font-bold text-lg">{letters[index]}.</span>
                <span className="text-foreground">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={selectedOption === null || showFeedback}
          className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Siguiente Pregunta
        </button>
      </div>
    </div>
  );
};

export default QuizStrip;
