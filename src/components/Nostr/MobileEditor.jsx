import React, { PureComponent } from 'react';

import MD from '../common/MD';

import Author from './Author';
import Editor from './Editor';

import { COLORS } from '../../constants';
import { transition } from '../../helpers';



class MobileEditor extends PureComponent {

	state = { visible: false, scrollTop: 0, focused: false };

	componentDidMount = () => {

		this.container = document.getElementById('mobile_editor_container');

	};

	componentDidUpdate = (prevProps, prevState) => {

		if (prevProps.open) {

			if (!this.props.open) {

				document.body.style['touch-action'] = 'auto';
				document.body.style['overflow-y'] = 'auto';
				document.body.style['position'] = 'relative';
				document.body.style['bottom'] = 'unset';
				document.body.style['right'] = 'unset';
				document.body.style['top'] = 'unset';
				document.body.style['left'] = 'unset';

				document.documentElement.scrollTop = this.state.initialScroll;

				this._setHidden = setTimeout(() => {

					this.setState({ visible: false });

				}, 50);
			}

		} else {

			if (this.props.open) {

				this.setState({
					initialScroll: document.documentElement.scrollTop
				});

				document.body.style['touch-action'] = 'none';
				document.body.style['overflow-y'] = 'hidden';
				document.body.style['position'] = 'fixed';
				document.body.style['bottom'] = 0;
				document.body.style['right'] = 0;
				document.body.style['top'] = 0;
				document.body.style['left'] = 0;

				if (this.props.replyTo) {

					// Scroll to the bottom
					this.container.scrollTop = 99999999;
				}

				this._setVisible = setTimeout(() => {

					this.setState({ visible: true });

					const editor = document.getElementById('compose_new_editor');

					if (editor) {

						editor.select();

						if (window.getSelection) {

							window.getSelection().empty();
						}
						
					}

				}, 50);
			}
		}
	};

	componentWillUnmount = () => {

		clearTimeout(this._setHidden);
		clearTimeout(this._setVisible);
	};

	handleBodyScroll = (e) => {

		e.preventDefault();

		if (!this.props.open) { return; }

		this.setState({ scrollTop: document.documentElement.scrollTop });
	};

	handlePost = async (post) => {

		await this.props.handlePost(post, this.props.replyTo);

		this.props.onResolve();
	};

	profile = (pubkey, props = {}) => {

		const p = props[pubkey] || {};

		return {
			name: p.name,
			displayName: p.display_name,
			picture: p.picture
		};
	};

	renderReplyTo = () => {

		const { replyTo } = this.props;

		if (!replyTo) { return null; }

		const { pubkey } = replyTo.event;
		const metadata = this.props.feed.metadata[pubkey] || {};
		const profile = metadata.profile || {};

		return (
			<div style={{
				marginBottom: 11
			}}>
				<Author
					mobileEditor
					mobile
					pubkey={replyTo.event.pubkey}
					name={profile.name}
					displayName={profile.display_name}
					picture={profile.picture}
				/>
				<div style={{
					borderLeft: `1px solid ${COLORS.secondary}`,
					paddingLeft: 26,
					paddingRight: 12,
					marginLeft: 11.5,
					marginTop: 10
				}}>
					<div style={{
						transform: 'translate(0px, -10px)'
					}}>
						<MD
							mentions={this.props.metadata || {}}
							tags={replyTo.event.tags}
							paragraphStyle={{ 'font-size': '15px', 'line-height': '22px' }}
							markdown={replyTo.event.content}
							comment
						/>
					</div>
				</div>
			</div>
		);
	};

	render = () => {

		return (
			<div
				id='mobile_editor_container'
				style={styles.container(this.props, this.state)}
			>
				{this.renderReplyTo()}
				{this.props.author ? (<Author
					mobileEditor
					mobile
					highlight
					pubkey={this.props.author.pubkey}
					{ ...this.profile(this.props.author.pubkey, this.props.metadata) }
				/>) : null}
				<Editor
					mobile
					style={{ marginTop: this.props.replyTo ? 0 : 12 }}
					replyTo={this.props.replyTo}
					rows={this.props.replyTo ? 12 : 24}
					id='compose_new_editor'
					placeholder={this.props.replyTo ? 'Type your reply . . .' : 'Say something . . .'}
					onCancel={this.props.onCancel}
					handlePost={this.handlePost}
					clientWidth={this.props.clientWidth}
					showCancel
				/>
			</div>
		);
	};
}

const styles = {

	container: ({ clientHeight, clientWidth, open }, { visible }) => {
		return {
			padding: '72px 24px 24px 24px',
			display: open ? 'initial' : 'none',
			position: open ? 'fixed' : 'absolute',
			height: clientHeight,
			width: clientWidth,
			zIndex: 9999,
			background: COLORS.primary,
			top: visible ? 0 : clientHeight,
			left: 0,
			opacity: visible ? 1 : 0,
			overflowX: 'hidden',
			overscrollBehavior: 'none',
			userSelect: 'none',
			...transition(0.2, 'ease', [ 'top', 'opacity' ])
		};
	}

};

export default MobileEditor;
