import React, { useState } from 'react';
import { ArrowLeft, Check, PenLine } from 'lucide-react';
import { useBankers } from '../context/BankersContext';
import { ONBOARDING_QUESTIONS } from '../data/onboardingQuestions';
import { StatusBar } from '../components/MobileChrome';

export const OnboardingScreen: React.FC = () => {
  const {
    onboardingStep,
    setOnboardingStep,
    onboardingAnswers,
    onboardingCustomAnswers,
    selectOnboardingAnswer,
    setOnboardingCustomAnswer,
    setCurrentScreen,
    completeOnboardingAndGoHome,
  } = useBankers();

  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const totalSteps = ONBOARDING_QUESTIONS.length;
  const currentQ =
    ONBOARDING_QUESTIONS[onboardingStep] || ONBOARDING_QUESTIONS[0];
  const selectedOptionId = onboardingAnswers[currentQ.id] || '';
  const customText = onboardingCustomAnswers[currentQ.id] || '';
  const isLastStep = onboardingStep === totalSteps - 1;
  const progressPercent = ((onboardingStep + 1) / totalSteps) * 100;

  const handleBack = () => {
    setValidationMsg(null);
    if (onboardingStep > 0) {
      setOnboardingStep((prev) => prev - 1);
    } else {
      setCurrentScreen('signup');
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setValidationMsg(null);
    selectOnboardingAnswer(currentQ.id, optionId);
  };

  const handleNextOrDone = async () => {
    setValidationMsg(null);

    if (!selectedOptionId) {
      setValidationMsg('Please select an option before continuing.');
      return;
    }

    const chosenOption = currentQ.options.find(
      (opt) => opt.id === selectedOptionId
    );
    if (
      (chosenOption?.isOther ||
        selectedOptionId === 'other' ||
        selectedOptionId === 'lainnya') &&
      !customText.trim()
    ) {
      setValidationMsg('Please type your answer in the Other field.');
      return;
    }

    if (isLastStep) {
      await completeOnboardingAndGoHome();
    } else {
      setOnboardingStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Top Navigation Row */}
        <div className="px-6 pt-3 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <h1 className="text-[14.5px] font-bold text-slate-800 tracking-tight">
            Questions
          </h1>

          <span className="text-[11px] font-bold text-[#5E7858] bg-[#EBF1E8] px-2.5 py-0.5 rounded-full">
            {onboardingStep + 1} / {totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#738F6D] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-2 px-0.5">
            {ONBOARDING_QUESTIONS.map((q, idx) => {
              const isAnswered = Boolean(onboardingAnswers[q.id]);
              const isCurrent = idx === onboardingStep;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setValidationMsg(null);
                    setOnboardingStep(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? 'w-5 bg-[#5E7858]'
                      : isAnswered
                      ? 'w-2 bg-[#738F6D]/70'
                      : 'w-2 bg-slate-200'
                  }`}
                  title={`Step ${idx + 1}: ${q.category}`}
                />
              );
            })}
          </div>
        </div>

        {/* Question Card (Soft Sage Box matching PDF) */}
        <div className="px-6">
          <div className="w-full min-h-[116px] rounded-2xl bg-[#EBF1E8] border border-[#DCE6D7] px-5 py-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E7858] bg-white/80 px-2.5 py-0.5 rounded-full mb-1.5">
              {currentQ.category}
            </span>
            <h2 className="text-[14.5px] font-bold text-slate-800 leading-snug">
              {currentQ.question}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {currentQ.subtitle}
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="px-6 mt-4 space-y-2.5">
          {currentQ.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isOtherOption = Boolean(
              option.isOther ||
                option.id === 'other' ||
                option.id === 'lainnya'
            );

            return (
              <div
                key={option.id}
                className={`w-full rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#F3F7F1] border-[#738F6D] shadow-sm ring-1 ring-[#738F6D]/30'
                    : 'bg-[#FAFAFA] border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleOptionSelect(option.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div
                      className={`text-[13px] font-semibold ${
                        isSelected ? 'text-[#3B5236]' : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {option.subtitle}
                      </div>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#738F6D] border-[#738F6D] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* Text Input when "Other" is selected */}
                {isOtherOption && isSelected && (
                  <div className="px-4 pb-3.5 pt-0.5">
                    <div className="relative">
                      <PenLine className="w-3.5 h-3.5 text-[#5E7858] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        value={customText}
                        onChange={(e) => {
                          setValidationMsg(null);
                          setOnboardingCustomAnswer(
                            currentQ.id,
                            e.target.value
                          );
                        }}
                        placeholder={
                          option.placeholder || 'Type your answer here...'
                        }
                        className="w-full h-10 pl-8 pr-3 rounded-lg bg-white border border-[#738F6D]/50 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5E7858] focus:ring-2 focus:ring-[#738F6D]/20 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Validation notice */}
        {validationMsg && (
          <div className="px-6 mt-3">
            <div className="text-center text-[11.5px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2 px-3">
              {validationMsg}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Next / Done Button */}
      <div className="px-6 pt-4 pb-7 flex flex-col items-center">
        <button
          type="button"
          onClick={handleNextOrDone}
          className="w-52 h-11 rounded-full bg-[#738F6D] hover:bg-[#617B5B] active:scale-[0.98] text-white text-[13.5px] font-semibold shadow-md transition-all"
        >
          {isLastStep ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
};
