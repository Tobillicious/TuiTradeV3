import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import './Stepper.css';

export const Step = ({ children }) => {
  return <div className="step-content">{children}</div>;
};

const Stepper = ({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Previous",
  nextButtonText = "Next",
  completeButtonText = "Complete",
  showStepNumbers = true,
  showProgressBar = true,
  allowClickToStep = true,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (onFinalStepCompleted) {
      onFinalStepCompleted();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`stepper-container ${className}`}>
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="progress-bar-container">
          <div className="progress-bar-background">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="progress-text">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {showStepNumbers && (
        <div className="step-indicators">
          {steps.map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <motion.div
                key={stepNumber}
                className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${allowClickToStep ? 'clickable' : ''}`}
                onClick={() => allowClickToStep && goToStep(stepNumber)}
                whileHover={allowClickToStep ? { scale: 1.1 } : {}}
                whileTap={allowClickToStep ? { scale: 0.95 } : {}}
              >
                <div className="step-indicator-circle">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check size={16} />
                    </motion.div>
                  ) : (
                    <span className="step-number">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < totalSteps && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Step Content */}
      <div className="step-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="step-content-wrapper"
          >
            {steps[currentStep - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="stepper-navigation">
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="stepper-button stepper-button-secondary"
        >
          <ChevronLeft size={20} />
          {backButtonText}
        </button>

        <button
          onClick={goToNextStep}
          className="stepper-button stepper-button-primary"
        >
          {isLastStep ? completeButtonText : nextButtonText}
          {!isLastStep && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Stepper;