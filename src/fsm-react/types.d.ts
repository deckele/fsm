interface FSMData {
  state: string;
  error: string | undefined;
  context: any;
  transition: (transitionName: string) => void;
}
