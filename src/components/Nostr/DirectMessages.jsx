import React, { Component, PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nip04, nip19 } from 'nostr-tools';
import autosize from 'autosize';

import Image from './Image';
import Chevron from '../CommonUI/Chevron';

import { decryptDirectMessage, setActiveDirectMessageChat, receiveDM, getLocalPrivateKey } from '../../actions';
import { transition } from '../../helpers';
import { COLORS, MONTHS } from '../../constants';


class ChatItem extends PureComponent {

	state = { hover: false, width: 0 };

	componentDidMount = () => {

		this.props.handleDecrypt(this.props.recent);

		// setTimeout(() => {
		// 	if (this.props.mobile) {
		// 		window.scrollTo(0, 0);
		// 	}
		// }, 100);

	};

	componentDidUpdate = (prevProps) => {

		if (this.props.recent.content !== prevProps.recent.content) {

			this.props.handleDecrypt(this.props.recent);
		}
	};

	render = () => {

		const { chat, recent, metadata, recentDecrypted } = this.props;

		const _name = () => {
			const encoded = nip19.npubEncode(chat.topic);
			return encoded.slice(0, 8) + '...' + encoded.slice(-4);
		};

		return (
			<div
				key={chat.topic}
				onClick={() => this.props.handleSelectChat(chat)}
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				style={{
					background: this.state.hover ? 'rgba(31, 32, 33, 0.8)' : 'none',
					alignItems: 'center',
					cursor: 'pointer',
					display: 'flex',
					height: 56,
					width: '100%',
					paddingLeft: 12,
					paddingRight: 12
				}}
			>
				{metadata.picture ? (
					<Image
						src={metadata.picture}
						style={{
							height: 36,
							width: 36,
							minWidth: 36,
							borderRadius: 18,
							marginRight: 12
						}}
					/>
				) : (
					<div style={{
						height: 36,
						width: 36,
						minWidth: 36,
						borderRadius: 18,
						marginRight: 12,
						border: `1px solid ${COLORS.secondary}`
					}} />
				)}
				<div style={{
					fontSize: this.props.mobile ? 15 : 13,
					whiteSpace: 'nowrap',
					overflow: 'hidden'
				}}>
					<div style={{
						fontWeight: 'bold',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}>
						{metadata.name || _name()}
					</div>
					<div style={{
						color: COLORS.secondaryBright,
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}>
						{recentDecrypted || recent.content}
					</div>
				</div>
			</div>
		);
	};

}

class Message extends PureComponent {

	componentDidUpdate = (prevProps) => {

		if (!prevProps.decrypted && this.props.decrypted) {

			this.props.scrollContainer.scrollTo({
				top: 9999999,
				behavior: 'smooth'
			});
		}

	};

	renderTimestamp = (t) => {

		//const date = new Date(t * 1000);

		let h = this.props.date.getHours();
		let meridian = 'AM';

		if (h > 12) {
			h = h - 12;
			meridian = 'PM';
		}

		// TODO make 24h time an option

		// if (h < 10) {
		// 	h = '0' + h;
		// }

		const m = '0' + this.props.date.getMinutes();

		return (
			<span style={{
				fontSize: 10,
				marginLeft: 9,
				whiteSpace: 'nowrap',
				color: 'rgba(255,255,255,0.65)',
				float: 'right',
				height: 19,
				display: 'flex',
				lineHeight: '29px'
			}}>
				{h}:{m.substr(-2)} {meridian}
			</span>
		);
	};

	render = () => {

		if (!this.props.decrypted) { return null; }

		const element = (
			<div
				style={{
					display: 'flex',
					justifyContent: this.props.user ? 'right' : 'left',
					marginTop: 6,
					marginBottom: 6,
					lineHeight: '19px'
				}}
			>
				<span style={{
					maxWidth: '80%',
					padding: '7px 10px',
					background: this.props.user ? 'rgba(219, 170, 49, 0.7)' : 'rgba(47, 54, 61, 0.50)',
					borderRadius: 6,
					overflowWrap: 'anywhere'
				}}>
					<span>{this.props.decrypted}</span>
					{this.renderTimestamp(this.props.message.created_at)}
				</span>
			</div>
		);

		const boundaryStyle = {
			height: 56,
			fontSize: 13,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		};

		return (
			<div>
				{this.props.initialBoundary ? (<div
					className='dm_date_boundary'
					style={{ ...boundaryStyle, marginTop: -9 }}
				>
					{this.props.initialBoundary}
				</div>) : null}
				{element}
				{this.props.boundary ? (<div
					className='dm_date_boundary'
					style={boundaryStyle}
				>
					{this.props.boundary}
				</div>) : null}
			</div>
		);
	};
}

class ActiveChat extends PureComponent {

	state = { hover: '', compose: '', scrollingBoundary: null, scrolling: false };

	componentDidMount = () => {

		this.decryptMessages();
		this.getDateBoundaries();

		this.textarea = document.getElementById(`chat_${this.props.chat.topic}`);

		if (this.textarea) {

			autosize(this.textarea);
		}

		this.props.scrollContainer.scrollTo({
			top: 9999999
		});

		this.props.scrollContainer.addEventListener('scroll', this.handleScroll);

		// setTimeout(() => {
		// 	this.setState({ visible: true });
		// }, 200);

	};

	componentWillUnmount = () => {

		this.props.scrollContainer.removeEventListener('scroll', this.handleScroll);
	};

	componentDidUpdate = (prevProps) => {

		if (prevProps.messages.length !== this.props.messages.length) {

			this.decryptMessages();
			this.getDateBoundaries();
		}
	};

	getDateBoundaries = () => {

		//setTimeout(() => {

		this.boundaries = document.getElementsByClassName('dm_date_boundary');

		//console.log('this.boundaries', this.boundaries);

		//}, 1000);

	};

	decryptMessages = () => {

		this.props.handleDecrypt(this.props.messages);
	};

	handleScroll = (e) => {

		//console.log('scrolling', e.srcElement.scrollTop);

		if (!this.state.scrolling) {

			this.setState({ scrolling: true });
		}

		clearTimeout(this.stoppedScrolling);

		this.stoppedScrolling = setTimeout(() => {

			this.setState({ scrolling: false });

		}, 200);

		let scrollingBoundary = null;

		for (let i = 0; i < this.boundaries.length + 1; i++) {

			const boundary = this.boundaries[i];

			let prevBoundary;

			if (boundary) {

				let scrollTop;

				if (this.props.mobile) {
					scrollTop = e.target.scrollingElement.scrollTop;
				} else {
					scrollTop = e.srcElement.scrollTop;
				}

				if (boundary.offsetTop - 100 > scrollTop) {

					prevBoundary = this.boundaries[i - 1];

					if (prevBoundary) {
						scrollingBoundary = prevBoundary.innerHTML;
					}

					break;
				}

			} else {

				prevBoundary = this.boundaries[i - 1];

				if (prevBoundary) {

					scrollingBoundary = prevBoundary.innerHTML;
				}

				break;
			}
		}

		if (scrollingBoundary !== this.state.scrollingBoundary) {

			this.setState({ scrollingBoundary });
		}

	};

	handleSendMessage = () => {

		const { compose } = this.state;

		if (!compose) { return; }

		this.props.handleSendMessage(
			this.props.chat.topic,
			this.state.compose.trim()
		);

		this.setState({ compose: '' });

		this.textarea.style.height = '37px';
	}

	handleKeyDown = (e) => {

		const { key, shiftKey } = e;

		if (!shiftKey && key === 'Enter') {
			e.preventDefault();
			this.handleSendMessage();
		}
	};

	renderScrollingBoundary = () => {

		const { scrollingBoundary, scrolling } = this.state;

		if (!scrollingBoundary) { return null; }

		return (
			<div style={{
				position: 'fixed',
				width: this.props.width - 24,
				top: 116,
				display: 'flex',
				justifyContent: 'center',
			}}>
				<span style={{
					background: 'rgba(47, 54, 61, 0.5)',
					borderRadius: 24,
					padding: '3px 9px',
					opacity: scrolling ? 1 : 0,
					pointerEvents: scrolling ? 'default' : 'none',
					...transition(0.2, 'ease', [ 'opacity' ])
				}}>
					{scrollingBoundary}
				</span>
			</div>
		);

	};

	renderMessages = () => {

		const { messages } = this.props;

		const dates = {};

		for (let message of messages) {

			dates[message.id] = new Date(message.created_at * 1000);
		}

		//const now = new Date();

		const label = (date) => {

			return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
		};

		const boundary = (item, prev, next, index) => {

			if (!next) { return null; }

			//if (!prev && Math.abs(item.created_at - next.created_at) < 86400) { return null; }

			const _item = dates[item.id];
			const _next = dates[next.id];

			const itemY = _item.getFullYear();
			const itemM = _item.getMonth();
			const itemD = _item.getDate();

			const nextY = _next.getFullYear();
			const nextM = _next.getMonth();
			const nextD = _next.getDate();

			if (
				itemY !== nextY ||
				itemM !== nextM ||
				itemD !== nextD
			) {

				//return `${nextD} ${MONTHS[nextM]}`;

				return label(_next);
			}

			return null;
		};

		return messages.sort((a, b) => {

			return a.created_at - b.created_at;

		}).map((message, index) => {

			return (
				<Message
					scrollContainer={this.props.scrollContainer}
					decrypted={this.props.decrypted[message.id] || ''}
					user={message.pubkey === this.props.active}
					message={message}
					key={message.id}
					date={dates[message.id]}
					mobile={this.props.mobile}
					initialBoundary={index === 0 ? label(dates[message.id]) : null}
					boundary={boundary(message, messages[index - 1], messages[index + 1])}
				/>
			);

		});
	};

	render = () => {

		const { chat, width, ready, mobile, metadata } = this.props;

		if (!chat) { return null; }

		const sendActive = this.state.compose.length > 0;

		const encoded = nip19.npubEncode(chat.topic);

		let name, picture;

		if (metadata[chat.topic]) {

			name = metadata[chat.topic].name;
			picture = metadata[chat.topic].picture;
		}

		if (!name) {

			name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
		}

		return (
			<div style={{
				width,
				paddingLeft: 12,
				paddingRight: 12,
				opacity: ready ? 1 : 0,
				transform: ready ? 'none' : 'translate(100%)',
				pointerEvents: ready ? null : 'none'
			}}>
				{this.renderScrollingBoundary()}
				<div style={{
					width: width - 24,
					height: 56,
					display: 'flex',
					alignItems: 'center',
					position: 'fixed',
					background: COLORS.primary,
					justifyContent: 'space-between',
					borderBottom: `1px solid ${COLORS.secondary}`,
				}}>
					<div
						onClick={this.props.handleClose}
						onMouseOver={() => this.setState({ hover: 'back' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							color: this.state.hover === 'back' ? '#fff' : COLORS.secondaryBright,
							fontFamily: 'JetBrains-Mono-Bold',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							fontSize: 12
						}}
					>
						<Chevron
		 					pointing='left'
		 					dimension={12}
		 					style={{
		 						marginTop: -2,
		 						marginRight: 6,
		 						color: this.state.hover === 'back' ? '#fff' : COLORS.secondaryBright
		 					}}
		 				/>
						<span>
							BACK
						</span>
					</div>
					<Link to={`/@${encoded}`}>
						<div style={{
							fontWeight: 'bold',
							color: '#fff'
						}}>
							{name}
						</div>
					</Link>
					<Link to={`/@${encoded}`}>
						{picture ? (
							<Image
								src={picture}
								style={{
									height: 36,
									width: 36,
									minWidth: 36,
									borderRadius: 18
								}}
							/>
						) : (
							<div style={{
								height: 36,
								width: 36,
								minWidth: 36,
								borderRadius: 18,
								border: `1px solid ${COLORS.secondary}`
							}} />
						)}
					</Link>
				</div>
				<div style={{
					whiteSpace: 'normal',
					paddingTop: 62,
					paddingBottom: 54,
					//opacity: this.state.visible ? 1 : 0,
					//...transition(0.2, 'ease', [ 'opacity' ])
				}}>
					{this.renderMessages()}
				</div>
				<div style={{
					width: width - 24,
					height: 56,
					display: 'flex',
					position: 'fixed',
					bottom: 0,
					background: COLORS.primary,
					alignItems: 'end',
					paddingBottom: 10
				}}>
					<textarea
						placeholder='Message'
						id={`chat_${this.props.chat.topic}`}
						onKeyDown={this.handleKeyDown}
						onChange={({ target }) => this.setState({ compose: target.value })}
						rows={1}
						value={this.state.compose}
						style={{
							maxHeight: 100,
							resize: 'none',
							fontFamily: 'Lexend-Deca-Regular',
							fontSize: mobile ? 15 : 13,
							borderRadius: 24,
							paddingLeft: 18,
							paddingRight: 18,
							outline: 'none',
							background: 'rgb(30, 31, 31)',
							width: '100%',
							border: `1px dotted ${COLORS.secondary}`,
							color: '#fff',
							paddingTop: 8,
							paddingBottom: 8,
							lineHeight: '19px'
						}}
					/>
					<div
						onClick={this.handleSendMessage}
						// onMouseOver={() => this.setState({ hover: 'send' })}
						// onMouseOut={() => this.setState({ hover: '' })}
						style={{
							border: `1px solid ${COLORS.secondary}`,
							background: sendActive ? 'rgb(219, 170, 49, 0.8)' : 'rgba(31, 32, 33, 0.8)',
							borderRadius: 24,
							minWidth: 38,
							minHeight: 38,
							height: 38,
							width: 38,
							marginLeft: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							userSelect: 'none',
							cursor: sendActive ? 'pointer' : 'default'
						}}
					>
						<Icon
							name='arrow up'
							style={{
								color: sendActive ? '#fff' : COLORS.secondary,
								fontSize: 22,
								marginRight: 0,
								marginTop: 2
							}}
						/>
					</div>
				</div>
			</div>
		);
	};
}

class DirectMessages extends Component {

	state = { selected: null, width: 0, add: '', hover: '' };

	componentDidMount = () => {

		if (this.props.mobile) {

			this.scrollContainer = window;
			this.setState({ width: document.body.clientWidth });

		} else {

			this.scrollContainer = document.getElementById('sidepanel_scroll_container');
			this.container = document.getElementById('_dm_container');
			this.setState({ width: this.container.clientWidth });
		}
	}

	handleDecrypt = (event) => {

		if (this.props.decrypted[event.id]) { return; }

		this.props.decryptDirectMessage(event, {
			pubkey: this.props.active
		});
	};

	handleAddChange = (e) => {

		const { value } = e.target;

		if (value && value.substring(0, 5) === 'npub1' && value.length === 63) {

			let pubkey;

			try {

				const decoded = nip19.decode(value);

				if (decoded.type === 'npub') {

					pubkey = decoded.data;
				}

			} catch (err) {
				console.log(err);
			}

			if (pubkey) {

				this.props.setActiveDirectMessageChat({
					topic: pubkey,
					messages: []
				});
			}

		} else {

			this.setState({ add: value });
		}
	};

	handleSendMessage = async (pubkey, plaintext) => {

		let ciphertext, event;

		if (window.nostr) {

			try {

				ciphertext = await window.nostr.nip04.encrypt(pubkey, plaintext);

			} catch (err) {
				console.log(err);
			}

		} else {

			ciphertext = await nip04.encrypt(
				getLocalPrivateKey(),
				pubkey,
				plaintext
			);
		}

		if (!ciphertext) { return; }

		try {

			event = await window.client.createEvent({
				content: ciphertext,
				kind: 4,
				tags: [
					[ 'p', pubkey ]
				]
			}, {
				privateKey: getLocalPrivateKey()
			});

		} catch (err) {
			console.log(err);
		}

		this.props.receiveDM(event);

		window.client.publishEvent(event);

	};

	renderChatList = () => {

		const { activeChat, activeChatReady, mobile, messages, decrypted } = this.props;

		const decryptedIds = Object.keys(decrypted);

		return activeChatReady ? null : (
			<div style={{
				opacity: activeChat ? 0 : 1,
				transform: activeChat ? 'translate(-100%)' : 'none',
				pointerEvents: activeChat ? 'none' : 'default',
				paddingTop: 56,
				...transition(0.1, 'ease', mobile ? [ 'opacity', 'transform' ] : [ 'opacity' ])
			}}>
				{this.props.chats.filter((chat, index) => {

					return index <= decryptedIds.length;

				}).map(chat => {

					//console.log('MESSAGES', messages);

					const _messages = messages.filter(item => {
						return item.topic === chat.topic;
					}).map(item => {
						return item.data;
					}).sort((a, b) => {
						return a.created_at - b.created_at;
					});

					const recent = _messages[_messages.length - 1];

					return {
						messages: _messages,
						topic: chat.topic,
						chat: chat,
						recent
					};

				}).sort((a, b) => {

					return b.recent.created_at - a.recent.created_at;

				}).map(item => {

					return (
						<ChatItem
							key={item.topic}
							chat={item.chat}
							mobile={this.props.mobile}
							metadata={this.props.metadata[item.topic] || {}}
							recentDecrypted={this.props.decrypted[item.recent.id]}
							handleDecrypt={this.handleDecrypt}
							handleSelectChat={this.props.setActiveDirectMessageChat}
							messages={item.messages}
							recent={item.recent}
						/>
					);
				})}
			</div>
		);
	};

	renderListHeader = () => {

		const { newChat, width } = this.state;

		return (
			<div style={{
				width,
				paddingLeft: 12,
				paddingRight: 12,
				height: 56,
				display: 'flex',
				alignItems: 'center',
				position: 'fixed',
				background: COLORS.primary,
				justifyContent: 'space-between',
				fontSize: 12,
				fontFamily: 'JetBrains-Mono-Regular'
			}}>
				{newChat ? (
					<input
						onChange={this.handleAddChange}
						value={this.state.add}
						placeholder='copy/paste npub'
						style={{
							height: 36,
							width: '100%',
							background: 'rgba(31, 32, 33, 0.8)',
							outline: 'none',
							border: 'none',
							color: '#fff',
							fontSize: 12,
							borderRadius: 18,
							paddingLeft: 18,
							paddingRight: 18,
							marginRight: 12,
							fontFamily: 'JetBrains-Mono-Regular'
						}}
					/>
				) : (
					<div style={{
						color: COLORS.secondaryBright
					}}>
						CONVERSATIONS ({this.props.chats.length})
					</div>
				)}
				<div
					onClick={() => this.setState({ newChat: !newChat })}
					onMouseOver={() => this.setState({ hover: 'new' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={{
						marginRight: 4,
						fontSize: 12,
						cursor: 'pointer',
						opacity: this.state.hover === 'new' ? 1 : 0.85,
						fontFamily: 'JetBrains-Mono-Regular',
						color: newChat ? '#fff' : COLORS.satelliteGold
					}}
				>
					{newChat ? null : (<Icon name='edit outline' />)}
					<span>{newChat ? 'CANCEL' : 'NEW CHAT'}</span>
				</div>
			</div>
		);
	};

	render = () => {

		return (
			<div
				id='_dm_container'
				style={{
					width: '100%',
					color: '#fff',
					fontSize: this.props.mobile ? 15 : 13
				}}
			>
				{this.renderListHeader()}
				{this.renderChatList()}
				{this.props.activeChat ? (<ActiveChat
					scrollContainer={this.scrollContainer}
					chat={this.props.activeChat}
					width={this.state.width}
					clientHeight={this.props.clientHeight}
					ready={this.props.activeChatReady}
					active={this.props.active}
					mobile={this.props.mobile}
					metadata={this.props.metadata}
					decrypted={this.props.decrypted}
					handleDecrypt={this.handleDecrypt}
					handleClose={() => this.props.setActiveDirectMessageChat(null)}
					handleSendMessage={this.handleSendMessage}
					messages={this.props.messages.filter(item => {
						return item.topic === this.props.activeChat.topic;
					}).map(item => {
						return item.data;
					})}
				/>) : null}
			</div>
		);
	};
}

const mapState = ({ app, dm }) => {

	return {
		mobile: app.mobile,
		active: dm.active,
		clientHeight: app.clientHeight,
		metadata: dm.metadata,
		decrypted: dm.decrypted,
		activeChat: dm.activeChat,
		activeChatReady: dm.activeChatReady,
		messages: dm.messages,
		chats: Object.keys(dm.chats).map(topic => {

			return {
				topic
			};
		})
	};
};

export default connect(mapState, { decryptDirectMessage, setActiveDirectMessageChat, receiveDM })(DirectMessages);
