import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { COLORS } from '../../constants';


class Media extends PureComponent {

	render = () => {

		const { mobile } = this.props;

		return (
			<div style={{
				padding: mobile ? 12 : 24,
			}}>
				media
			</div>
		);
	};
}

const mapState = ({ app, files }) => {

	return {};

	// return {
	// 	mobile: app.mobile,
	// 	clientHeight: app.clientHeight,
	// 	relays: Object.keys(nostr.relays).map(url => {
	// 		return {
	// 			url,
	// 			...nostr.relays[url]
	// 		};
	// 	})
	// };
};

export default connect(mapState)(Media);
