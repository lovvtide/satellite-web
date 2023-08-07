import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';
import QRCode from 'react-qr-code';

import { X, CanonicalValue } from '../CommonUI';
import Image from './Image';
import Modal from './Modal';

import svglightning from '../../assets/lightning_active.svg';
import { dismissZapRequest, getZapInvoice, payWithLightningWallet } from '../../actions';
import { COLORS } from '../../constants';
import { transition } from '../../helpers';


class ZapRequest extends Component {

	state = { amount: '', note: '', invoice: null };

	componentDidMount = () => {
		this.setState({
			amount: String(this.props.minSendable)
		});
	};

  handleCreateInvoice = async (amount) => {

  	if (amount) {
  		this.setState({ amount });
  	}

  	const invoice = await getZapInvoice({
  		pubkey: this.props.recipientPubkey,
  		amount: amount || this.state.amount,
  		relays: this.props.relays,
  		event: this.props.zapEvent.id,
  		note: this.state.note,
  		url: this.props.callback,
  		upvote: this.props.zapUpvote
  	});

  	if (!invoice) { return; }

  	this.setState({ invoice: invoice.pr });

  	// Try to pay with lightning wallet if detected
  	this.handlePayWithLightningWallet({ invoice: invoice.pr });
  };

  handlePayWithLightningWallet = async (params) => {

  	try {

  		await payWithLightningWallet(params);

  	} catch (err) {
  		console.log(err);
  	}
  };

  handleAmountChanged = (e) => {

  	let amount = e.target.value;
  	let numerals = '0123456789';

  	for (let c of amount) {
  		if (numerals.indexOf(c) === -1) {
  			return;
  		}
  	}

  	if (amount.length > 0) {

	  	amount = parseInt(amount);

	  	if (isNaN(amount)) { return; }
  	}

  	this.setState({ amount: String(amount) });
  };

  handleNoteChanged = (e) => {

  	const note = e.target.value;
  	const maxChars = this.props.commentAllowed;

  	this.setState({ note: maxChars ? note.substring(0, maxChars) : note });
  }; 

 	handleClose = () => {

 		this.props.dismissZapRequest();
 	};

 	renderRecipient = () => {

 		const { recipientPubkey, recipientName, recipientPicture, zapUpvote } = this.props;

 		if (zapUpvote) { return null; }

 		let name = recipientName;

 		if (!name) {

 			const encoded = nip19.npubEncode(recipientPubkey);
 			name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
 		}

 		return (
 			<div style={{
 				display: 'flex',
 				alignItems: 'center',
 				marginBottom: 24
 			}}>
 				<Image
					src={recipientPicture}
					style={{
						height: 36,
						width: 36,
						border: `1px dotted ${COLORS.secondary}`,
						borderRadius: 24,
						marginRight: 12,
						minWidth: 36
					}}
				/>
				<div style={{
					fontWeight: 'bold',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis'
				}}>
					{name}
				</div>
 			</div>
 		);
 	};

