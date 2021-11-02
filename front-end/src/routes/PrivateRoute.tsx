import { Route, Redirect } from 'react-router-dom';

function PrivateRoute({ component: Component, ...rest }: { component: any }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        true ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: '/login', state: { from: props.location } }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
