import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Author from '../Nostr/Author';
import NIP05 from '../Nostr/NIP05';

import { viewSidePanel, navigate, nostrFollow } from '../../actions';
import { NAV_HEIGHT, COLORS } from '../../constants';
import { transition } from '../../helpers';


class Subscriptions extends PureComponent {

	render = () => {

		const { scrollHeight, mobile, contacts } = this.props;

		return (
			<div style={styles.contentContainer(true)}>
				<div style={{ minHeight: scrollHeight, paddingTop: 16, paddingBottom: 96 }}>
					{contacts.length === 0 ? (
						<div style={{
							display: 'flex',
							justifyContent: 'center',
							marginTop: 24,
							color: COLORS.secondaryBright,
							fontSize: 13
						}}>
							You're not following anyone yet
						</div>
					) : null}
					{contacts.map(({ pubkey, metadata }) => {
						return (
							<div
								key={pubkey}
								style={{
									height: 40,
									display: 'flex',
									alignItems: 'center',
									paddingLeft: mobile ? 16 : 24,
									paddingRight: mobile ? 16 : 24
								}}
							>
								<Author
									infoHover
									active={this.props.active}
									mobile={this.props.mobile}
									infoTriggerId={'following_' + pubkey}
									pubkey={pubkey}
									name={metadata.name}
									displayName={metadata.display_name}
									about={metadata.about}
									nip05={metadata.nip05}
									picture={metadata.picture}
									navigate={this.props.navigate}
									handleFollow={this.props.nostrFollow}
									following
								/>
								{metadata.nip05 ? (
									<NIP05
										value={metadata.nip05}
										clickable={false}
										style={{
											fontSize: 13,
											color: COLORS.secondaryBright,
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}
									/>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
		);
	};
}

const mapState = ({ nostr, app }) => {

	const contactMetadata = nostr.contactMetadata || {};
	
	return {
		scrollHeight: app.minHeight - NAV_HEIGHT,
		mobile: app.mobile,
		active: nostr.pubkey,
		contacts: Object.keys((nostr.contacts || {})[nostr.pubkey] || {}).map(pubkey => {
			return {
				pubkey,
				metadata: contactMetadata[pubkey] || {}
			};
		})
	};
};

const styles = {
	contentContainer: (display) => {
		return {
			padding: '0px 0px 12px 0px',
			opacity: display ? 1 : 0,
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},
	menuContainer: (mobile, clientWidth) => {
		return {
			paddingTop: 0,
			background: COLORS.primary,
			position: 'fixed',
			height: NAV_HEIGHT + 12,
			width: mobile ? '100%' : Math.floor(clientWidth / 2) - 24,
			display: 'flex',
			alignItems: 'center',
			fontFamily: 'JetBrains-Mono-Regular',
			boxShadow: `${COLORS.primary} 0px 12px 12px 0px`
		};
	},
	menuItem: (hover, active, mobile, index) => {
		return {
			color: active ? '#fff' : COLORS.secondaryBright,
			fontWeight: active ? 'bold' : 'normal',
			display: 'inline-block',
			textAlign: 'center',
			fontSize: mobile ? 12 : 11,
			cursor: 'pointer',
			marginLeft: mobile ? 16 : (index === 0 ? 24 : 12),
			lineHeight: '20px',
			paddingBottom: 10,
			borderBottom: `2px solid ${active ? '#fff' : 'transparent'}`,
		};
	},
	loadMoreContainer: {
		textAlign: 'center',
		paddingTop: 24
	},
	loadMoreButton: (hover) => {
		return {
			padding: '8px 12px',
			border: '1px solid #2f363d',
			fontSize: 11,
			cursor: 'pointer',
			fontFamily: 'JetBrains-Mono-Regular',
			userSelect: 'none',
			opacity: hover ? 1 : 0.85,
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},
	centerStatus: ({ scrollHeight }) => {
		return {
			color: COLORS.secondaryBright,
			lineHeight: '20px',
			paddingTop: 24,
			fontSize: 14,
			display: 'flex',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center'
		}
	}
};

export default connect(mapState, { viewSidePanel, navigate, nostrFollow })(Subscriptions);
