import {
	SET_MOBILE_MENU_OPEN,
	SHOW_ALIAS_MENU_MOBILE,
	VIEW_SIDE_PANEL,
	SET_NOTIFICATIONS_LAST_SEEN,
	SET_COMMUNITY_ADMIN_PROPS
} from '../actions';


const INITIAL_STATE = {
	communityMenuMode: 'my_communities',
	createNewCommunity: false,
	editingCommunity: null,
	topMode: null,
	mobileMenuOpen: false,
	sectionLabels: {
		preferences: 'Profile Settings',
		subscriptions: 'Following',
		relays: 'My Relays',
		dm: 'Messages',
		media: 'Media CDN',
		communities: 'Communities',
		notifications: 'Conversations',
	},
	subMode: {},
	sections: [
		{
			value: 'notifications',
			icon: 'comments'
		},
		{
			value: 'communities',
			icon: 'globe'
		},
		{
			value: 'dm',
			icon: 'comment alternate'
		},
		{
			value: 'subscriptions',
			icon: 'circle check',
		},
		{
			value: 'media',
			icon: 'video play'
		},
		{
			value: 'relays',
			icon: 'bullseye'
		},
		{
			value: 'preferences',
			icon: 'cog'
		}
	]
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case '@@router/LOCATION_CHANGE':
			return {
				...state,
				topMode: null
			};

		case SET_COMMUNITY_ADMIN_PROPS:
			return {
				...state,
				...data
			};

		case SET_MOBILE_MENU_OPEN:
			return {
				...state,
				mobileMenuOpen: data.open
			}

		case SHOW_ALIAS_MENU_MOBILE:
			return data.show || data.mobile ? state : {
				...state,
				topMode: null
			};

		case VIEW_SIDE_PANEL:
			return {
				...state,
				topMode: data.topMode,
				mobileMenuOpen: false,
				communityMenuMode: 'my_communities',
				createNewCommunity: false,
				editingCommunity: null,
				subMode: typeof data.subMode === 'undefined' ? state.subMode : {
					...state.subMode,
					[data.topMode]: data.subMode
				}
			};

		default:
			return state;
	}
};
