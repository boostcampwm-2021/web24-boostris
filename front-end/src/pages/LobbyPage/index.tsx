import { useHistory } from 'react-router-dom';

type locationState = { user: { login: string } };

function LobbyPage() {
  const {
    location: { state },
  } = useHistory<locationState>();
  return (
    <div className="full__page--root">
      <div>Lobby</div>
      <div>WELCOME</div>
      <div>{JSON.stringify(state.user.login)}</div>
    </div>
  );
}

export default LobbyPage;
