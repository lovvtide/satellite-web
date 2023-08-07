import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { COLORS } from '../../constants';
import { transition } from '../../helpers';
import { setLocalPrivateKey, loadActiveNostr, navigate } from '../../actions';

import { Button } from '../CommonUI';


class SignIn extends Component {

	state = {
		hover: '',
		focus: '',
		error: '',
		privateKey: '',
		pendingSignIn: false
	};

	componentWillUnmount = () => {

		clearTimeout(this._showError);
	};

	handleChange = (event) => {

		const { value } = event.target;

		let privateKey = value.toLowerCase();
		let error = '';

		if (privateKey) {

			try {

				if (privateKey.length === 64 || privateKey.length === 66) { // Assume hex

					if (privateKey.length === 66) {

						if (privateKey.substring(0, 2) === '0x') {

							privateKey = privateKey.slice(2); // Strip hex prefix

						} else {
							throw Error();
						}
					}

					const hexchars = '0123456789abcdef';

					// Ensure valid hex chars
					for (let c of privateKey) {

						if (hexchars.indexOf(c) === -1) {
							throw Error();
						}
					}

				} else { // nip19 encoded?

					// Attempt to decode to detect errors
					const decoded = nip19.decode(privateKey);

					if (decoded.type !== 'nsec' || privateKey.length !== 63) {
						throw Error();
					}
				}

			} catch (err) {

				error = 'Invalid key';
			}
		}

		this.setState({
			pendingSignIn: false,
			privateKey,
			error
		});
	};

	handleKeyPress = (event) => {

		const { privateKey, error } = this.state;

		if (event.key === 'Enter') {

			event.preventDefault();

			if (privateKey && !error) {

				this.handleSubmit();
			}
		}
	};

	handleSubmit = () => {

		this.setState({ pendingSignIn: true });

		let normalized;

		try {

			normalized = window.client.normalizeKey(this.state.privateKey);

		} catch (err){
			console.log('caught error', err);
			this.setState({ pendingSignIn: false })
		}

		if (!normalized) { return; }

		setLocalPrivateKey(normalized);
		this.props.loadActiveNostr();
		this.props.navigate('/');
	};

	renderSignInForm = () => {

		return (
			<div>
				<div style={styles.header}>
					<div style={styles.headerText}>
						To sign in, please provide your nostr secret key. If
						you'd like to create a new identity, go to the <Link to='/register'><span style={{ color: '#fff', textDecoration: 'underline' }}>sign up page</span></Link>.
					</div>
				</div>
				<div style={styles.inputSection}>
					<div style={styles.inputLabel}>
						<span>Your Secret Key</span>
					</div>
					<textarea
						value={this.state.focus === 'input' ? this.state.privateKey : ('•').repeat(this.state.privateKey.length)}
						onMouseOver={() => this.setState({ hover: 'input' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onFocus={() => this.setState({ focus: 'input' })}
						onBlur={() => this.setState({ focus: '' })}
						onKeyPress={this.handleKeyPress}
						onChange={this.handleChange}
						style={styles.textarea(this.state)}
						spellCheck={false}
						autoCorrect='off'
						autoCapitalize='none'
						type='text'
						lines={3}
					/>
				</div>
				<div style={{ ...styles.headerText, marginBottom: 24, marginTop: -12, color: COLORS.secondaryBright }}>
					Note: While it <em>is possible</em> to sign in by copy/pasting your secret key, it's highly recommended that you instead use a browser extension such as <a style={styles.link} href={`https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp`} target='_blank'>nos2x</a>.
				</div>
				<div style={styles.footer(this.state, this.props)}>
					{this.state.error ? (
						<div
							style={{
								color: COLORS.red,
								fontSize: 13,
								userSelect: 'none',
								cursor: 'default',
								marginTop: 36,
								display: 'flex',
								justifyContent: 'center'
							}}
						>
							{this.state.error}
						</div>
					) : null}
					{this.state.error || this.state.pendingSignIn ? null : (
						<Button
							chevronRight
							onClick={this.handleSubmit}
							style={{ borderRadius: 4, width: 'fit-content', margin: 'auto', padding: '7px 10px 7px 14px', border: `1px solid ${COLORS.secondaryBright}`, justifyContent: 'center' }}
							text='SIGN IN'
							status={!this.state.privateKey || this.state.error ? 'disabled' : undefined}
							color={this.state.privateKey && !this.state.error ? COLORS.satelliteGold : '#fff'}
							disabledOpacity={0.85}
							disabledMessage={!this.state.privateKey ? 'Please provide your secret key' : ''}
						/>
					)}
				</div>
			</div>
		);
	};

	render = () => {

		const { mobile } = this.props;
	
		if (mobile) {

			const width = Math.min(this.props.clientWidth - 16, 344);

			return (
				<div>
					<div style={{ ...styles.container, width, padding: '24px 16px', height: 342 }}>
						{this.renderSignInForm()}
					</div>
				</div>
			);
		}

		return (
			<div>
				<div style={{ ...styles.container, transform: 'translate(-54%, -46%)', display: mobile ? 'none' : 'inherit' }} />
				<div style={styles.container}>
					{this.renderSignInForm()}
				</div>
			</div>
		);
	};
}

const mapState = ({ app }) => {

	return {
		mobile: app.mobile,
		clientWidth: app.clientWidth
	};
};

const styles = {

	textarea: ({ focus, hover }) => {
		return {
			color: '#fff',
			outline: 'none',
			width: '100%',
			border: `1px solid ${COLORS.secondary}`,
			background: focus === 'input' || hover === 'input' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
			padding: 12,
			fontSize: 13,
			fontFamily: 'JetBrains-Mono-Regular',
			height: 86,
			lineHeight: '20px',
			resize: 'none',
			overflow: 'hidden'
		};
	},

	footer: ({ error }, { mobile }) => {
		return {
			whiteSpace: 'nowrap',
			height: 36,
			marginTop: mobile ? 48 : 0
		};
	},

	headerText: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 13,
		fontFamily: 'Lexend-Deca-Regular'
	},

	header: {
		marginBottom: 24,
	},

	inputSection: {
		marginBottom: 28
	},

	confirmButtonMobile: (ready) => {
		return {
			opacity: ready ? 1 : 0.5,
			color: 'rgb(255, 255, 255)',
			fontSize: 14,
			margin: 'auto',
			display: 'block',
			width: 128,
			textAlign: 'center',
			userSelect: 'none',
			padding: '8px 0px 8px',
			border: `1px solid ${COLORS.blue}`,
			lineHeight: '24px',
			fontFamily: 'JetBrains-Mono-Bold',
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},

	input: ({ active, mobile, background }) => {
		return {
			outline: 'none',
			width: '100%',
			border: `1px solid ${COLORS.secondary}`,
			background: background || (active ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)'),
			color: '#fff',
			padding: '0px 10px 0px 38px',
			height: mobile ? 42 : 36,
			fontSize: 14,
			fontFamily: 'JetBrains-Mono-Regular'
		};
	},

	inputLabel: {
		fontSize: 12,
		marginBottom: 6,
		color: '#fff',
		fontFamily: 'JetBrains-Mono-Regular',
		textTransform: 'uppercase'
	},

	container: {
		border: `1px solid ${COLORS.secondary}`,
		color: '#fff',
		padding: 32,
		position: 'absolute',
		top: '50%',
		left: '50%',
		height: 422,
		width: 333,
		background: COLORS.primary,
		transform: 'translate(-50%, -50%)'
	}
};

export default connect(mapState, { loadActiveNostr, navigate })(SignIn);
