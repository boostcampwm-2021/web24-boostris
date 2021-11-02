import { useHistory } from 'react-router-dom';

type locationState = { user: { login: string }; name?: string };

function LobbyPage() {
  const {
    location: { state },
  } = useHistory<locationState>();
  return (
    <div className="full__page--root">
      <div>Lobby</div>
      <div>WELCOME</div>
      <div>{state.user ? JSON.stringify(state.user.login) : state.name}</div>
    </div>
  );
}

export default LobbyPage;
