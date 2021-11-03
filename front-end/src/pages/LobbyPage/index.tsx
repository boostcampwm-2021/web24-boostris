import { useHistory } from 'react-router-dom';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

type locationState = { user: { login: string }; name?: string };

function LobbyPage() {
  const {
    location: { state },
  } = useHistory<locationState>();
  return (
    <AppbarLayout>
      <div className="lobby__page--root">
        <div>Lobby</div>
        <div>WELCOME</div>
        {/*<div>{state.user ? JSON.stringify(state.user.login) : state.name}</div>*/}
      </div>
    </AppbarLayout>
  );
}

export default LobbyPage;
