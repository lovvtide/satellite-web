import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { nip19 } from 'nostr-tools';

import { COLORS } from '../../constants';


class ApproveButton extends PureComponent {

	state = {}

	onMouseOver = () => {
		this.setState({ hover: true });
		if (this.props.onHoverState) {
			this.props.onHoverState(true);
		}
	};

	onMouseOut = () => {
		this.setState({ hover: false });
		if (this.props.onHoverState) {
			this.props.onHoverState(false);
		}
	};

	render = () => {

		return (
			<div
				onMouseOver={this.onMouseOver}
				onMouseOut={this.onMouseOut}
				onClick={this.props.onClick}
				style={{
					userSelect: 'none',
					whiteSpace: 'nowrap',
					textTransform: 'uppercase',
					cursor: 'pointer',
					fontSize: 11,
					fontFamily: 'JetBrains-Mono-Bold',
					color: this.state.hover ? '#fff' : COLORS.secondaryBright
				}}
			>
				<Icon name='circle check' />
				approve
			</div>
		);
	};
}

export default ApproveButton;
