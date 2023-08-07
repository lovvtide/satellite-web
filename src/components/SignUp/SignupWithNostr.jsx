import React, { Component } from 'react';
import { Icon, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import { nip19, getPublicKey, generatePrivateKey } from 'nostr-tools';

import { COLORS } from '../../constants';
import { transition } from '../../helpers';
import { setLocalPublicKey, setLocalPrivateKey, loadActiveNostr, navigate } from '../../actions';

import svgalias from '../../assets/alias_secondary_bright.svg';
import svgfingerprint from '../../assets/fingerprint_secondary_bright.svg';
import svgglobe from '../../assets/wire-globe.svg';

import StyledButton from '../common/StyledButton';
import PrettyModal from '../common/PrettyModal';
import PrettySVG from '../common/PrettySVG';
import { Button, X } from '../CommonUI';


class SignupWithNostr extends Component {

	state = {

		id: '',
		idValid: true,
		idError: '',
		idChecking: false,

		publicKey: '',
		secretKey: '',
		secretKeyValid: true,
		secretKeyError: '',
		savedSecretKey: false,

		focus: '',
		hover: '',

		submitted: false,
		unknownError: false,

		useExtension: null,
		detectingExtension: true
	};

	constructor (props) {
		super(props);
		this.secretKeyInput = React.createRef();
	}

	componentDidMount = () => {

		if (window.nostr) {

			this.setState({ detectingExtension: false });

		} else {

			this._detectExtension = setTimeout(() => {

				this.setState({ detectingExtension: false });

			}, 500);
		}
	};

	componentWillUnmount = () => {

		clearTimeout(this._detectExtension);
	};

	confirmErrorStatus = () => {

		let status = '';

		if (/*!this.state.id || this.state.idError || this.state.idChecking*/false) {
			status = 'Please choose a valid ID';
		} else if (window.nostr && this.state.useExtension === null) {
			status = 'Please choose if you would like to use the public key from your nostr extension';
		} else if (!this.state.useExtension && !this.state.secretKey) {
			status = 'Please specify a secret key to link to your ID or generate a new one';
		} else if (!this.state.useExtension && this.state.secretKeyError) {
			status = 'Provided secret key is invalid';
		} else if (!this.state.useExtension && !this.state.savedSecretKey) {
			status = 'Please confirm that you have saved your secret key';
		}

		return status;
	};

	regenerateSecretKey = () => {

		const secretKeyHex = generatePrivateKey();
		const secretKeyEncoded = nip19.nsecEncode(secretKeyHex);

		this.setState({
			secretKey: secretKeyEncoded,
			savedSecretKey: false,
			secretKeyError: ''
		});

		if (!this.props.mobile) {

			this.secretKeyInput.current.focus();
		}

		clearTimeout(this._resetKeyGen);

		this._resetKeyGen = setTimeout(() => {

			this.setState({ pendingSecretKeyGen: false });

		}, 10);
	};

	handleUseExtension = async () => {

		if (!window.nostr) { return; }

		let publicKeyHex;

		try {

			publicKeyHex = await window.nostr.getPublicKey();

		} catch (err) {}

		if (!publicKeyHex) { return; }

		this.setState({
			publicKey: nip19.npubEncode(publicKeyHex),
			useExtension: true
		});
	};

	handleCopySecretKey = () => {

		this.setState({ focus: 'secretKey' });

		this.secretKeyInput.current.value = this.state.secretKey;

		let copied;

		this.secretKeyInput.current.focus();
		this.secretKeyInput.current.select();

		try {

			document.execCommand('copy');

			copied = true;

		} catch (err) {

			this.secretKeyInput.current.blur();
			window.getSelection().empty();
		}

		if (copied && !this.state.showCopiedLabel) {

			if (this.props.copyAnimation !== false) {
				this.setState({ showCopiedLabel: true });
			}

			if (this.props.mobile) {

				this.secretKeyInput.current.blur();

			}

			this._resetCopiedLabel = setTimeout(() => {

				this.setState({ showCopiedLabel: false });
				this.secretKeyInput.current.blur();
				window.getSelection().empty();

			}, 500);
		}
	};

	handleSubmit = async () => {

		if (this.confirmErrorStatus()) { return; }

		if (this.state.useExtension) {

			let pubkey;

			try {

				pubkey = await window.nostr.getPublicKey();

			} catch (err) {}

			if (!pubkey) { return; }

			setLocalPublicKey(pubkey);
			this.props.loadActiveNostr();
			this.props.navigate(`/@${nip19.npubEncode(pubkey)}`);

		} else if (this.state.secretKey) {

			const privateKey = window.client.normalizeKey(this.state.secretKey);
			const pubkey = getPublicKey(privateKey);

			setLocalPrivateKey(privateKey);
			this.props.loadActiveNostr();
			this.props.navigate(`/@${nip19.npubEncode(pubkey)}`);
		}
	};

	/*
	handleIdChange = async (e) => {

		const { value } = e.target;

		clearTimeout(this._checkId); // Clear pending check

		let idError = '';

		const validChars = 'abcdefghijklmnopqrstuvwxyz0123456789-_';

		if (value.length > 20) {
			idError = 'IDs are limited to 20 characters';
		}

		for (let c of value) {
			if (validChars.indexOf(c) === -1) {
				idError = 'Only a-z, 0-9, dash, and underscore are allowed';
			}
		}

		if (value.indexOf(' ') !== -1) {
			idError = 'IDs may not contain spaces';
		}

		this.setState({
			idChecking: false,
			id: value,
			idError
		});

		if (!idError && value) {

			this.setState({ idChecking: true });

			this._checkId = setTimeout(async () => {

				try {

					const nsdata = await axios.get(`${API_ENDPOINT}/ns/lookup?name=${value}`);
					const exists = nsdata.data[0];

					const update = {
						idValid: !exists,
						idChecking: false,
						idError: !exists ? '' : 'This ID has already been registered'
					};

					this.setState(update);

				} catch (err) {

					console.warn('Failed to check alias availability');

					this.setState({
						error: 'Something went wrong. Please check your Internet connection and try again',
						idValid: false,
						idChecking: false,
						idError: '',
						id: ''
					});
				}
			}, 600);
		}
	};
	*/

	handleSecretKeyChange = async ({ value }) => {

		let secretKey = value.toLowerCase();
		let secretKeyError = '';

		if (secretKey) {

			try {

				if (secretKey.length === 64 || secretKey.length === 66) { // Assume hex

					if (secretKey.length === 66) {

						if (secretKey.substring(0, 2) === '0x') {

							secretKey = secretKey.slice(2); // Strip hex prefix

						} else {
							throw Error();
						}
					}

					const hexchars = '0123456789abcdef';

					// Ensure valid hex chars
					for (let c of secretKey) {

						if (hexchars.indexOf(c) === -1) {
							throw Error();
						}
					}

				} else { // nip19 encoded?

					// Attempt to decode to detect errors
					const decoded = nip19.decode(secretKey);

					if (decoded.type !== 'nsec') {
						throw Error();
					}
				}

			} catch (err) {

				secretKeyError = 'Invalid key';
			}
		}

		const update = {
			secretKey,
			secretKeyError,
			savedSecretKey: false
		};

		this.setState(update);
	};

	renderStatusIcon = ({ field }) => {

		const empty = !this.state[field];
		const error = this.state[field + 'Error'];
		const check = this.state[field + 'Checking'];
		const valid = this.state[field + 'Valid'];

		if (error || !valid && field !== 'publicKey') {

			return (
				<Icon
					color='red'
					name='x'
					style={{
						opacity: empty || check ? 0 : 1,
						height: 20,
						width: 16,
						marginRight: -16,
						transform: 'translate(-28px)'
					}}
				/>
			);

		} else {

			if (field === 'secretKey' || field === 'publicKey') {

				return ((this.state.secretKey && !this.state.secretKeyError) || this.state.publicKey) ? (
					<div>
						{this.state.showCopiedLabel ? <div style={styles.copiedLabel}>copied!</div> : null}
						<Icon
							onClick={this.state.savedSecretKey || this.state.publicKey ? null : this.handleCopySecretKey}
							onMouseOver={() => this.setState({ hover: 'copy' })}
							onMouseOut={() => this.setState({ hover: '' })}
							name={this.state.savedSecretKey || this.state.publicKey ? 'circle check' : 'copy outline'}
							color={this.state.savedSecretKey || this.state.publicKey ? 'green' : undefined}
							style={{
								color: this.state.savedSecretKey || this.state.publicKey ? null : '#fff',
								cursor: this.state.savedSecretKey || this.state.publicKey ? 'default' : 'pointer',
								opacity: this.state.hover === 'copy' || this.state.savedSecretKey || this.state.publicKey ? 1 : 0.85,
								height: 20,
								width: 16,
								marginRight: -16,
								transform: 'translate(-28px)'
							}}
						/>
					</div>
				) : null;
			}

			return (
				<Icon
					color='green'
					name='circle check'
					style={{
						opacity: empty || check ? 0 : 1,
						height: 20,
						width: 16,
						marginRight: -16,
						transform: 'translate(-28px)'
					}}
				/>
			);

		}
	};

	renderHeader = () => {

		const { mobile } = this.props;

		//if (mobile) { return null; }

		return (
			<div style={{ padding: mobile ? 16 : 0, marginBottom: mobile ? 0 : 32 }}>
				<div
					style={{
						fontSize: 18,
						marginTop: mobile ? 4 : -8,
						marginBottom: mobile ? 8 : 18,
						fontWeight: 'bold',
						color: '#fff'
					}}
				>
					Join Satellite
				</div>
					<div style={{ marginBottom: mobile ? 0 : 18, color: 'rgba(255,255,255,0.85)', marginTop: mobile ? 0 : -4, fontSize: 13, fontFamily: 'Lexend-Deca-Regular' }}>
						{`Your identify on Satellite is defined by a secret key, enabling you to retain full control of your social profile. If you generate a new key, be sure to save a copy somewhere safe because you'll need it to sign in.`} <Link to={'/register/info'}><span onMouseOver={() => this.setState({ hover: 'info' })} onMouseOut={() => this.setState({ hover: '' })} style={{ color: COLORS.secondaryBright, fontStyle: 'italic', opacity: this.state.hover === 'info' ? 1 : 0.85 }}>{this.props.mobile ? 'Why is this important?' : 'Why is this important?'}</span></Link>
					</div>
			</div>
		);
	};

	renderExtensionPrompt = () => {

		if (!this.state.detectingExtension && window.nostr && this.state.useExtension === null) {

			return (
				<div style={{ opacity: 1 }}>
					<Icon style={{ color: '#fff' }} name='chevron right' />
					<span style={{ color: '#fff', fontSize: 13, opacity: 0.85 }}>
						We've detected a nostr extension in your browser. Do you want to link your
						Satellite ID to the public key from the extension, or use another key?
					</span>
					<div style={{ display: 'flex', marginTop: 10 }}>
						<Button
							onClick={this.handleUseExtension}
							style={{ color: COLORS.satelliteGold, padding: '4px 8px', fontSize: 12, marginRight: 10 }}
							text='USE NOSTR EXTENSION'
						/>
						<Button
							onClick={() => this.setState({ useExtension: false })}
							style={{ padding: '4px 8px', fontSize: 12 }}
							text='USE ANOTHER KEY'
						/>
					</div>
				</div>
			);
		}

		return null;
	};

	renderUseExtension = () => {

		if (!this.state.detectingExtension && window.nostr && this.state.useExtension === true) {

			return (
				<div>
					<div style={styles.inputLabel}>
						<Icon style={{ ...styles.icon, fontSize: 14, height: 18, marginRight: 6 }} name='key' />
						Your Public Key (from nostr extension)
					</div>
					<div style={styles.inputContainer}>
						<textarea
							ref={this.secretKeyInput}
							style={styles.textarea(this.props, this.state)}
							spellCheck={false}
							value={this.state.publicKey}
							autoCorrect='off'
							autoCapitalize='none'
							type='text'
							lines={3}
							disabled
						/>
						{this.renderStatusIcon({ field: 'publicKey' })}
					</div>
				</div>
			);
		}

		return null;
	};

	renderSecretKeyInput = () => {

		const {
			id,
			secretKey,
			focus,
			hover,
			idError,
			secretKeyError,
			savedSecretKey
		} = this.state;

		if (!this.state.detectingExtension && (!window.nostr || this.state.useExtension === false)) {

			return (
				<div>
					<div style={styles.inputSection(this.props, secretKeyError)}>
						<div style={{ ...styles.inputLabel, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<Icon style={{ ...styles.icon, fontSize: 14, height: 18, marginRight: 6 }} name='key' />
								Your Secret Key
							</div>
							{this.state.secretKey ? null : (<Button
								onClick={this.regenerateSecretKey}
								onMouseDown={() => this.setState({ secretKey: '', pendingSecretKeyGen: true })}
								style={{ padding: '2px 6px', fontSize: 11, color: COLORS.satelliteGold }}
								text='GENERATE NEW'
								icon='refresh'
							/>)}
						</div>
						<div style={styles.inputContainer}>
							<textarea
								ref={this.secretKeyInput}
								style={styles.textarea({
									...this.props,
									active: hover === 'secretKey' || focus === 'secretKey'
								}, this.state)}
								spellCheck={false}
								onChange={(e) => this.handleSecretKeyChange(e.target)}
								onMouseOver={() => this.setState({ hover: 'secretKey' })}
								onMouseOut={() => this.setState({ hover: '' })}
								onFocus={() => this.setState({ focus: 'secretKey' })}
								onBlur={() => this.setState({ focus: '', showSecretKey: false })}
								value={this.state.focus === 'secretKey' || this.state.showSecretKey || this.props.mobile ? secretKey : ('•').repeat(secretKey.length)}
								autoCorrect='off'
								autoCapitalize='none'
								type='text'
								lines={3}
							/>
							{this.renderStatusIcon({ field: 'secretKey' })}
						</div>
						<div style={styles.errorStatus(this.props.mobile, secretKeyError)}>{secretKeyError}</div>
					</div>
					{secretKey && !secretKeyError && !this.state.pendingSecretKeyGen ? (<div style={{ marginTop: 42 }}>
						<Checkbox
							style={{ float: 'left', marginTop: 1, marginRight: 10 }}
							checked={savedSecretKey}
							onChange={() => this.setState({ savedSecretKey: !savedSecretKey })}
						/>
						<span style={{ color: '#fff', opacity: 0.85, fontSize: 13 }}>
							I have copied my secret key and stashed a record of it somewhere safe. I understand that if I lose this key I will lose access to my user account.
							{this.state.savedSecretKey ? null : <span> (please check box to confirm)</span>}
						</span>
					</div>) : null}
					{!this.state.secretKey && !this.state.pendingSecretKeyGen ? (
						<div style={{ marginTop: 32, opacity: 0.85 }}>
							<Icon style={{ color: '#fff' }} name='chevron right' />
							<span style={{ color: '#fff', fontSize: 13 }}>
								Provide a nostr secret key or securely generate a new one by {this.props.mobile ? 'tapping' : 'clicking'} "generate new"
							</span>
						</div>
					) : null}
				</div>
			);
		}

		return null;
	};

	renderForm = () => {

		const {
			id,
			secretKey,
			focus,
			hover,
			idError,
			secretKeyError,
			savedSecretKey
		} = this.state;

		return (
			<div style={styles.formContainer(this.props)}>
				{this.renderExtensionPrompt()}
				{this.renderUseExtension()}
				{this.renderSecretKeyInput()}
			</div>
		);
	};

	renderErrorMessage = () => {

		const { unknownError, secretKeyError } = this.state;

		let errorTitle = null;
		let message = null;
		let iconColor = '#fff';
		let icon = null;

		if (unknownError) {

			errorTitle = 'Request Error'
			message = <span>Something went wrong - please check your Internet connection.</span>;
			iconColor = COLORS.satelliteGold;
			icon = 'warning sign';
		}

		return (
			<div
				style={styles.dimmer(errorTitle)}
				onClick={errorTitle ? (() => {
					this.setState({ submitted: false, unknownError: false });
				}) : null}
			>
				<div style={{ textAlign: 'center', padding: 24, width: 300, maxWidth: (this.props.clientWidth || 0) - 24 }}>
					<span style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
						<Icon style={{ marginRight: 5, fontSize: 18, color: iconColor }} name={icon} />
						<span>{errorTitle}</span>
					</span>
					<div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
						{message}
					</div>
				</div>
			</div>
		);
	};

	renderInfo = () => {
		return (
			<div style={{ padding: 24, color: 'rgba(255,255,255,0.85)' }}>
				{true ? (
					<div>
						{this.props.mobile ? (<X
							//onClick={() => this.props.navigate(this.state.transfer ? `/register/transfer#${this.state.transfer}` : '/register')}
							onClick={() => this.props.navigate(`/register`)}
							style={{ float: 'right' }}
						/>) : null}
						<div
							style={{
								fontSize: 18,
								marginBottom: 24,
								lineHeight: '24px'
							}}
						>
							Why is it important to hold your own key?
						</div>
					</div>
				) : null}
				<p>
					A handful of large corporations and governments, working in tandem, have become the de-facto managers of the world's
					social networks.
				</p>
				<p>
					The Internet was never supposed to work this way. It was supposed to be a free a public space, a humanisitic <a href='https://www.eff.org/cyberspace-independence' target='_blank'>Civilization
					of the Mind</a> beyond the reach of the old order seeking to appropriate its power. To realize that original dream we require a new model of digital citizenship and a fundamental change in the
					architecture of social platforms to ensure that our digital identities may be controlled only by those individuals to whom they belong.
				</p>
				<p>
					Satellite is built on a new protocol called <a href='https://github.com/nostr-protocol/nostr' target='_blank'>nostr</a>, which, instead of relying on centralized platforms to store and authenticate user data,
					works by publicly linking your ID (and by extension other things that you publish) to a secret cryptographic key that only you possess and widely distributing this data on a network of independent, community-operated relays.
				</p>
				<p>
					On a practical level, this means:
				</p>
				<ul style={{ paddingLeft: 24 }}>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>You can prove authorship of your posts by digitally signing them with your key</li>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>It's completely up to you whether you want your profile linked to your real name</li>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>You can send encrypted direct messages to anyone (since you know their public key)</li>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>It is impossible for anyone to impersonate you (since only you know your secret key)</li>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>You can never be completely "deplatformed" by any authority (not even Satellite)</li>
					<li style={{ marginBottom: this.props.mobile ? 8 : 0 }}>Your profile can be shared across any application that supports nostr protocol</li>
				</ul>
				<p>
					The Internet is becoming an unstoppable social force. Whether technology works for or against
					the people of Earth depends on the nature of the systems we strengthen with our participation.
				</p>
			</div>
		);
	};

	render = () => {

		if (this.props.mobile) {

			if (this.props.viewInfo) { return this.renderInfo(); }

			const errorStatus = this.confirmErrorStatus();

			const width = Math.min(this.props.clientWidth - 16, 344);

			return (
				<div>
					{this.renderHeader()}
					<div style={{
						width,
						paddingTop: 8,
						margin: 'auto'
					}}>
						{this.renderForm()}
						<Button
							//chevronRight
							onClick={!errorStatus ? this.handleSubmit : null}
							style={{
								width: this.props.clientWidth - 32,
								position: 'absolute',
								bottom: 14,
								justifyContent: 'center',
								fontSize: 14,
								padding: '12px 10px',
								display: 'flex',
								fontWeight: 'bold',
								borderRadius: 5
							}}
							text={this.state.useExtension ? 'CONNECT NOSTR' : 'CREATE ID'}
							status={errorStatus ? 'disabled' : undefined}
							errorMessage={errorStatus}
							color={errorStatus ? 'rgba(255,255,255,0.65)' : '#fff'}
							disabledOpacity={0.85}
						/>
					</div>
{/*					<div style={styles.dimmer(this.state.submitted)}>

					</div>*/}
					{this.renderErrorMessage()}
				</div>
			);
		}

		return (
			<div>
				<div style={{ ...styles.container, transform: 'translate(-52.5%, -47%)' }} />
				<div style={styles.container}>
					{this.renderHeader()}
					{this.renderForm()}
					<StyledButton
						disabled={this.confirmErrorStatus()}
						text={this.state.useExtension ? 'CONNECT NOSTR' : 'CREATE ID'}
						width={this.state.useExtension ? 128 : 105}
						style={{ position: 'absolute', right: 32, bottom: 32, fontSize: 12, fontFamily: 'JetBrains-Mono-Regular', lineHeight: '22px', color: COLORS.satelliteGold }}
						onClick={this.handleSubmit}
					/>
				</div>
				<PrettySVG src={svgglobe} style={styles.circle} />
				<div style={styles.dimmer(this.state.submitted)} />
				{this.renderErrorMessage()}
				<PrettyModal
					open={this.props.viewInfo}
					onClose={() => this.props.navigate('/register')}
					style={{ width: 740 }}
				>
					<div style={{ color: 'rgba(255,255,255,0.95)', lineHeight: '20px' }}>
						{this.renderInfo()}
					</div>
				</PrettyModal>
			</div>
		);
	};
}

const mapState = ({ app }) => {

	return {
		mobile: app.mobile,
		client: app.client,
		clientWidth: app.clientWidth,
		viewInfo: app.routeComponents[1] === 'info'
	};
};

const styles = {

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
			border: `1px solid ${COLORS.satelliteGold}`,
			lineHeight: '24px',
			fontFamily: 'JetBrains-Mono-Bold',
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},

  dimmer: (active) => {
    return {
      position: 'absolute',
      background: 'rgba(0,0,0,0.85)',
      height: '100%',
      width: '100%',
      pointerEvents: active ? 'visible' : 'none',
      opacity: active ? 1 : 0,
      top: 0,
      left: 0,
      zIndex: 1112,
      color: '#fff',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
      ...transition(0.2, 'ease', [ 'opacity' ])
    };
  },

	infoContainer: {
		paddingLeft: 32
	},

	formContainer: ({ mobile }) => {
		return {
			width: mobile ? '100%' : '65%',
		//padding: 0
		};
	},

	inputContainer: {
		display: 'flex',
		alignItems: 'center'
	},

	icon: {
    height: 16,
    marginRight: 8,
    color: /*'#fff'*/COLORS.secondaryBright
	},

	errorStatus: (mobile, status) => {
		return {
			color: COLORS.red,
			fontSize: 13,
			opacity: status ? 1 : 0,
			position: /*mobile*/true ? null : 'relative',
			left: 338,
			top: -28,
			marginTop: /*mobile*/true ? 6 : 0,
			...transition(0.2, 'ease', [ 'height', 'opacity' ])
		};
	},

	input: ({ active, mobile }) => {
		return {
			outline: 'none',
			width: '100%',
			border: `1px solid ${COLORS.secondary}`,
			background: active ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
			color: '#fff',
			padding: '0px 38px 0px 14px',
			height: 42,
			fontSize: mobile ? 14 : 13,
			fontFamily: 'JetBrains-Mono-Regular'
		};
	},

	textarea: ({ mobile, active }, { secretKey, secretKeyError, savedSecretKey }) => {
		return {
			color: '#fff',
			outline: 'none',
			width: '100%',
			border: `1px solid ${COLORS.secondary}`,
			background: active ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
			padding: '13px 38px 13px 14px',
			//height: mobile ? 42 : 36,
			fontSize: 13,
			fontFamily: 'JetBrains-Mono-Regular',
			height: 68,
			lineHeight: '20px',
			resize: 'none',
			overflow: 'hidden'
		};
	},

	inputLabel: {
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 12,
		color: 'rgba(255,255,255,0.85)',
		textTransform: 'uppercase',
		fontFamily: 'JetBrains-Mono-Regular',
		display: 'flex',
		alignItems: 'center'
	},

	inputSection: ({ mobile }, error) => {
		return {
			marginBottom: mobile ? 12 : 8,
			height: /*mobile*/true ? (error ? 104 : 84) : 60,
			...transition(0.2, 'ease', [ 'height', 'opacity' ])
		};
	},

	container: {
		border: '1px solid #fff',
		color: '#fff',
		padding: '42px 40px',
		position: 'absolute',
		top: '50%',
		left: '50%',
		height: 500,
		width: 600,
		background: COLORS.primary,
		transform: 'translate(-50%, -50%)',
		//display: 'flex'
	},

	circle: {
		userSelect: 'none',
		position: 'absolute',
		left: '35%',
		top: '45%',
		width: '90vh',
		borderRadius: 465,
		transform: 'translate(-35%, -45%)',
		marginLeft: -380,
		marginTop: 320,
		zIndex: -1
	},

	copiedLabel: {
		color: '#fff',
		padding: '4px 8px',
		background: COLORS.blue,
		position: 'absolute',
		transform: 'translate(-48px, -26px)',
		fontSize: 11,
		borderRadius: 12,
		lineHeight: '11px',
		fontFamily: 'JetBrains-Mono-Bold',
		opacity: 0.85
	}
};

export default connect(mapState, { loadActiveNostr, navigate })(SignupWithNostr);