 	renderQR = () => {

 		return (
 			<div>
 				{this.state.invoice && !this.props.mobile ? (
 					<div style={styles.inputLabel}>
 						<span>LIGHTNING INVOICE</span>
 					</div>
 				) : null}
				<div
					onMouseOver={() => this.setState({ hover: 'qr' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={() => this.handlePayWithLightningWallet(this.state)}
					style={{
						cursor: this.state.invoice ? 'pointer' : 'default',
						opacity: this.state.invoice ? 1 : 0,
						height: this.state.invoice ? (this.props.mobile ? (this.props.clientWidth - 48) : 256) : 0,
						width: this.state.invoice ? (this.props.mobile ? (this.props.clientWidth - 48) : 256) : 0,
						padding: this.state.invoice ? 10 : 0,
						background: '#fff',
						border: `1px solid ${this.state.invoice && this.state.hover === 'qr' ? COLORS.satelliteGold : '#fff'}`,
						...(this.props.mobile || this.props.zapUpvote ? {} : transition(0.2, 'ease', [ 'width', 'padding', 'opacity' ]))
					}}
				>
					{this.state.invoice ? (<QRCode
						value={this.state.invoice}
						fgColor={COLORS.primary}
						size={this.props.mobile ? this.props.clientWidth - (48 + 24) : 256 - 22}
					/>) : null}
				</div>
			</div>
 		);
 	};

 	renderForm = () => {

 		const { zapUpvote } = this.props;

 		if (this.state.invoice && (this.props.mobile || zapUpvote)) { return null; }

 		if (zapUpvote) {

 			return (
	 			<div style={{
	 				width: this.props.mobile ? (this.props.clientWidth - 48) : 256,
	 				fontSize: 12
	 			}}>
	 				{([ 100, 1000, 10000, 100000 ]).map(amount => {
	 					return (
	 						<div
	 							key={amount}
	 							onClick={() => this.handleCreateInvoice(String(amount))}
	 							onMouseOver={() => this.setState({ hover: `upvote_${amount}` })}
	 							onMouseOut={() => this.setState({ hover: '' })}
	 							style={{
	 								fontSize: 12,
	 								marginBottom: 12,
	 								border: `1px solid ${COLORS.secondaryBright}`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: 36,
									borderRadius: 4,
									cursor: 'pointer',
									userSelect: 'none',
									opacity: `upvote_${amount}` === this.state.hover ? 1 : 0.85
	 							}}
	 						>
	 							{amount} SATS
	 						</div>
	 					);
	 				})}
	 			</div>
 			);
 		}

 		return (
 			<div style={{
 				height: 256,
 				width: this.props.mobile ? (this.props.clientWidth - 48) : 256,
 				fontSize: 12
 			}}>
 				<div style={styles.inputLabel}>AMOUNT IN SATS</div>
 				<div style={{
 					height: 38,
 					display: 'flex',
 					justifyContent: 'space-between',
 					alignItems: 'center',
 					marginBottom: 12,
 					border: `1px dotted ${COLORS.secondary}`,
 					background: this.state.invoice ? 'rgba(47, 54, 61, 0.25)' : 'transparent'
 				}}>
	 				<input
	 					value={this.state.amount}
	 					onChange={this.handleAmountChanged}
	 					disabled={this.state.invoice}
	 					style={{
							width: '100%',
							padding: 12,
							outline: 'none',
							background: 'transparent',
							border: 'none',
							color: '#fff',
							fontFamily: 'Lexend-Deca-Regular',
							fontSize: 13
	 					}}
	 					placeholder={this.props.minSendable}
	 				/>
	 				<div style={{
	 					color: COLORS.secondaryBright,
	 					paddingLeft: 12,
	 					paddingRight: 12,
	 					fontSize: 11
	 				}}>
	 					SATS
	 				</div>
 				</div>
 				<div style={styles.inputLabel}>
 					<span>OPTIONAL ZAP NOTE</span>
 				</div>
 				<textarea
 					value={this.state.note}
 					onChange={this.handleNoteChanged}
 					disabled={this.state.invoice}
 					style={{
 						height: 182,
 						resize: 'none',
						width: '100%',
						padding: 12,
						outline: 'none',
						background: this.state.invoice ? 'rgba(47, 54, 61, 0.25)' : 'transparent',
						border: `1px dotted ${COLORS.secondary}`,
						color: '#fff',
						fontFamily: 'Lexend-Deca-Regular',
						lineHeight: '18px',
						fontSize: 13
 					}}
 					placeholder={this.state.invoice || !this.props.commentAllowed ? undefined : `${this.props.commentAllowed} chars max`}
 				/>
 			</div>
 		);
 	};

 	renderConfirmAction = () => {

 		if (this.state.invoice || this.props.zapUpvote) { return null; }

 		const { minSendable, maxSendable, mobile } = this.props;
 		const { amount } = this.state;

 		const hover = this.state.hover === 'confirm';

 		let errorStatus;

 		if (!amount) {

 			errorStatus = 'Please specify the amount of sats you want to send';

 		} else if (minSendable && parseInt(amount) * 1000 < minSendable) {

 			errorStatus = `The minimum amount of sats you can send is ${Math.floor(minSendable / 1000)}`;

 		} else if (maxSendable && parseInt(amount) * 1000 > maxSendable) {

 			errorStatus = `The maximum amount of sats you can send is ${Math.floor(maxSendable / 1000)}`;
 		}

 		return errorStatus ? (
 			<div style={{
 				fontSize: 13,
 				color: COLORS.red
 			}}>
 				<Icon name='warning circle' style={{ color: COLORS.red }} />
 				{errorStatus}
 			</div>
 		) : (
 			<div
 				onMouseOver={() => this.setState({ hover: 'confirm' })}
 				onMouseOut={() => this.setState({ hover: '' })}
 				onClick={() => this.handleCreateInvoice()}
 				style={{
 					opacity: hover || mobile ? 1 : 0.85,
 					border: `1px solid ${COLORS.secondary}`,
 					fontFamily: 'JetBrains-Mono-Bold',
 					color: COLORS.satelliteGold,
					justifyContent: 'center',
					alignItems: 'center',
					fontSize: 12,
					padding: '10px 16px',
					display: 'flex',
					borderRadius: 5,
					cursor: 'pointer',
					userSelect: 'none',
					width: '100%',
					...transition(0.2, 'ease', [ 'opacity' ])
 				}}
 			>
 				GET INVOICE
 			</div>
 		);

 	};

 	renderInvoiceValue = () => {

 		const { mobile, zapUpvote } = this.props;

 		if (!this.state.invoice) { return null; }

 		return (
			<CanonicalValue
				style={{ fontSize: mobile ? 17 : 12, alignItems: 'center', padding: mobile ? '0px 18px 0px 12px' : 12, width: '100%', height: mobile ? 60 : 44, border: `1px dotted ${COLORS.secondary}` }}
				value={this.state.invoice}
				disableFocusOnCopy={mobile}
				copiable
			/>
 		);
 	};

 	renderBody = () => {

 		return this.props.mobile ? (
 			<div>
				{this.renderQR()}
				{this.renderForm()}
 			</div>
 		) : (
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				height: this.props.zapUpvote ? null : 280
			}}>
				{this.renderQR()}
				{this.renderForm()}
			</div>
 		);
 	};

 	renderInvoiceAction = () => {

 		const { mobile, clientWidth, zapUpvote } = this.props;

 		if (zapUpvote && !this.state.invoice) { return null };

 		return (
			<div style={{
				marginTop: 24,
				marginBottom: 24,
				height: mobile && !this.state.invoice ? 60 : 44,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				position: mobile && !this.state.invoice ? 'absolute' : null,
				width: mobile ? clientWidth - 48 : null,
				bottom: mobile && !this.state.invoice ? 0 : null
			}}>
				{this.renderConfirmAction()}
				{this.renderInvoiceValue()}
			</div>
 		);
 	};

	render = () => {

		const { mobile } = this.props;

		return (
			<Modal
				style={styles.container(this.state, this.props)}
				handleClose={this.handleClose}
				clientHeight={this.props.clientHeight}
				clientWidth={this.props.clientWidth}
				closeOnDimmerClick
			>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 24,
					marginLeft: mobile ? 0 : -24,
					marginRight: mobile ? 0 : -24
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center'
					}}>
						<img
							style={{ marginRight: 8 }}
							src={svglightning}
							height={20}
							width={20}
						/>
						<span style={{
							fontSize: 14,
							fontFamily:'JetBrains-Mono-Regular',
							color: '#fff'
						}}>
							{this.props.zapUpvote ? `ZAP TO UPVOTE${this.state.amount && this.state.invoice ? ` (${this.state.amount} SATS)` : ''}` : 'SEND SATS'}
						</span>
					</div>
					<X
						style={{ color: COLORS.secondaryBright }}
						dimension={mobile ? 24 : 20}
						onClick={this.handleClose}
					/>
				</div>
				{this.renderRecipient()}
				{mobile ? this.renderInvoiceAction() : null}
				{this.renderBody()}
				{!mobile ? this.renderInvoiceAction() : null}
			</Modal>
		);
	};
}

