import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


import freefireLogoBanner from "@/assets/freefire-logo.png";
import q1BattleRoyale from "@/assets/quiz/q1-battle-royale.jpg";
import q2DjAlok from "@/assets/quiz/q2-dj-alok.jpg";
import q3Map from "@/assets/quiz/q3-map.jpg";
import q4Sniper from "@/assets/quiz/q4-sniper.jpg";
import q5Squad from "@/assets/quiz/q5-squad.jpg";
import q6Pets from "@/assets/quiz/q6-pets.jpg";
import q7Ranks from "@/assets/quiz/q7-ranks.jpg";
import q8Vehicles from "@/assets/quiz/q8-vehicles.jpg";
import q9Skins from "@/assets/quiz/q9-skins.jpg";
import q10Airdrop from "@/assets/quiz/q10-airdrop.jpg";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  imageUrl: string;
};

const questions: Question[] = [
  {
    question: "What is the name of Free Fire's main game mode?",
    options: ["Team Deathmatch", "Clash Squad", "Battle Royale", "Ranked Mode"],
    correctIndex: 2,
    imageUrl: q1BattleRoyale,
  },
  {
    question: "What is DJ Alok's special ability?",
    options: ["Area healing", "Increased speed", "Extra damage", "Protection shield"],
    correctIndex: 0,
    imageUrl: q2DjAlok,
  },
  {
    question: "What is Free Fire's classic map?",
    options: ["Kalahari", "Alpine", "Purgatory", "Bermuda"],
    correctIndex: 3,
    imageUrl: q3Map,
  },
  {
    question: "What is the most powerful sniper rifle in Free Fire?",
    options: ["Kar98k", "AWM", "M82B", "SVD"],
    correctIndex: 1,
    imageUrl: q4Sniper,
  },
  {
    question: "How many players can be in a squad in classic mode?",
    options: ["2", "5", "3", "4"],
    correctIndex: 3,
    imageUrl: q5Squad,
  },
  {
    question: "What is the function of pets in Free Fire?",
    options: ["Attack enemies", "Carry items", "Decoration only", "Provide special abilities"],
    correctIndex: 3,
    imageUrl: q6Pets,
  },
  {
    question: "What is the highest rank in Free Fire's ranked mode?",
    options: ["Heroic", "Diamond", "Grandmaster", "Master"],
    correctIndex: 0,
    imageUrl: q7Ranks,
  },
  {
    question: "Which vehicle is known as the most resistant in Free Fire?",
    options: ["Monster Truck", "Motorcycle", "Tuk Tuk", "Car"],
    correctIndex: 0,
    imageUrl: q8Vehicles,
  },
  {
    question: "What are skins in Free Fire?",
    options: ["Missions", "Game currency", "Visual customizations", "Special weapons"],
    correctIndex: 2,
    imageUrl: q9Skins,
  },
  {
    question: "What do you find in an airdrop in Free Fire?",
    options: ["Food", "Pets", "Vehicles", "Rare items and powerful weapons"],
    correctIndex: 3,
    imageUrl: q10Airdrop,
  },
];

const QuizStripEn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  

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
            Free Fire Quiz
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Test your knowledge and win prizes!
          </p>

          <div className="info-box mb-4">
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
              🏆 Amazing Prize
            </h3>
            <p className="text-sm text-muted-foreground">
              Answer 70% or more questions correctly and unlock up to{" "}
              <span className="text-primary font-bold">70% OFF</span> on Diamond packages.
            </p>
          </div>

          <div className="info-box mb-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <span>🔹</span> Quiz Rules
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 10 questions about Free Fire</li>
              <li>• Choose one answer for each question</li>
              <li>• Confirm your answer to proceed</li>
              <li>• You need at least 7 correct answers (70%) to win</li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-xl font-semibold text-center btn-primary-gradient"
          >
            Start Quiz 🔥
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations! 🎉</h2>
            <p className="text-muted-foreground mb-4">
              You got {score} out of {totalQuestions} questions right!
            </p>

            <div className="bg-primary/10 rounded-xl p-4 mb-4">
              <span className="text-2xl">✨</span>
              <p className="text-3xl font-bold text-primary">70% OFF</p>
              <p className="text-sm text-muted-foreground">on any Diamond package!</p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Congratulations on getting more than 70% of the quiz correct! This proves you're truly
              a super player, that's why we're releasing our best-selling Diamond packages with 70% discount.
              Get more than 5000 Diamonds practically for free now!
            </p>

            <button
              onClick={() => navigate(getNavigationPath("/id-player-en"))}
              className="w-full mb-3 py-3 rounded-xl font-semibold btn-primary-gradient"
            >
              Claim Prize 💎
            </button>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors"
            >
              Back to Start
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Almost there!</h2>
          <p className="text-muted-foreground mb-4">
            You got {score} out of {totalQuestions} questions right.
          </p>

          <div className="bg-muted rounded-xl p-4 mb-4">
            <p className="text-3xl font-bold text-foreground">{percent}%</p>
            <p className="text-sm text-muted-foreground">correct</p>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            You need at least 7 correct answers to win the discount.
            Try again!
          </p>

          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-xl font-semibold btn-primary-gradient"
          >
            Try Again
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
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
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
          Next Question
        </button>
      </div>
    </div>
  );
};

export default QuizStripEn;
