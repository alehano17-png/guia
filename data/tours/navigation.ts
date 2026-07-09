type NextActionInput = {
  isGuidedStart: boolean;
  startMapViewed: boolean;
  startRouteNextStepId?: string;
  hasChoices: boolean;
  stepNextId?: string;
};

type NextAction =
  | { type: "openStartRoute" }
  | { type: "openDecision" }
  | { type: "advance"; nextStepId: string }
  | { type: "none" };

export function getTourNextAction({
  isGuidedStart,
  startMapViewed,
  startRouteNextStepId,
  hasChoices,
  stepNextId,
}: NextActionInput): NextAction {
  if (isGuidedStart && startRouteNextStepId) {
    if (!startMapViewed) {
      return { type: "openStartRoute" };
    }

    return {
      type: "advance",
      nextStepId: startRouteNextStepId,
    };
  }

  if (hasChoices) {
    return { type: "openDecision" };
  }

  if (stepNextId) {
    return {
      type: "advance",
      nextStepId: stepNextId,
    };
  }

  return { type: "none" };
}

export function getChoiceNextStepId(nextId: string): string {
  return nextId;
}