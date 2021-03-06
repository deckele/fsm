export class FSM {
  private state: string;
  private initialState: string;
  private context: object;
  private error = "";
  private states: StateRecord;
  private transitionSubscribers = new Set<FSMTransitionHandler>();
  private errorSubscribers = new Set<FSMTransitionError>();
  constructor({ initialState, states, context = {} }: FSMOptions) {
    this.initialState = initialState;
    this.state = initialState;
    this.context = context;
    this.states = states;
    this.notifyStateChanged();
  }
  transition(transitionName: string): void {
    const currentTransitions = this.states[this.state];
    const nextState = this.states[this.state]?.transitions?.[transitionName];
    if (!nextState) {
      this.error = `Error: Can't transition from state: "${this.state}" to state: "${transitionName}"`;
      // Error current state hook
      currentTransitions.onError?.(this.context, this.transition.bind(this));
      this.notifyStateError();
      return;
    }
    // Leave current state hook
    currentTransitions.onLeave?.(this.context, this.transition.bind(this));
    this.state = nextState;
    this.notifyStateChanged();
  }
  private notifyStateChanged(): void {
    // Enter next state hook
    this.states[this.state].onEnter?.(this.context, this.transition.bind(this));
    this.transitionSubscribers.forEach((handler) =>
      handler(this.state, this.context)
    );
    if (this.error) {
      this.error = "";
      this.errorSubscribers.forEach((handler) =>
        handler(this.error, this.context)
      );
    }
  }
  private notifyStateError(): void {
    this.errorSubscribers.forEach((handler) =>
      handler(this.error, this.context)
    );
  }
  getState(): string {
    return this.state;
  }
  getError(): string | undefined {
    return this.error;
  }
  getContext(): any {
    return this.context;
  }
  subscribe(
    onTransition: FSMTransitionHandler,
    onError?: FSMTransitionError
  ): void {
    this.transitionSubscribers.add(onTransition);
    onTransition(this.state, this.context);
    if (onError) {
      this.errorSubscribers.add(onError);
      onError(this.error, this.context);
    }
  }
  unsubscribe(
    onTransition: FSMTransitionHandler,
    onError?: FSMTransitionError
  ): void {
    this.transitionSubscribers.delete(onTransition);
    if (onError) this.errorSubscribers.delete(onError);
  }
}

// React only:
//
// function useFSM({ initialState, states }: FSMOptions) {
//   const [state, setState] = useState(initialState);
//   const transition = useCallback(
//     (transitionName: string): void => {
//       setState((currentState) => {
//         const nextState = states[currentState]?.transitions?.[transitionName];
//         return nextState ?? currentState;
//       });
//     },
//     [states]
//   );
//   return [state, transition] as const;
// }
