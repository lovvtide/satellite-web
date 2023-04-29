import React, { PureComponent } from 'react';
import { Popup } from 'semantic-ui-react';

import { COLORS } from '../../constants';


class FollowButton extends PureComponent {

	state = { hover: '' };

	render = () => {

		const { following } = this.props;

		const element = (
			<div
				onMouseOver={() => this.setState({ hover: 'follow' })}
				onMouseOut={() => this.setState({ hover: '' })}
				onClick={() => this.props.onClick(!following)}
				style={{
					display: 'flex',
					flexDirection: 'horizontal',
					alignItems: 'center',
					fontFamily: 'JetBrains-Mono-Bold',
					padding: '0px 12px',
					fontSize: 11,
					height: 28,
					marginTop: 2,
					userSelect: 'none',
					cursor: 'pointer',
					borderRadius: 3,
					color: following ? COLORS.satelliteGold : '#fff',
					border: following ? `0.5px solid ${COLORS.satelliteGold}` : `0.5px solid rgba(255,255,255,${this.state.hover === 'follow' ? 1 : 0.85})`,
					...(this.props.style || {})
				}}
			>
				{following ? 'FOLLOWING' : 'FOLLOW'}
			</div>
		);

		return this.props.active ? element : (
			<Popup
				trigger={element}
				content='Sign in to follow'
				position='top center'
				style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
			/>
		);
	};
}

export default FollowButton;
