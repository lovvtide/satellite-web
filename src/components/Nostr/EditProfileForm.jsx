import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';

import { COLORS } from '../../constants';

const FIELDS = {
	display_name: { placeholder: 'Satoshi Nakamoto', label: 'Display Name' },
	picture: { placeholder: '', label: 'Profile Pic' },
	banner: { placeholder: '', label: 'Banner Image'  },
	nip05: { placeholder: '<name>@satellite.earth', label: 'NIP-05 Verification' },
	about: { placeholder: '', label: 'About', textarea: true }
};

class EditProfileForm extends Component {

	state = {
		scrollTop: 0,
		focus: '',
		hover: '',
		set: {
			display_name: '',
			picture: '',
			banner: '',
			nip05: '',
			about: ''
		}
	};

	componentDidMount = () => {

		const set = {};
		const ext = [];

		// Initialize fields
		for (let field of Object.keys(FIELDS)) {

			set[field] = this.props.metadata[field] || '';
		}

		for (let field of Object.keys(this.props.metadata)) {

			if (!FIELDS[field]) {

				ext.push({
					field,
					value: this.props.metadata[field]
				});
			}
		}

		this.setState({ set, ext });
	};

	componentWillUnmount = () => {
		clearTimeout(this._savingChanges);
	};

	handleMobileScroll = (e) => {

		if (!e.target.scrollingElement) { return; }

		const { scrollTop } = e.target.scrollingElement

		this.setState({ scrollTop });
	};

	handleChange = ({ field, value }) => {

		const update = {
			unsavedChanges: false,
			set: {
				...this.state.set,
				[field]: value
			}
		};

		for (let f of Object.keys(update.set)) {

			if (update.set[f] !== (this.props.metadata[f] || '')) {
				update.unsavedChanges = true;
				break;
			}
		}

		this.setState(update);
	};

	handleConfirm = async () => {

		const { set } = this.state;

		const data = { ...this.props.metadata };

		for (let field of Object.keys(set).sort()) {
			if (set[field] !== (this.props.metadata[field] || '')) {
				data[field] = set[field];
			}
		}

		await this.props.handlePublish({
			content: JSON.stringify(data),
			kind: 0
		});

		this.setState({ savingChanges: true });

		this._savingChanges = setTimeout(() => {
			this.setState({
				savingChanges: false,
				unsavedChanges: false
			});
		}, 1000);
	};

	render = () => {

		const { hover, focus } = this.state;
		const { mobile } = this.props;

		return (
			<div style={styles.container({
				height: this.props.clientHeight + this.state.scrollTop,
				width: this.props.clientWidth,
				mobile
			})}>
				{Object.keys(FIELDS).map(field => {
					const { label, placeholder, textarea } = FIELDS[field];
					return (
						<div key={field}>
							<div style={styles.label(this.props)}>{label}</div>
							{textarea ? (
								<textarea
									onChange={(e) => this.handleChange({ field, value: e.target.value })}
									placeholder={placeholder}
									value={this.state.set[field]}
									style={{ ...styles.input(this.props, { hover: hover === field, focus: focus === field }), resize: 'vertical' }}
									rows={10}
								/>
							) : (
								<input
									onChange={(e) => this.handleChange({ field, value: e.target.value })}
									placeholder={placeholder}
									value={this.state.set[field]}
									style={styles.input(this.props, { hover: hover === field, focus: focus === field })}
								/>
							)}
						</div>
					);
				})}
				<div style={styles.actions(this.props, this.state)}>
					{this.state.savingChanges ? (
						<div style={{ fontSize: 12, color: '#fff' }}>
							<Icon name='circle check' style={{ color: COLORS.green }} />
							<span>PROFILE UPDATED</span>
						</div>
					) : null}
					{this.state.unsavedChanges && !this.state.savingChanges ? (
						<div style={{ fontSize: 12, color: COLORS.secondaryBright }}>
							<Icon name='warning circle' />
							<span>UNSAVED CHANGES</span>
						</div>
					) : null}
					<div
						style={styles.button({ mobile, hover: this.state.hover === 'confirm', color: COLORS.satelliteGold }, this.state)}
						onClick={this.state.unsavedChanges ? this.handleConfirm : null}
						onMouseOver={() => this.setState({ hover: 'confirm' })}
						onMouseOut={() => this.setState({ hover: '' })}
					>
						SAVE PROFILE
					</div>
				</div>
			</div>
		);
	};
}

const styles = {

	button: ({ hover, mobile }, { unsavedChanges }) => {
		return {
			color: unsavedChanges ? COLORS.satelliteGold : COLORS.secondaryBright,
			opacity: unsavedChanges && (hover || mobile) ? 1 : 0.85,
			cursor: unsavedChanges ? 'pointer' : 'default',
			marginLeft: 12,
			padding: mobile ? '8px 14px' : '8px 14px',
			fontSize: 12,
			userSelect: 'none',
			borderRadius: 5,
			border: `0.5px solid ${COLORS.secondary}`
		};
	},

	actions: ({ mobile }, { unsavedChanges }) => {
		return {
			marginTop: mobile ? 12 : 8,
			fontFamily: 'JetBrains-Mono-Regular',
			display: 'flex',
			alignItems: 'center',
			justifyContent: unsavedChanges ? 'space-between' : 'right'
		}
	},

	label: ({ mobile }) => {
		return {
			color: COLORS.satelliteGold,
			fontSize: 12,
			marginBottom: 6,
			fontFamily: 'JetBrains-Mono-Bold',
			textTransform: 'uppercase'
		};
	},

	input: ({ mobile }, { hover, focus }) => {
		return {
			fontFamily: 'JetBrains-Mono-Regular',
			marginBottom: mobile ? 16 : 16,
			width: '100%',
			background: /*hover || focus*/true ? 'rgba(47, 54, 61, 0.25)' : 'transparent',
			border: `1px dotted ${COLORS.secondary}`,
			outline: 'none',
			color: 'rgba(255,255,255,0.85)',
			padding: 12,
			fontSize: 13
		};
	},

	container: ({ mobile, height, width }) => {
		return {
			color: '#fff'
		};
	}
};

export default EditProfileForm;
