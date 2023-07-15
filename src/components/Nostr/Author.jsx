import React, { PureComponent } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { nip05, nip19 } from 'nostr-tools';

import { InfoBox } from '../CommonUI';
import MD from '../common/MD';
import Image from './Image';
import FollowButton from './FollowButton';
import NIP05 from './NIP05';

import verified from '../../assets/star_white.svg';
import { COLORS } from '../../constants';


class Author extends PureComponent {

	state = { hover: '', infoTrigger: null, verifiedNIP05: false };

	componentWillUnmount = () => {
		clearTimeout(this._hover);
		clearTimeout(this._hoverout);
	};

	handleOpenInfo = (e) => {

		e.stopPropagation();

		this.setState({ hover: 'author' });

		clearTimeout(this._hover);

		const exec = async () => {

			let verifiedNIP05 = false;

			const { pubkey, nip05 } = this.props;

			if (this.props.infoHover) {

				const el = document.getElementById(`trigger_${this.props.infoTriggerId}`);

				if (!el) { return; }

				const rect = el.getBoundingClientRect();

				this.setState({ infoTrigger: rect });
			}

			if (!this.state.verifiedNIP05) {

				if (pubkey && nip05) {

					try {

						const info = await nip05.queryProfile(nip05);

						verifiedNIP05 = (pubkey === info.pubkey);

					} catch (err) {}
				}

				this.setState({ verifiedNIP05 });
			}
		};

		if (this.props.mobile) {

			exec();

		} else {

			this._hover = setTimeout(async () => { exec(); }, 333);
		}
	};

	profileLink = () => {

		return `/@${nip19.npubEncode(this.props.pubkey)}`;
	};

	renderName = () => {

		let name = this.props.display_name || this.props.displayName || this.props.name;
		let npub;

		if (!name && this.props.pubkey) {

			// Workaround to prevent crash caused by another
			// client improperly encodings pubkey in p tag
			if (this.props.pubkey.indexOf('npub1') === 0) {
				return '';
			}

			const encoded = nip19.npubEncode(this.props.pubkey);
			name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
			npub = true;
		}

		return { name, npub };
	};

