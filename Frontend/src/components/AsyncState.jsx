export function LoadingState({ message = "Loading..." }) {
  return <div className="loading-state">{message}</div>;
}

export function ErrorState({ message = "Something went wrong." }) {
  return <div className="error-state">{message}</div>;
}
