import { render } from "react-dom";
import { FSM } from "../fsm";
import { useFSM, FSMProvider } from "../fsm-react";

const fsm = new FSM({
  initialState: "off",
  states: {
    off: {
      transitions: {
        TOGGLE: "on"
      }
    },
    on: {
      transitions: {
        TOGGLE: "off"
      }
    }
  }
});

function App() {
  const { state, error, transition } = useFSM();
  return (
    <div>
      <button onClick={() => transition("TOGGLE")}>toggle</button>
      <button onClick={() => transition("UNSUPPORTED_TRANSITION")}>
        Error me!
      </button>
      <div>State is: {state}</div>
      {error ? <div>{error}</div> : null}
    </div>
  );
}

const rootElement = document.getElementById("root");
render(
  <FSMProvider fsm={fsm}>
    <App />
  </FSMProvider>,
  rootElement
);
