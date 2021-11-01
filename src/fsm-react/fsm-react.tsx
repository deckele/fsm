import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
  createContext,
  useContext
} from "react";
import { FSM } from "../fsm";

function useFSMBindings(fsm: FSM): FSMData {
  const [state, setState] = useState(fsm.getState());
  const [error, setError] = useState(fsm.getError());
  const [context, setContext] = useState(fsm.getContext());
  // Rerender on state transition
  const onTransition = useCallback<FSMTransitionHandler>(
    (nextState: string, context: any) => {
      setState(nextState);
      setContext(context);
    },
    []
  );
  const onError = useCallback<FSMTransitionError>(
    (error: string, context: any) => {
      setError(error);
      setContext(context);
    },
    []
  );
  useEffect(() => {
    // Subscribe to state transitions
    fsm.subscribe(onTransition, onError);
    // unsubscribe from state transitions
    return () => fsm.unsubscribe(onTransition, onError);
  }, [fsm, onTransition, onError]);
  // function to fire transition
  const transition = useCallback(
    (transitionName: string) => {
      fsm.transition(transitionName);
    },
    [fsm]
  );

  return useMemo(
    () => ({
      state,
      error,
      context,
      transition
    }),
    [state, error, context, transition]
  );
}

const FSMContext = createContext<FSMData>({
  state: "",
  error: "",
  context: {},
  transition: () => {}
});
const FSMContextProvider = FSMContext.Provider;

interface FSMProviderProps {
  fsm: FSM;
  children?: ReactNode;
}
export function FSMProvider({ fsm, children }: FSMProviderProps) {
  const fsmData = useFSMBindings(fsm);
  return <FSMContextProvider value={fsmData}>{children}</FSMContextProvider>;
}
export function useFSM(): FSMData {
  return useContext(FSMContext);
}
