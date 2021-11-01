interface FSMOptions {
  initialState: string;
  context?: any;
  states: StateRecord;
}
type StateRecord = Record<string, Transitions>;
interface Transitions {
  onEnter?: FSMTransitionHook;
  onLeave?: FSMTransitionHook;
  onError?: FSMTransitionHook;
  transitions: {
    [transitionName: string]: string;
  };
}
type FSMTransitionHook = (
  context: any,
  transition: (transitionName: string) => void
) => void;
type FSMTransitionHandler = (nextState: string, context?: any) => void;
type FSMTransitionError = (error: string, context?: any) => void;
