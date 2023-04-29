import Client from '../modules/Client';
import { loadRoute } from './Layout';
import { nostrMainInit } from './Nostr';


export const INITIALIZE_EXC = 'INITIALIZE_EXC';
export const INITIALIZE_RES = 'INITIALIZE_RES';
export const INITIALIZE_ERR = 'INITIALIZE_ERR';
export const initialize = (store) => {
	return async (dispatch, getState) => {

		try {

			dispatch({ type: INITIALIZE_EXC });

			store.subscribe(() => {
				const { app, router } = getState();
				const prev = app.route;
				const next = router.location.pathname;
				if (prev !== next) {
					dispatch(loadRoute(prev, next));
				}
			});

			dispatch({ type: INITIALIZE_RES });

			// Instantiate and initialize the nostr client
			window.client = new Client(window);

			dispatch(nostrMainInit(window.client));

		} catch (err) {
			console.log(err);
			dispatch({ type: INITIALIZE_ERR, err });
		}
	};
};