	renderAuthorInfo = () => {

		if (!this.state.infoTrigger) { return null; }

		const { name } = this.renderName();

		return (
			<InfoBox
				handleDoubleTap={this.props.mobile ? (() => this.props.navigate(this.profileLink())) : undefined}
				onMouseOver={() => { clearTimeout(this._hoverout); }}
				yShiftDown={12}
				uniqueid={this.props.infoTriggerId}
				triggerWidth={this.state.infoTrigger.width}
				triggerX={this.state.infoTrigger.x}
				triggerY={this.state.infoTrigger.y}
				onClose={immediate => {
					clearTimeout(this._hover);
					clearTimeout(this._hoverout);
					if (immediate || this.props.mobile) {
						this.setState({ infoTrigger: null });
					} else {
						this._hoverout = setTimeout(() => {
							this.setState({ infoTrigger: null });
						}, 333);
					}
				}}
				height={this.props.mobile ? 240 : 218}
				width={500}
				margin={this.props.mobile ? 7 : 14}
				style={{
					color: '#fff',
					fontSize: 12,
					paddingLeft: 18,
					paddingRight: 18,
					fontFamily: 'JetBrains-Mono-Regular',
					cursor: 'default'
				}}
			>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					height: 218
				}}>
					<div>
						<Link onClick={e => e.stopPropagation()} to={this.profileLink()}>
							<Image
								src={this.props.picture}
								style={{
									marginTop: this.props.mobile ? -65 : -36,
									height: this.props.mobile ? 108 : 142,
									width: this.props.mobile ? 108 : 142,
									minWidth: this.props.mobile ? 108 : 142,
									padding: 1,
									border: `1px solid ${this.state.hover === 'info_image' ? '#fff' : COLORS.secondary}`,
									borderRadius: 80,
									marginRight: 19
								}}
							/>
						</Link>
						{this.props.mobile ? (
							<div style={{
								display: 'flex',
								justifyContent: 'center',
								marginRight: 19,
								marginBottom: -32,
								marginTop: 12
							}}>
								<FollowButton
									active={this.props.active}
									style={{ maxWidth: 'fit-content', height: 26 }}
									following={this.props.following}
									onClick={(follow) => this.props.handleFollow(this.props.pubkey, follow)}
								/>
							</div>
						) : null}
					</div>
					<div style={{
						height: this.props.mobile ? 168 : 156,
						fontFamily: 'Lexend-Deca-Regular',
						width: '100%',
						marginTop: this.props.mobile ? -24 : -42
					}}>
						<div style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							height: 36,
							marginBottom: this.props.nip05 ? 0 : 4
						}}>
							<div style={{
								fontSize: 16,
								fontWeight: 'bold',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								maxWidth: this.props.mobile ? 184 : (this.props.following ? 200 : 225),
								paddingBottom: 2,
								paddingTop: 2
							}}>
								<Link to={this.profileLink()}>
									<span
										onMouseOver={() => this.setState({ hover: 'info_name' })}
										onMouseOut={() => this.setState({ hover: '' })}
										style={{
											color: '#fff',
											textDecoration: this.state.hover === 'info_name' ? 'underline' : 'none'
										}}
									>
										{name}
									</span>
								</Link>
							</div>
							{!this.props.mobile ? (<FollowButton
								active={this.props.active}
								following={this.props.following}
								onClick={(follow) => this.props.handleFollow(this.props.pubkey, follow)}
							/>) : null}
						</div>
						{this.props.nip05 ? (
							<div style={{
								color: COLORS.secondaryBright,
								fontSize: 13,
								lineHeight: '18px',
								marginBottom: 8,
								display: 'flex',
								alignItems: 'center',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								maxWidth: this.props.mobile ? 180 : 225
							}}>
								{this.state.verifiedNIP05 ? (
									<Popup
										style={{
											zIndex: 99999999,
											filter: 'invert(85%)',
											boxShadow: 'none',
											fontSize: 12,
											color: '#000'
										}}
										content='NIP-05 identifier was verified'
										position='top center'
										trigger={(
											<img
												src={verified}
												style={{
													height: 14,
													width: 14,
													marginRight: 4
												}}
											/>
										)}
									/>
									) : null}
								<span style={{
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									maxWidth: this.props.mobile ? 180 : 225
								}}>
									<NIP05
										style={{ color: COLORS.secondaryBright }}
										value={this.props.nip05}
									/>
								</span>
							</div>
						) : null}
						<div style={{
							fontSize: 13,
							paddingRight: 18,
						}}>
							{this.props.about ? (
								<MD
									//style={{ overflowY: 'scroll' }}
									markdown={this.props.about}
									paragraphStyle={{
										'overflow-wrap': 'anywhere',
										'font-size': '13px',
										'white-space': 'normal',
										'margin-bottom': 0,
										'line-height': '20px'
									}}
									lineClamp={this.props.mobile ? 5 : 6}
									comment
								/>
							) : (
								<div style={{
									fontSize: 13,
									color: COLORS.secondaryBright,
									whiteSpace: 'initial',
									fontStyle: 'italic',
									lineHeight: '17px'
								}}>
									Bio was not found for this account
								</div>
							)}
						</div>
					</div>
				</div>
				{this.props.mobile ? (
					<div style={{
						height: 20,
						display: 'flex',
						alignItems: 'center',
						marginTop: -20,
						justifyContent: 'right',
						fontSize: 12,
						fontFamily: 'JetBrains-Mono-Regular'
					}}>
						<Link to={this.profileLink()}>
							<div>
								<span style={{ color: COLORS.satelliteGold, }}>VIEW PROFILE</span>
								<Icon name='chevron right' style={{ color: COLORS.satelliteGold, marginRight: 0, marginLeft: 4 }} />
							</div>
						</Link>
					</div>
				) : null}
			</InfoBox>
		);
	};

	render = () => {

		if (!this.props.pubkey) { return null; }

		const { name, npub } = this.renderName();

		const element = (
			<div
				id={this.props.mobile ? `mobile_trigger_${this.props.infoTriggerId}` : undefined}
				onClick={this.props.mobile ? this.handleOpenInfo : undefined}
				onMouseOver={this.props.mobile ? undefined : this.handleOpenInfo}
				onMouseOut={this.props.mobile ? undefined : (() => {
					clearTimeout(this._hover);
					clearTimeout(this._hoverout);
					this.setState({ hover: '' });
					this._hoverout = setTimeout(() => {
						this.setState({ infoTrigger: null });
					}, 333);
				})}
				style={{
					display: 'flex',
					alignItems: 'center',
					cursor: 'pointer'
				}}
			>
				{this.props.hideImage ? null : (<Image
					id={this.props.infoTriggerId ? `trigger_${this.props.infoTriggerId}` : undefined}
					src={this.props.picture}
					style={styles.picture(this.props)}
				/>)}
				<div id={this.props.infoTriggerId && this.props.hideImage ? `trigger_${this.props.infoTriggerId}` : undefined} style={styles.name(this.props, this.state, npub)}>
					<div>{name}</div>
					{this.props.bioText && this.props.about ? (
						<div style={{
							fontSize: 13,
							color: COLORS.secondaryBright,
							fontFamily: 'Lexend-Deca-Regular',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							width: '80%',
							textDecoration: 'none'
						}}>
							{this.props.about}
						</div>
					) : null}
				</div>
			</div>
		);

		return (
			<div>
				{this.props.mobile ? element : (
					<Link onClick={e => e.stopPropagation()} to={this.profileLink()}>
						{element}
					</Link>
				)}
				{this.renderAuthorInfo()}
			</div>
		);
	};
}

const styles = {

	name: ({ highlight, mobileEditor, modal }, { hover }, npub) => {
		return {
			fontSize: mobileEditor || modal ? 14 : 12,
			marginRight: 12,
			fontFamily: npub ? 'JetBrains-Mono-Regular' : 'Lexend-Deca-Regular',
			fontWeight: 'bold',
			transform: 'translate(0px, -1px)',
			textDecoration: hover === 'author' ? 'underline' : 'none',
			color: highlight ? COLORS.satelliteGold : '#fff'
		};
	},

	picture: ({ mobileEditor, imageStyle }) => {
		return {
			transform: 'translate(0px, -1px)',
			height: mobileEditor ? 30 : 24,
			width: mobileEditor ? 30 : 24,
			border: `1px dotted ${COLORS.secondary}`,
			borderRadius: 16,
			marginRight: 10,
			...(imageStyle || {})
		};
	}

};

export default Author;