const mapState = ({ nostr, app }) => {

	const zapEvent = nostr.zapEvent || {};
	const zapRequest = nostr.zapRequest || {};
	const recipient = nostr.zapRecipient || {};

	return {
		...zapRequest,
		zapUpvote: nostr.zapUpvote,
		mobile: app.mobile,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		recipientName: recipient.display_name || recipient.name,
		recipientPubkey: recipient.pubkey,
		recipientPicture: recipient.picture,
		relays: Object.keys(nostr.relays || {}),
		zapEvent
	};
};

const styles = {

	inputLabel: {
		color: '#fff',
		height: 20,
		marginBottom: 4,
		fontFamily: 'JetBrains-Mono-Bold',
		fontSize: 11
	},

	container: (state, props) => {

		return {
			border: props.mobile ? 'none' : `1px solid ${COLORS.secondary}`,
			width: props.mobile ? props.clientWidth : (props.zapUpvote ? null : (256 * (state.invoice ? 2 : 1)) + (48 * 2) + (12 * (state.invoice ? 2 : 0))),
			height: props.mobile ? props.clientHeight : null,
			color: '#fff',
			padding: props.mobile ? 24 : '24px 48px',
			background: COLORS.primary,
			transform: props.mobile ? null : 'translate(-50%, -50%)',
			top: props.mobile ? 0 : '50%',
			left: props.mobile ? 0 : '50%',
			...(props.mobile || props.zapUpvote ? {} : transition(0.2, 'ease', [ 'width' ]))
		};
	}
};

export default connect(mapState, { dismissZapRequest })(ZapRequest);
