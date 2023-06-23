import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { nip19 } from 'nostr-tools';

import EditProfileForm from '../Nostr/EditProfileForm';
import { CanonicalValue } from '../CommonUI';

import { transition } from '../../helpers';
import { COLORS } from '../../constants';
import { handleNostrPublish, navigate } from '../../actions';


class Preferences extends PureComponent {

	state = {
		hover: '',
		showMobile: true
	};

	renderStatusLabel = ({ onboarded, errored, statusText }) => {

		let color = COLORS.secondaryBright;
		let status = 'inactive';
		let icon;

		if (onboarded) {

			color = errored ? COLORS.red : COLORS.satelliteGold;
			status = errored ? 'error' : 'active';
			icon = errored ? 'warning circle' : 'circle check';
		}

		return (
			<span style={styles.statusLabel({ color })}>
				{icon ? <Icon name={icon} /> : null}
				{(statusText || status).toUpperCase()}
			</span>
		);
	};

	renderProfileSection = () => {

		return (
			<div style={styles.sectionContainer(this.props.mobile)}>
				<EditProfileForm
					clientWidth={this.props.clientWidth}
					clientHeight={this.props.clientHeight}
					handlePublish={handleNostrPublish}
					metadata={this.props.metadata}
					mobile={this.props.mobile}
				/>
			</div>
		);
	};

	renderPubkeySection = () => {

		const { mobile, pubkey } = this.props;

		return (
			<div style={{ ...styles.sectionContainer(mobile), paddingBottom: 0 }}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<span style={styles.sectionLabel}>Nostr Public Key</span>
					<span style={{ ...styles.sectionLabel, color: COLORS.secondaryBright, marginLeft: 8 }}>(safe to share)</span>
				</div>
				<CanonicalValue
					style={{ fontSize: 13, width: '100%', marginTop: 8 }}
					value={pubkey}
					copiable
					qr={!this.props.mobile}
				/>
				<div style={styles.sectionInfo}>
					ⓘ Your name on Satellite is an alias of your public key which can be
					shared across any application that supports the nostr protocol.
				</div>
			</div>
		);
	};

	renderPrivateKeySection = () => {

		const { mobile, privateKey } = this.props;

		if (!privateKey) { return null; }

		return (
			<div style={styles.sectionContainer(mobile)}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<span style={styles.sectionLabel}>Nostr Secret Key</span>
					<span style={{ ...styles.sectionLabel, color: COLORS.secondaryBright, marginLeft: 8 }}>(do not share!)</span>
				</div>
				<CanonicalValue
					style={{ fontSize: 13, width: '100%', marginTop: 8 }}
					value={this.props.privateKey/*Utils.toChecksumAddress(primaryAddress)*/}
					copiable
					hidden
				/>
				<div style={styles.sectionInfo}>
					ⓘ Your secret key is stored locally and establishes ownership of your profile
					by digitally sign everything you post. If you clear
					your browser storage you'll need to provide this key to sign in again, so
					please make sure you've saved a copy in a secure location.
				</div>
			</div>
		);
	};

	render = () => {

		return (
			<div style={styles.settingsContainer(this.props.mobile, !this.props.mobile || this.state.showMobile, this.props.scrollHeight)}>
				{this.renderPubkeySection()}
				{this.renderPrivateKeySection()}
				{this.renderProfileSection()}
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {
	return {
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		scrollHeight: app.minHeight,
		mobile: app.mobile,
		pubkey: nip19.npubEncode(nostr.pubkey),
		privateKey: nostr.privateKey ? nip19.nsecEncode(nostr.privateKey) : undefined,
		metadata: nostr.pubkey && nostr.metadata ? (nostr.metadata[nostr.pubkey] || {}) : {}/*(nostr.metadata || {})[nostr.pubkey] || {}*/
	};
};

const styles = {

	sectionContainer: (mobile) => {
		return {
			//borderBottom: '1px solid #2f363d',
			whiteSpace: 'normal',
			padding: mobile ? 16 : '24px 24px 96px 24px'
		};
	},

	sectionDescription: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 13
	},

	statusLabel: ({ color }) => {
		return {
			fontFamily: 'JetBrains-Mono-Regular',
			borderRadius: 3,
			marginLeft: 12,
			fontSize: 12,
			color
		};
	},
	
	sectionLabel: {
		textTransform: 'uppercase',
		fontFamily: 'JetBrains-Mono-Bold',
		fontSize: 12,
		color: COLORS.satelliteGold
	},

	sectionInfo: {
		marginTop: 16,
		lineHeight: '20px',
		fontSize: 13,
		color: COLORS.secondaryBright,
		whiteSpace: 'pre-wrap'
	},

	item: {
		fontSize: 12,
		marginTop: 12,
		display: 'flex',
		alignItems: 'center'
	},

	itemTitle: (mobile) => {
		return {
			fontWeight: 'bold',
			fontSize: 13
		};
	},

	itemDescription: {
		color: 'rgba(255,255,255,0.5)'
	},

	checkbox: (active) => {
		return {
			cursor: 'pointer',
			transform: 'scale(1.3)',
			marginRight: 12,
			opacity: active ? 1 : 0.5
		};
	},

	settingsContainer: (mobile, display, height) => {
		return {
			height: mobile ? null : height,
			paddingBottom: 96,
			color: '#fff',
			marginTop: 1,
			opacity: display ? 1 : 0,
			maxWidth: 612,
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	}
};

export default connect(mapState, { navigate })(Preferences);
