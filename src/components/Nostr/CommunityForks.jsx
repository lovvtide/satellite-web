import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';

import { navigate } from '../../actions';

import CommunityList from './CommunityList';


class CommunityForks extends PureComponent {

	state = {};

	componentDidMount = () => {

		this.maybeRedirect();
	};

	componentDidUpdate = (prevProps) => {

		if (Object.keys(prevProps.followingList).length !== Object.keys(this.props.followingList).length) {
			this.maybeRedirect();
		}
	};

	maybeRedirect = () => {

		let redirect;

		for (let a of Object.keys(this.props.followingList)) {

			const _a = a.split(':');

			if (_a[2] === this.props.match.params.name) {

				let npub;

				try {

					npub = nip19.npubEncode(_a[1]);

				} catch (err) {}

				if (npub) {
					redirect = `/n/${_a[2]}/${npub}`;
					break;
				}
			}
		}

		if (redirect) {

			this.props.navigate(redirect);
		}
	};

	render = () => {

		const { mobile } = this.props;

		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					paddingLeft: mobile ? 12 : 0,
					paddingRight: mobile ? 12 : 0,
					paddingTop: mobile ? 12 : 48
				}}
			>
				<div
					style={{
						width: mobile ? '100%' : '35%'
					}}
				>
					<CommunityList
						filter={item => {
							return item.name === this.props.match.params.name;
						}}
					/>
				</div>
			</div>
		);
	};

}

const mapState = ({ app, communities }) => {

	return {
		mobile: app.mobile,
		list: communities.list,
		followingList: communities.followingList
	};
};

export default connect(mapState, { navigate })(CommunityForks);
