import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { COLORS } from '../../constants';


class Relays extends PureComponent {

	render = () => {

		const { mobile, relays } = this.props;

		//console.log('relays', relays);

		return (
			<div style={{
				padding: mobile ? 12 : 24,
			}}>
				{relays.map(({ url, connected, connecting, error }) => {
					return (
						<div
							key={url}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								height: 24,
								fontSize: 12,
								color: COLORS.secondaryBright,
								fontFamily: 'JetBrains-Mono-Regular'
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<div style={{
									height: 10,
									width: 10,
									borderRadius: 10,
									marginRight: 8,
									border: `5px solid ${error ? COLORS.red : (connected && !connecting ? COLORS.green : COLORS.secondaryBright)}`
								}} />
								<div>{url}</div>
							</div>
							<div>
								{error ? 'error' : (connecting ? 'connecting' : (connected ? 'connected' : ''))}
							</div>
						</div>
					);
				})}
				<div style={{ textAlign: 'center', fontSize: 13, marginTop: 24, color: COLORS.secondaryBright }}>Ability to edit relays coming soon!</div>
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		mobile: app.mobile,
		clientHeight: app.clientHeight,
		relays: Object.keys(nostr.relays || {}).map(url => {
			return {
				url,
				...nostr.relays[url]
			};
		})
	};
};

export default connect(mapState)(Relays);
