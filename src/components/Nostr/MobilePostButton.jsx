import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { COLORS } from '../../constants';
import { openReplyModal } from '../../actions';


class MobilePostButton extends PureComponent {

	handleClick = (e) => {

		const { feed, active } = this.props;

		e.preventDefault();
		e.stopPropagation();

		this.props.openReplyModal({
			author: { pubkey: active },
			open: true,
			replyTo: null,
			feed
		});
	};

	render = () => {

		if (!this.props.mobile || this.props.showAliasMenuMobile || this.props.topMode || this.props.zapRequest) { return null; }

		return (
			<div
				onClick={this.handleClick}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					userSelect: 'none',
					position: 'fixed',
					bottom: 24,
					right: 24,
					height: 60,
					width: 60,
					color: '#fff',
					background: COLORS.satelliteGold,
					borderRadius: 30,
					zIndex: 99999999999
				}}
			>
				<Icon name='plus' style={{ margin: 0, height: 20, fontSize: 20 }} />
			</div>
		);
	};
}

const mapState = ({ app, menu, nostr }) => {

	return {
		zapRequest: nostr.zapRequest,
		active: nostr.pubkey,
		mobile: app.mobile,
		showAliasMenuMobile: app.showAliasMenuMobile,
		topMode: menu.topMode
	};
};

export default connect(mapState, { openReplyModal })(MobilePostButton);
