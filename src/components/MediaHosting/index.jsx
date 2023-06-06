import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { COLORS } from '../../constants';
import { transition } from '../../helpers';
import { setLocalPublicKey, loadActiveNostr, viewSidePanel, navigate } from '../../actions';

import star from '../../assets/star_solid.svg';
import transmit from '../../assets/transmit.svg';

import { Chevron } from '../CommonUI';


class MediaHosting extends PureComponent {

	state = { headline: '', showbullet: 0, showcta: false };

	componentDidMount = () => {

		const headline = 'SCALABLE MEDIA HOSTING FOR THE NOSTR ECOSYSTEM';

		let c = 0;

		this._type = setInterval(() => {

			const char = headline[c];

			this.setState({
				//headline: this.state.headline + headline[c]
				headline: headline.substring(0, c)
			});

			c++; // no pun intended

			if (typeof char === 'undefined') {

				clearInterval(this._type);

				setTimeout(() => {

					this._bullet = setInterval(() => {

						if (this.state.showbullet > 5) {
							clearInterval(this._bullet);
							return;
						}

						this.setState({
							showbullet: this.state.showbullet + 1
						});

					}, 200);

					setTimeout(() => {

						this.setState({
							showcta: true
						});

					}, 1400);

				}, 400);

				this.setState({ headline });

				return;
			}

		}, 25);
	};

	handleCtaClicked = async () => {

		if (this.props.pubkey) {

			this.props.viewSidePanel('media');

		} else {

			if (window.nostr) {

				let pubkey;

				try {

					pubkey = await window.nostr.getPublicKey();

				} catch (err) {}

				if (!pubkey) { return; }

				setLocalPublicKey(pubkey);

				this.props.loadActiveNostr(() => {
					this.props.viewSidePanel('media');
				});

			} else {

				this.props.navigate('/register');
			}
		}
	};

	render = () => {

		const { mobile } = this.props;

		return (
			<div style={{
				color: '#fff',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: this.props.clientHeight,
				width: this.props.clientWidth,
				marginTop: mobile ? -12 : -48
			}}>
				<div style={{
					paddingTop: mobile ? null : 48,
					paddingBottom: 48,
					...(mobile ? {
						position: 'absolute',
						top: 72
					} : {})
				}}>
					<div style={{
						color: COLORS.satelliteGold,
						fontFamily: 'JetBrains-Mono-Bold',
						marginLeft: 2,
						display: 'flex',
						alignItems: 'center'
					}}
					>
						<img
							style={{ height: 22 }}
							src={transmit}
						/>
						<span
							style={{
								height: 18,
								marginLeft: 8
							}}
						>
							CDN.SATELLITE.EARTH
						</span>
					</div>
					<div style={{
						fontSize: 48,
						height: mobile ? null : 108,
						marginBottom: 48,
						width: this.props.maxWidth,
						lineHeight: '54px',
						fontFamily: 'JetBrains-Mono-Bold',
						margin: '8px auto 28px auto'
					}}>
						{this.state.headline}
					</div>
					<div style={{
						maxWidth: this.props.maxWidth,
						margin: 'auto',
						paddingLeft: mobile ? 0 : 8
					}}>
						<div style={styles.bullet(this.state, 1)}>
							<img src={star} style={styles.star} />
							<div style={styles.bulletText}>
								Upload video and other large files, up to 5 GB each
							</div>
						</div>
						<div>
						<div style={styles.bullet(this.state, 2)}>
							<img src={star} style={styles.star} />
							<div style={styles.bulletText}>
								Simple flat-rate pricing, buy storage with sats
							</div>
						</div>
						</div>
						<div style={styles.bullet(this.state, 3)}>
							<img src={star} style={styles.star} />
							<div style={styles.bulletText}>
								Fast, free and unlimited data transfer
							</div>
						</div>
						<div style={styles.bullet(this.state, 4)}>
							<img src={star} style={styles.star} />
							<div style={styles.bulletText}>
								Integrated NIP-94 censorship resistance
							</div>
						</div>
						<div style={styles.bullet(this.state, 5)}>
							<img src={star} style={styles.star} />
							<div style={styles.bulletText}>
								Developer-friendly API (<a style={{ color: '#fff', textDecoration: 'underline' }} href="https://github.com/lovvtide/satellite-web/blob/master/docs/cdn.md" target='_blank'>read the docs</a>)
							</div>
						</div>
					</div>
					<div
						onMouseOver={() => this.setState({ hover: 'cta' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onClick={this.handleCtaClicked}
						style={{
							opacity: !this.state.showcta ? 0 : (mobile || this.state.hover === 'cta' ? 1 : 0.85),
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 13,
							border: `1px solid #fff`,
							fontFamily: 'JetBrains-Mono-Bold',
							height: 36,
							color: '#fff',
							userSelect: 'none',
							borderRadius: 5,
							width: 100,
							marginTop: 40,
							...transition(2, 'ease', [ 'opacity' ])
						}}
					>
						<span style={{ height: 19 }}>TRY IT</span>
						<Chevron
							pointing='right'
							dimension={8}
							style={{
								marginLeft: 8,
								color: '#fff'
							}}
						/>
					</div>
				</div>
			</div>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		clientWidth: app.clientWidth,
		clientHeight: app.clientHeight,
		mobile: app.mobile,
		maxWidth: Math.min(app.clientWidth - 48, 820),
		pubkey: nostr.pubkey
	};
};

const styles = {

	star: {
		height: 14,
		width: 14,
		marginRight: 10,
		marginTop: 3,
	},

	bullet: ({ showbullet }, z) => {
		return {
			display: 'flex',
			alignItems: 'top',
			fontSize: 14,
			marginBottom: 12,
			fontWeight: 'bold',
			color: 'rgba(255,255,255,0.85)',
			opacity: showbullet >= z ? 1 : 0,
			...transition(2, 'ease', [ 'opacity' ])
		};
	}

};

export default connect(mapState, { loadActiveNostr, viewSidePanel, navigate })(MediaHosting);
