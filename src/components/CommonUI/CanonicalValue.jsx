import React, { PureComponent } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

import { COLORS } from '../../constants';


class CanonicalValue extends PureComponent {

	state = { hover: '', copying: false, showCopiedLabel: false };

	constructor (props) {
		super(props);
		this.value = React.createRef();
	}

	componentWillUnmount = () => {

		clearTimeout(this._resetCopiedLabel);
	};

	handleCopy = () => {

		const exexCopy = () => {

			let copied;

			if (!this.props.disableFocusOnCopy) {

				this.value.current.focus();
			}

			this.value.current.select();

			try {

				document.execCommand('copy');

				copied = true;

			} catch (err) {

				this.value.current.blur();
				window.getSelection().empty();
			}

			if (copied && !this.state.showCopiedLabel) {

				if (this.props.copyAnimation !== false) {
					this.setState({ showCopiedLabel: true });
				}

				this._resetCopiedLabel = setTimeout(() => {

					this.setState({ showCopiedLabel: false, copying: false });
					this.value.current.blur();
					window.getSelection().empty();

				}, 400);
			}
		};

		if (this.props.hidden) {
			this.setState({ copying: true });
			setTimeout(exexCopy, 150);
		} else {
			exexCopy();
		}
	};

	render = () => {

		const { label, value, copiable, linkToExternal, linkToInternal, qr, style, actionPosition } = this.props;
		const { hover } = this.state;

		let valueInner = null;

		if (linkToInternal || linkToExternal) {

			const linkElement = (
				<input
					onMouseOver={() => this.setState({ hover: 'link' })}
					onMouseOut={() => this.setState({ hover: '' })}
					ref={this.value}
					style={{ ...styles.value, color: COLORS.blue, opacity: hover === 'link' ? 1 : 0.85, cursor: 'pointer' }}
					value={value}
					readOnly
				/>
			);

			valueInner = linkToInternal ? (
				<Link to={linkToInternal}>
					{linkElement}
				</Link>
			) : (
				<a
					href={linkToExternal}
					target='_blank'
				>
					{linkElement}
				</a>
			);

		} else {

			valueInner = (
				<input
					onMouseOver={() => this.setState({ hover: 'input' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onFocus={() => this.setState({ focus: true })}
					onBlur={() => this.setState({ focus: false })}
					ref={this.value}
					style={styles.value}
					value={this.props.hidden && !this.state.copying && !this.state.focus ? ('•').repeat(value.length) : value}
					//value={value}
					readOnly
				/>
			);
		}

		const valueElement = (
			<div style={{ width: '100%' }}>
				{valueInner}
			</div>
		);

		// const valueElement = (
		// 	<div style={{ width: '90%' }}>
		// 		{typeof value !== 'undefined' ? (linkTo ? (
		// 			<Link
		// 				to={linkToInternal}
		// 				//href={linkTo}
		// 				// onClick={linkToInternal ? (e) => {

		// 				// 	// If 'linkToInternal' is present, override the
		// 				// 	// hyperlink behavior to navigate internally
		// 				// 	// so the entire page doesn't have to reload
		// 				// 	e.preventDefault();
		// 				// 	//this.props.navigate(linkToInternal);

		// 				// } : undefined}
		// 			>
		// 				<input
		// 					onMouseOver={() => this.setState({ hover: 'link' })}
		// 					onMouseOut={() => this.setState({ hover: '' })}
		// 					ref={this.value}
		// 					style={{ ...styles.value, color: COLORS.blue, opacity: hover === 'link' ? 1 : 0.85, cursor: 'pointer' }}
		// 					value={value}
		// 					readOnly
		// 				/>
		// 			</Link>
		// 		) : (
		// 			<input
		// 				ref={this.value}
		// 				style={styles.value}
		// 				value={value}
		// 				readOnly
		// 			/>
		// 		)) : null}
		// 	</div>
		// );

		return (
			<div style={styles.container(style, actionPosition)}>
				{typeof label !== 'undefined' ? (<span style={{ ...styles.label, ...(this.props.labelStyle || {}) }}>{label}</span>) : null}
				{actionPosition !== 'left' ? valueElement : null}
				<div style={{
					minWidth: actionPosition === 'left' ? null : (qr && copiable ? 54 : 36),
					justifyContent: actionPosition === 'left' ? 'left' : 'right',
					display: 'flex'
				}}>
					{qr ? (
						<Popup
							on={[ 'click' ]}
							style={{ background: '#fff', filter: 'none', zIndex: 9999 }}
							position='top center'
							hideOnScroll
							content={(
								<QRCode
									style={{ backdropFilter: 'none', filter: 'none' }}
									value={this.props.value}
									fgColor={COLORS.primary}
									size={this.props.qrsize}
								/>
							)}
							trigger={(
								<div
									style={styles.action(hover === 'qr', actionPosition)}
									onMouseOver={() => this.setState({ hover: 'qr' })}
									onMouseOut={() => this.setState({ hover: '' })}
								>
									<Icon
										name='qrcode'
										style={{ marginRight: 0 }}
									/>
								</div>
							)}
						/>
					) : null}
					{copiable ? (
						<div
							style={styles.action(hover === 'copy' || this.state.showCopiedLabel, actionPosition)}
							onMouseOver={() => this.setState({ hover: 'copy' })}
							onMouseOut={() => this.setState({ hover: '' })}
							onClick={this.handleCopy}
						>
							{this.state.showCopiedLabel ? <div style={styles.copiedLabel}>copied!</div> : null}
							<Icon
								name='copy outline'
								style={{ marginRight: 0 }}
							/>
						</div>
					) : null}
				</div>
				{actionPosition === 'left' ? valueElement : null}
			</div>
		);
	};
}

const styles = {

	container: (style = {}, actionPosition) => {
		return {
			fontFamily: 'JetBrains-Mono-Regular',
			//background: 'rgba(255,255,255,0.025)',
			background: 'rgba(47,54,61,0.25)',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			padding: 12,
			display: 'flex',
			color: '#fff',
			//justifyContent: actionPosition === 'left' ? 'left' : 'right',
			...style
		};
	},

	label: {
		color: COLORS.satelliteGold,
		marginRight: 12,
		userSelect: 'none'
	},

	value: {
		outline: 'none',
		color: '#fff',
		border: 'none',
		width: '100%',
		background: 'transparent',
		fontFamily: 'JetBrains-Mono-Regular'
	},

	action: (active, actionPosition) => {
		return {
			width: 14,
			marginLeft: actionPosition === 'left' ? 0 : 6,
			marginRight: actionPosition === 'left' ? 6 : 0,
			cursor: 'pointer',
			textAlign: 'right',
			userSelect: 'none',
			opacity: active ? 1 : 0.85
		};
	},

	copiedLabel: {
		color: '#fff',
		padding: '4px 8px',
		background: COLORS.blue,
		//border: `1px solid ${COLORS.secondary}`,
		position: 'absolute',
		transform: 'translate(-24px, -26px)',
		fontSize: 11,
		borderRadius: 12,
		lineHeight: '11px',
		fontFamily: 'JetBrains-Mono-Bold'
	}

};

export default CanonicalValue;
