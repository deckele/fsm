import { render } from "react-dom";
import { FSM } from "../fsm";
import { useFSM, FSMProvider } from "../fsm-react";

const fsm = new FSM({
  initialState: "idle",
  context: {
    answer: "",
    error: "",
    picUrl: ""
  },
  states: {
    idle: {
      onEnter: (context) => {
        context.error = "";
      },
      transitions: {
        FETCH: "loading"
      }
    },
    loading: {
      onEnter: (context, transition) => {
        fetch("https://yesno.wtf/api")
          .then((res) => res.json())
          .then((res) => {
            context.answer = res.answer;
            context.picUrl = res.image;
            transition("SUCCED");
          })
          .catch((e) => {
            context.error = e.message ?? e;
            transition("FAIL");
          });
      },
      transitions: {
        SUCCED: "idle",
        FAIL: "error"
      }
    },
    error: {
      transitions: {
        FETCH: "loading"
      }
    }
  }
});

function YesNo() {
  const { context } = useFSM();
  const { answer, picUrl, error } = context;
  return (
    <div>
      {answer ? <div>Answer: {answer}</div> : null}
      {error ? <div>Error! {error}</div> : null}
      {picUrl ? <img src={picUrl} alt="Yes / No"></img> : null}
    </div>
  );
}

function App() {
  const { state, error, transition } = useFSM();
  return (
    <div>
      <button onClick={() => transition("FETCH")}>What is the answer??</button>
      <button onClick={() => transition("UNSUPPORTED_STATE")}>Error me!</button>
      <div>State is: {state}</div>
      {error ? <div>{error}</div> : null}
      <YesNo />
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
