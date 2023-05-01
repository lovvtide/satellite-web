import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { X } from '../CommonUI';
import Modal from './Modal';
import NewPostEditor from './NewPostEditor';

import { setNewPostModalOpen, handleNostrPublish } from '../../actions';
import svgtransmit from '../../assets/transmit.svg';
import { COLORS } from '../../constants';


class NewPostModal extends PureComponent {

	componentDidMount = () => {

		this.editor = document.getElementById('compose_new_editor_modal');

		if (this.editor) {

			this.editor.focus();
		}
	};

	handlePost = (post) => {

		handleNostrPublish(post);
	};

	handleClose = () => {

		this.props.setNewPostModalOpen(false);
	}

	render = () => {

		const { pubkey, open } = this.props;

		if (!open) { return null; }

		return (
			<Modal
				handleClose={this.handleClose}
				clientHeight={this.props.clientHeight}
				clientWidth={this.props.clientWidth}
				style={{
					padding: '24px 48px 36px 48px',
					width: 610,
					background: COLORS.primary,
					border: `1px solid ${COLORS.secondary}`,
					transform: 'translate(-50%, -50%)',
					top: '50%'
				}}
			>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 24,
					marginLeft: -24,
					marginRight: -24
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center'
					}}>
						<img
							style={{ marginRight: 8, marginTop: -2, opacity: 0.25 }}
							src={svgtransmit}
							height={20}
							width={20}
						/>
						<span style={{
							fontSize: 14,
							opacity: 0.25,
							fontFamily:'JetBrains-Mono-Regular',
							color: '#fff'
						}}>
							NEW POST
						</span>
					</div>
					<X
						style={{ color: COLORS.secondaryBright }}
						dimension={20}
						onClick={this.handleClose}
					/>
				</div>
				<NewPostEditor
					editorId='compose_new_editor_modal'
					handlePost={this.handlePost}
					onCancel={this.handleClose}
					onResolve={this.handleClose}
					author={{
						pubkey,
						...(this.props.metadata[pubkey] || {})
					}}
				/>
			</Modal>
		);
	};
}

const mapState = ({ app, nostr }) => {

	return {
		open: app.newPostModalOpen,
		pubkey: nostr.pubkey,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		metadata: nostr.metadata || {}
	};
};

export default connect(mapState, { setNewPostModalOpen })(NewPostModal);
